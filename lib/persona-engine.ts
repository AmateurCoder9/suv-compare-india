export type PersonaTag =
  | 'best-for-families'
  | 'highway-cruiser'
  | 'city-automatic'
  | 'first-time-buyer'
  | 'feature-maximalist'
  | 'value-pick'
  | 'luxury-cabin'
  | 'drivers-choice'

export interface PersonaConfig {
  id:    PersonaTag
  label: string
  emoji: string
  color: string    // bg color (light tint)
  textColor: string
}

export const PERSONA_CONFIG: Record<PersonaTag, PersonaConfig> = {
  'best-for-families':  { id: 'best-for-families', label: 'Best for Families',    emoji: '👨‍👩‍👧', color: '#EAF9EE', textColor: '#1A7A3A' },
  'highway-cruiser':    { id: 'highway-cruiser', label: 'Highway Cruiser',       emoji: '🛣️',    color: '#E8F1FF', textColor: '#0050A8' },
  'city-automatic':     { id: 'city-automatic', label: 'City Automatic',        emoji: '🏙️',    color: '#F5F0FF', textColor: '#6B35C7' },
  'first-time-buyer':   { id: 'first-time-buyer', label: 'First-Time Buyer',      emoji: '🎓',    color: '#FFF8E6', textColor: '#9A6200' },
  'feature-maximalist': { id: 'feature-maximalist', label: 'Feature Maximalist',    emoji: '✨',    color: '#FFF0F5', textColor: '#A0003C' },
  'value-pick':         { id: 'value-pick', label: 'Value Pick',            emoji: '💰',    color: '#FFF5E6', textColor: '#9A5A00' },
  'luxury-cabin':       { id: 'luxury-cabin', label: 'Luxury Cabin',          emoji: '🎩',    color: '#F5F0FF', textColor: '#5A00A0' },
  'drivers-choice':     { id: 'drivers-choice', label: "Driver's Choice",       emoji: '🏁',    color: '#FFECEC', textColor: '#A00000' },
}

interface VariantScoreItem {
  score: number
  category: {
    name: string
  }
}

interface VariantFeatureItem {
  value: string
}

interface PriceItem {
  priceInrLakh: number
}

export interface VariantSummary {
  slug: string
  name: string
  prices: PriceItem[]
  scores: VariantScoreItem[]
  features: VariantFeatureItem[]
}

export function assignPersonaTags(v: VariantSummary): PersonaTag[] {
  const tags: PersonaTag[] = []
  
  const price = v.prices[0]?.priceInrLakh || 0
  const comfortVal = v.scores.find(s => s.category.name === 'Comfort')?.score || 100
  const safetyVal = v.scores.find(s => s.category.name === 'Safety')?.score || 100
  const techVal = v.scores.find(s => s.category.name === 'Tech & Features')?.score || 100
  const valueVal = v.scores.find(s => s.category.name === 'Value for Money')?.score || 100
  const overallVal = v.scores.find(s => s.category.name === 'Overall')?.score || 100
  
  const isAuto = ['(a)', 'auto', 'dct', 'ivt', 'cvt', 'at', 'dsg', 'amt'].some(
    k => v.name.toLowerCase().includes(k) || v.slug.toLowerCase().includes(k)
  )
  
  const yesFeaturesCount = v.features.filter(f => f.value === 'YES' || f.value === 'STANDARD').length

  // Rules:
  // 1. best-for-families: High comfort and safety
  if (comfortVal >= 150 && safetyVal >= 140) {
    tags.push('best-for-families')
  }

  // 2. highway-cruiser: High safety and overall power
  if (safetyVal >= 145 && overallVal >= 145) {
    tags.push('highway-cruiser')
  }

  // 3. city-automatic: Comfort and automatic transmission
  if (isAuto && comfortVal >= 140) {
    tags.push('city-automatic')
  }

  // 4. first-time-buyer: Low price and high value for money score
  if (price > 0 && price <= 14 && valueVal >= 150) {
    tags.push('first-time-buyer')
  }

  // 5. feature-maximalist: high features count or high tech score
  if (yesFeaturesCount >= 25 || techVal >= 160) {
    tags.push('feature-maximalist')
  }

  // 6. value-pick: high value for money score
  if (valueVal >= 160) {
    tags.push('value-pick')
  }

  // 7. luxury-cabin: high comfort and high tech
  if (comfortVal >= 170 && techVal >= 160) {
    tags.push('luxury-cabin')
  }

  // 8. drivers-choice: high overall spec rating and automatic
  if (overallVal >= 170 && isAuto) {
    tags.push('drivers-choice')
  }

  // Sort by specificity and return max 3 tags
  return tags.slice(0, 3)
}
