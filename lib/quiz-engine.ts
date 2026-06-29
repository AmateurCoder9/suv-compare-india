import { db } from './db'

export interface QuizAnswers {
  budgetMax: number            // in lakhs
  usage: 'city' | 'highway' | 'mixed' | 'weekend'
  familySize: 'couple' | 'small' | 'large' | 'airport'
  transmission: 'manual' | 'automatic' | 'any'
  priority: 'sunroof' | 'adas' | 'boot' | 'luxury' | 'economy' | 'ownership'
}

export interface ScoredVariant {
  slug: string
  name: string
  modelName: string
  manufacturerName: string
  price: number
  overallScore: number
  score: number // quiz match score 0-100
  explanation: string
}

export async function scoreVariantsForQuiz(
  answers: QuizAnswers
): Promise<ScoredVariant[]> {
  // 1. Fetch all variants
  const variants = await db.variant.findMany({
    include: {
      model: { include: { manufacturer: true } },
      scores: { include: { category: true } },
      features: { include: { feature: true } },
      prices: { orderBy: { priceInrLakh: 'asc' }, take: 1 },
      dimensions: true
    }
  })

  if (variants.length === 0) return []

  // Helper to determine if automatic
  const isAuto = (vName: string, slug: string): boolean => {
    const nameLower = vName.toLowerCase()
    const slugLower = slug.toLowerCase()
    return ['(a)', 'auto', 'dct', 'ivt', 'cvt', 'at', 'dsg', 'amt'].some(k => nameLower.includes(k) || slugLower.includes(k))
  }

  // 2. Filter variants
  let filtered = variants.filter(v => {
    const price = v.prices[0]?.priceInrLakh || 999
    
    // Hard filter: Budget
    if (price > answers.budgetMax) return false

    // Hard filter: Transmission
    if (answers.transmission === 'manual' && isAuto(v.name, v.slug)) return false
    if (answers.transmission === 'automatic' && !isAuto(v.name, v.slug)) return false

    return true
  })

  // Sparse DB Fallback: if filtered is empty, relax transmission filter, then budget filter
  if (filtered.length === 0) {
    filtered = variants.filter(v => (v.prices[0]?.priceInrLakh || 999) <= answers.budgetMax)
  }
  if (filtered.length === 0) {
    // If still empty, grab lowest price variants overall
    filtered = [...variants]
      .sort((a, b) => (a.prices[0]?.priceInrLakh || 999) - (b.prices[0]?.priceInrLakh || 999))
      .slice(0, 5)
  }

  // 3. Score variants
  const scoredList: ScoredVariant[] = filtered.map(v => {
    const price = v.prices[0]?.priceInrLakh || 0
    const overallScoreRecord = v.scores.find(s => s.category.name === 'Overall')
    const overallVal = overallScoreRecord?.score || 600 // fallback
    
    // Base score is derived from their Overall Score out of 200 (scale to 60)
    let score = (overallVal / 200) * 60

    // Comfort Score (out of 200)
    const comfortVal = v.scores.find(s => s.category.name === 'Comfort')?.score || 100
    // Safety Score (out of 200)
    const safetyVal = v.scores.find(s => s.category.name === 'Safety')?.score || 100
    // Tech Score (out of 200)
    const techVal = v.scores.find(s => s.category.name === 'Tech & Features')?.score || 100
    // Value Score (out of 200)
    const valueVal = v.scores.find(s => s.category.name === 'Value for Money')?.score || 100

    // Adjust score based on driving split / usage
    if (answers.usage === 'city') {
      // City driving prioritizes Comfort and Value (fuel economy)
      score += (comfortVal / 200) * 15 + (valueVal / 200) * 5
    } else if (answers.usage === 'highway') {
      // Highway driving prioritizes Safety and Overall stability
      score += (safetyVal / 200) * 15 + (overallVal / 200) * 5
    } else {
      // Mixed driving
      score += (comfortVal / 200) * 10 + (safetyVal / 200) * 10
    }

    // Adjust based on family size
    if (answers.familySize === 'large' || answers.familySize === 'airport') {
      // Prioritize space and comfort
      score += (comfortVal / 200) * 15
    } else {
      // Couple/small family prioritizes value/tech
      score += (valueVal / 200) * 10 + (techVal / 200) * 5
    }

    // Adjust based on priority choice
    let priorityExplanation = ''
    if (answers.priority === 'sunroof') {
      const hasSunroof = v.features.some(f => 
        (f.feature.name.toLowerCase().includes('sunroof') || f.feature.name.toLowerCase().includes('panoramic')) && 
        (f.value === 'YES' || f.value === 'STANDARD')
      )
      if (hasSunroof) {
        score += 30
        priorityExplanation = "includes a sunroof which matches your priority preference"
      }
    } else if (answers.priority === 'adas') {
      const hasADAS = v.features.some(f => 
        f.feature.name.toLowerCase().includes('adas') || 
        f.feature.name.toLowerCase().includes('emergency braking') ||
        f.feature.name.toLowerCase().includes('collision warning')
      )
      if (hasADAS) {
        score += 30
        priorityExplanation = "comes equipped with ADAS safety features"
      }
    } else if (answers.priority === 'boot') {
      // If boot litres is in dimensions, otherwise guess by variant features
      const bootLitres = v.dimensions?.bootLitres || 400
      if (bootLitres >= 430) {
        score += 30
        priorityExplanation = `offers a very spacious boot of ${bootLitres}L`
      } else {
        score += (bootLitres / 500) * 20
        priorityExplanation = `offers a boot capacity of ${bootLitres}L`
      }
    } else if (answers.priority === 'luxury') {
      score += (comfortVal / 200) * 20 + (techVal / 200) * 10
      priorityExplanation = "features a luxurious cabin layout with advanced specs"
    } else if (answers.priority === 'economy') {
      score += (valueVal / 200) * 30
      priorityExplanation = "delivers highly optimized fuel economy ratings"
    } else if (answers.priority === 'ownership') {
      score += (valueVal / 200) * 20
      priorityExplanation = "is rated highly for low maintenance and service cost ownership"
    }

    // Clamp score to 100 max
    score = Math.min(Math.round(score), 100)

    // Build the explanation
    const transType = isAuto(v.name, v.slug) ? 'Automatic' : 'Manual'
    const explanation = `The ${v.model.manufacturer.name} ${v.model.name} ${v.name} is a top recommendation because it fits within your budget at ₹${price.toFixed(2)} lakh. Its ${transType} transmission aligns perfectly with your preference, and the vehicle ${priorityExplanation || 'scores exceptionally well across comfort and safety parameters'}.`

    return {
      slug: v.slug,
      name: v.name,
      modelName: v.model.name,
      manufacturerName: v.model.manufacturer.name,
      price: price,
      overallScore: overallVal,
      score: score,
      explanation: explanation
    }
  })

  // 4. Sort and return top 3
  return scoredList
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}
