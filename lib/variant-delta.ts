import { db } from './db'

export interface DeltaResult {
  fromVariant: { name: string; slug: string; priceInrLakh: number }
  toVariant:   { name: string; slug: string; priceInrLakh: number }
  priceDiffInrLakh: number
  featuresAdded:   string[]
  featuresRemoved: string[]
  specsChanged:    { label: string; from: string; to: string }[]
  verdict:         1 | 2 | 3 | 4 | 5
  verdictText:     string
  isWorthIt:       boolean
}

export async function computeVariantDelta(
  fromSlug: string,
  toSlug: string
): Promise<DeltaResult | null> {
  const [fromV, toV] = await Promise.all([
    db.variant.findUnique({
      where: { slug: fromSlug },
      include: {
        prices: { orderBy: { priceInrLakh: 'asc' }, take: 1 },
        features: { include: { feature: true } },
        engine: true,
        transmission: true,
        dimensions: true,
        fuelEconomy: true
      }
    }),
    db.variant.findUnique({
      where: { slug: toSlug },
      include: {
        prices: { orderBy: { priceInrLakh: 'asc' }, take: 1 },
        features: { include: { feature: true } },
        engine: true,
        transmission: true,
        dimensions: true,
        fuelEconomy: true
      }
    })
  ])

  if (!fromV || !toV) return null

  const fromPrice = fromV.prices[0]?.priceInrLakh || 0
  const toPrice = toV.prices[0]?.priceInrLakh || 0
  const priceDiff = toPrice - fromPrice

  // 1. Compare Features
  const featuresAdded: string[] = []
  const featuresRemoved: string[] = []

  const fromFeatMap = new Map(fromV.features.map(f => [f.feature.name, f.value]))
  const toFeatMap = new Map(toV.features.map(f => [f.feature.name, f.value]))

  const allFeatureNames = Array.from(new Set([...fromFeatMap.keys(), ...toFeatMap.keys()]))

  for (const name of allFeatureNames) {
    const fromVal = fromFeatMap.get(name) || 'NO'
    const toVal = toFeatMap.get(name) || 'NO'

    const fromHas = fromVal === 'YES' || fromVal === 'STANDARD'
    const toHas = toVal === 'YES' || toVal === 'STANDARD'

    if (!fromHas && toHas) {
      featuresAdded.push(name)
    } else if (fromHas && !toHas) {
      featuresRemoved.push(name)
    }
  }

  // 2. Compare Specs
  const specsChanged: { label: string; from: string; to: string }[] = []
  
  if (fromV.engine && toV.engine) {
    if (fromV.engine.displacement !== toV.engine.displacement) {
      specsChanged.push({
        label: 'Engine Displacement',
        from: `${fromV.engine.displacement}cc`,
        to: `${toV.engine.displacement}cc`
      })
    }
    if (fromV.engine.maxPowerBhp !== toV.engine.maxPowerBhp) {
      specsChanged.push({
        label: 'Max Power',
        from: `${fromV.engine.maxPowerBhp} bhp`,
        to: `${toV.engine.maxPowerBhp} bhp`
      })
    }
    if (fromV.engine.maxTorqueNm !== toV.engine.maxTorqueNm) {
      specsChanged.push({
        label: 'Max Torque',
        from: `${fromV.engine.maxTorqueNm} Nm`,
        to: `${toV.engine.maxTorqueNm} Nm`
      })
    }
  }

  if (fromV.transmission && toV.transmission) {
    if (fromV.transmission.type !== toV.transmission.type) {
      specsChanged.push({
        label: 'Gearbox Type',
        from: fromV.transmission.type,
        to: toV.transmission.type
      })
    }
  }

  if (fromV.dimensions && toV.dimensions) {
    if (fromV.dimensions.groundClearanceMm !== toV.dimensions.groundClearanceMm) {
      specsChanged.push({
        label: 'Ground Clearance',
        from: `${fromV.dimensions.groundClearanceMm}mm`,
        to: `${toV.dimensions.groundClearanceMm}mm`
      })
    }
    if (fromV.dimensions.bootLitres !== toV.dimensions.bootLitres) {
      specsChanged.push({
        label: 'Boot Space',
        from: `${fromV.dimensions.bootLitres}L`,
        to: `${toV.dimensions.bootLitres}L`
      })
    }
  }

  // 3. Verdict Scoring
  let verdict: 1 | 2 | 3 | 4 | 5 = 3
  let verdictText = "Fair Upgrade. The price difference is reasonable for the extra features."
  let isWorthIt = true

  const addedPremiumFeatures = featuresAdded.filter(f => 
    ['sunroof', 'adas', 'ventilated', 'leatherette', 'led headlights', 'camera', 'airbags'].some(k => f.toLowerCase().includes(k))
  )

  if (priceDiff <= 0.75 && featuresAdded.length >= 3) {
    verdict = 5
    verdictText = "Highly Recommended. You get excellent premium additions for a minor price increase."
    isWorthIt = true
  } else if (priceDiff <= 1.25 && featuresAdded.length >= 4) {
    verdict = 4
    verdictText = "Recommended. The added features easily justify the price jump."
    isWorthIt = true
  } else if (priceDiff > 2.0 && featuresAdded.length <= 2) {
    verdict = 2
    verdictText = "Overpriced Upgrade. The extra cost is not justified by the minor spec additions."
    isWorthIt = false
  } else if (featuresAdded.length > 0 && addedPremiumFeatures.length === 0) {
    verdict = 2
    verdictText = "Mostly cosmetic updates. Better to stick with the lower trim."
    isWorthIt = false
  } else if (priceDiff > 1.8 && addedPremiumFeatures.length <= 2) {
    verdict = 3
    verdictText = "Marginal value. Only upgrade if you absolutely need these specific features."
    isWorthIt = false
  }

  return {
    fromVariant: { name: fromV.name, slug: fromV.slug, priceInrLakh: fromPrice },
    toVariant: { name: toV.name, slug: toV.slug, priceInrLakh: toPrice },
    priceDiffInrLakh: priceDiff,
    featuresAdded,
    featuresRemoved,
    specsChanged,
    verdict,
    verdictText,
    isWorthIt
  }
}
