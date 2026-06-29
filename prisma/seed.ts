import { PrismaClient, Feature, ScoreCategory } from '@prisma/client'

const prisma = new PrismaClient()

// Standard slugify helper since typescript compiler needs it locally
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

const featureCategories = [
  { name: 'Exterior', order: 1 },
  { name: 'Interior', order: 2 },
  { name: 'Technology', order: 3 },
  { name: 'Safety', order: 4 },
  { name: 'ADAS', order: 5 },
  { name: 'Comfort', order: 6 },
]

const features = {
  Exterior: [
    'Sunroof', 'Panoramic Sunroof', 'LED Headlights', 'LED DRLs', 'LED Taillights',
    'Auto-Folding ORVM', 'Electrically Adjustable ORVM', 'ORVM Turn Indicators',
    'Rear Wiper', 'Rear Defogger', 'Rain Sensing Wipers', 'Auto Headlights',
    '17-inch Alloys', '18-inch Alloys', 'Flush Door Handles'
  ],
  Interior: [
    'Leatherette Seats', 'Ventilated Front Seats', 'Heated Front Seats',
    'Powered Driver Seat', 'Memory Seat', 'Powered Passenger Seat',
    'Rear AC Vents', 'Rear Armrest', 'Centre Armrest Front', 'Ambient Lighting',
    'Multi-color Ambient Lighting', 'Soft Touch Dashboard', 'Piano Black Trim',
    'Brushed Aluminium Trim', 'Illuminated Gear Knob'
  ],
  Technology: [
    '10-inch Touchscreen', '10.25-inch Touchscreen', '12-inch Touchscreen',
    'Wireless Android Auto', 'Wired Android Auto', 'Wireless Apple CarPlay',
    'Wired Apple CarPlay', 'Digital Instrument Cluster', 'Analog Cluster with MID',
    'HUD', 'Connected Car Tech', 'OTA Updates', 'Wireless Charger', 'Type-C USB',
    'Premium Sound System (Bose / Harman / JBL)', '360-degree Camera', 'Rear Camera',
    'Blind View Monitor', 'Auto-Dimming IRVM', 'Voice Commands (Native)'
  ],
  Safety: [
    '6 Airbags', '2 Airbags', 'ABS with EBD', 'ESP', 'Hill Assist Control',
    'Hill Descent Control', 'TPMS', 'Rear Parking Sensors', 'Front Parking Sensors',
    'Auto Hold', 'Electronic Parking Brake'
  ],
  ADAS: [
    'Forward Collision Warning', 'Autonomous Emergency Braking', 'Lane Departure Warning',
    'Lane Keeping Assist', 'Blind Spot Detection', 'Rear Cross Traffic Alert',
    'Adaptive Cruise Control', 'Driver Drowsiness Alert', 'Traffic Sign Recognition',
    'High Beam Assist'
  ],
  Comfort: [
    'Powered Tailgate', 'Keyless Entry', 'Push Button Start', 'Auto AC',
    'Cruise Control', 'Steering-Mounted Controls',
    '60:40 Split Rear Seat', 'Flat Boot Floor', 'Tilt and Telescopic Steering'
  ]
}

const manufacturers = [
  { name: 'Kia', country: 'South Korea' },
  { name: 'Hyundai', country: 'South Korea' },
  { name: 'Volkswagen', country: 'Germany' },
  { name: 'Skoda', country: 'Czech Republic' },
  { name: 'Honda', country: 'Japan' },
  { name: 'MG', country: 'UK/China' },
  { name: 'Citroën', country: 'France' },
]

const scoreCategories = [
  { name: 'Value for Money', maxScore: 200, weight: 0.2, description: 'Pricing in relation to specs, fuel economy, and features.' },
  { name: 'Tech & Features', maxScore: 200, weight: 0.2, description: 'Infotainment size, connectivity, sound system, and advanced cabin features.' },
  { name: 'Safety', maxScore: 200, weight: 0.2, description: 'Airbags count, driver assistance, crash ratings, and ESP.' },
  { name: 'Comfort', maxScore: 200, weight: 0.2, description: 'Ride quality, seat comfort, rear headroom, and legroom.' },
  { name: 'Overall', maxScore: 200, weight: 0.2, description: 'Sum of engine output, cabin insulation, build, and resale prospects.' }
]

const modelsData = [
  {
    manufacturer: 'Kia', name: 'Seltos', bodyType: 'Compact SUV', launchYear: 2019, currentYear: 2024, generationName: '2023 Facelift',
    variants: [
      { name: 'HTE(O)', price: 10.90, isBase: true },
      { name: 'HTK', price: 12.20, isBase: false },
      { name: 'HTK(O)', price: 13.00, isBase: false },
      { name: 'HTX', price: 15.30, isBase: false },
      { name: 'HTX(A)', price: 16.60, isBase: false },
      { name: 'GTX', price: 19.00, isBase: false },
      { name: 'GTX(A)', price: 19.90, isBase: false }
    ]
  },
  {
    manufacturer: 'Hyundai', name: 'Creta', bodyType: 'Compact SUV', launchYear: 2015, currentYear: 2024, generationName: '2024 Facelift',
    variants: [
      { name: 'EX', price: 11.00, isBase: true },
      { name: 'S', price: 12.50, isBase: false },
      { name: 'S(O)', price: 13.80, isBase: false },
      { name: 'SX', price: 15.30, isBase: false },
      { name: 'SX(O)', price: 18.70, isBase: false },
      { name: 'SX Tech', price: 16.50, isBase: false }
    ]
  },
  {
    manufacturer: 'Hyundai', name: 'Venue', bodyType: 'Compact SUV', launchYear: 2019, currentYear: 2024, generationName: '2022 Facelift',
    variants: [
      { name: 'S', price: 8.90, isBase: true },
      { name: 'S(O)', price: 9.80, isBase: false },
      { name: 'SX', price: 11.00, isBase: false },
      { name: 'SX(O)', price: 12.40, isBase: false }
    ]
  },
  {
    manufacturer: 'Volkswagen', name: 'Taigun', bodyType: 'Compact SUV', launchYear: 2021, currentYear: 2024, generationName: '1st Gen',
    variants: [
      { name: 'Comfortline', price: 11.70, isBase: true },
      { name: 'Highline', price: 13.80, isBase: false },
      { name: 'Topline', price: 16.10, isBase: false },
      { name: 'GT', price: 16.80, isBase: false },
      { name: 'GT Plus', price: 19.70, isBase: false }
    ]
  },
  {
    manufacturer: 'Skoda', name: 'Kushaq', bodyType: 'Compact SUV', launchYear: 2021, currentYear: 2024, generationName: '1st Gen',
    variants: [
      { name: 'Active', price: 11.90, isBase: true },
      { name: 'Ambition', price: 13.50, isBase: false },
      { name: 'Style', price: 16.30, isBase: false },
      { name: 'Monte Carlo', price: 17.20, isBase: false }
    ]
  },
  {
    manufacturer: 'Honda', name: 'Elevate', bodyType: 'Compact SUV', launchYear: 2023, currentYear: 2024, generationName: '1st Gen',
    variants: [
      { name: 'V', price: 11.60, isBase: true },
      { name: 'VX', price: 13.20, isBase: false },
      { name: 'ZX', price: 15.10, isBase: false },
      { name: 'ZX Advance', price: 16.20, isBase: false }
    ]
  },
  {
    manufacturer: 'MG', name: 'Astor', bodyType: 'Compact SUV', launchYear: 2021, currentYear: 2024, generationName: '1st Gen',
    variants: [
      { name: 'Super', price: 10.80, isBase: true },
      { name: 'Smart', price: 14.20, isBase: false },
      { name: 'Savvy', price: 17.90, isBase: false }
    ]
  },
  {
    manufacturer: 'MG', name: 'Hector', bodyType: 'SUV', launchYear: 2019, currentYear: 2024, generationName: '2023 Facelift',
    variants: [
      { name: 'Super', price: 13.90, isBase: true },
      { name: 'Smart', price: 16.00, isBase: false },
      { name: 'Sharp', price: 18.20, isBase: false },
      { name: 'Savvy', price: 19.90, isBase: false }
    ]
  },
  {
    manufacturer: 'Citroën', name: 'Basalt', bodyType: 'Coupe SUV', launchYear: 2024, currentYear: 2024, generationName: '1st Gen',
    variants: [
      { name: 'Feel', price: 9.90, isBase: true },
      { name: 'Shine+', price: 13.80, isBase: false }
    ]
  },
  {
    manufacturer: 'Citroën', name: 'C3 Aircross', bodyType: 'Compact SUV', launchYear: 2023, currentYear: 2024, generationName: '1st Gen',
    variants: [
      { name: 'Feel', price: 9.99, isBase: true },
      { name: 'Shine+', price: 12.80, isBase: false }
    ]
  }
]

async function main() {
  console.log('Clearing database...')
  await prisma.price.deleteMany()
  await prisma.variantScore.deleteMany()
  await prisma.variantFeature.deleteMany()
  await prisma.safetyFeature.deleteMany()
  await prisma.aDASFeature.deleteMany()
  await prisma.engine.deleteMany()
  await prisma.transmission.deleteMany()
  await prisma.dimensions.deleteMany()
  await prisma.fuelEconomy.deleteMany()
  await prisma.ownership.deleteMany()
  await prisma.warranty.deleteMany()
  await prisma.pro.deleteMany()
  await prisma.con.deleteMany()
  await prisma.commonIssue.deleteMany()
  await prisma.media.deleteMany()
  await prisma.reviewConsensus.deleteMany()
  await prisma.ranking.deleteMany()
  await prisma.comparison.deleteMany()
  await prisma.modelCompetitor.deleteMany()
  await prisma.buyerGuideEntry.deleteMany()
  await prisma.buyerGuide.deleteMany()

  await prisma.feature.deleteMany()
  await prisma.featureCategory.deleteMany()
  await prisma.scoreCategory.deleteMany()

  await prisma.variant.deleteMany()
  await prisma.model.deleteMany()
  await prisma.manufacturer.deleteMany()

  console.log('Seeding Feature Categories & Features...')
  const dbFeatures: Record<string, Feature> = {}
  
  for (const cat of featureCategories) {
    const category = await prisma.featureCategory.create({
      data: {
        name: cat.name,
        slug: slugify(cat.name),
        order: cat.order
      }
    })

    const feats = features[cat.name as keyof typeof features]
    for (const feat of feats) {
      const dbFeat = await prisma.feature.create({
        data: {
          name: feat,
          slug: slugify(feat),
          categoryId: category.id,
          isFilterable: true
        }
      })
      dbFeatures[feat] = dbFeat
    }
  }

  console.log('Seeding Score Categories...')
  const dbScoreCats: Record<string, ScoreCategory> = {}
  for (const sc of scoreCategories) {
    const dbSc = await prisma.scoreCategory.create({
      data: {
        name: sc.name,
        slug: slugify(sc.name),
        maxScore: sc.maxScore,
        weight: sc.weight,
        description: sc.description
      }
    })
    dbScoreCats[sc.name] = dbSc
  }

  console.log('Seeding Manufacturers...')
  for (const m of manufacturers) {
    await prisma.manufacturer.create({
      data: {
        name: m.name,
        slug: slugify(m.name),
        country: m.country,
      }
    })
  }

  console.log('Seeding Models, Variants, Prices, Features, and Scores...')
  for (const md of modelsData) {
    const m = await prisma.manufacturer.findUnique({ where: { name: md.manufacturer }})
    if (!m) continue

    const model = await prisma.model.create({
      data: {
        name: md.name,
        slug: slugify(`${m.name} ${md.name}`),
        manufacturerId: m.id,
        bodyType: md.bodyType,
        launchYear: md.launchYear,
        currentYear: md.currentYear,
        generationName: md.generationName
      }
    })

    let order = 1
    for (let i = 0; i < md.variants.length; i++) {
      const vData = md.variants[i]

      // Determine alternative variant slug
      let altSlug = ''
      if (i + 1 < md.variants.length) {
        altSlug = slugify(`${m.name} ${md.name} ${md.variants[i+1].name}`)
      } else if (i - 1 >= 0) {
        altSlug = slugify(`${m.name} ${md.name} ${md.variants[i-1].name}`)
      }

      // Determine colors
      let colors: { name: string, hex: string }[] = []
      if (m.name === 'Kia') {
        colors = [
          { name: 'Gravity Grey', hex: '#6B7280' },
          { name: 'Imperial Blue', hex: '#1E3A8A' },
          { name: 'Aurora Black Pearl', hex: '#111827' },
          { name: 'Glacier White Pearl', hex: '#F9FAFB' },
          { name: 'Pewter Olive', hex: '#5F6F52' },
          { name: 'Intense Red', hex: '#DC2626' }
        ]
      } else if (m.name === 'Hyundai') {
        colors = [
          { name: 'Abyss Black', hex: '#111827' },
          { name: 'Atlas White', hex: '#F9FAFB' },
          { name: 'Titan Grey', hex: '#4B5563' },
          { name: 'Fiery Red', hex: '#DC2626' },
          { name: 'Ranger Khaki', hex: '#4D5D53' },
          { name: 'Robusto Blue', hex: '#1E40AF' }
        ]
      } else if (m.name === 'Volkswagen') {
        colors = [
          { name: 'Wild Cherry Red', hex: '#B91C1C' },
          { name: 'Curcuma Yellow', hex: '#D97706' },
          { name: 'Candy White', hex: '#F9FAFB' },
          { name: 'Carbon Steel Grey', hex: '#374151' },
          { name: 'Reflex Silver', hex: '#9CA3AF' }
        ]
      } else if (m.name === 'Skoda') {
        colors = [
          { name: 'Tornado Red', hex: '#991B1B' },
          { name: 'Honey Orange', hex: '#EA580C' },
          { name: 'Candy White', hex: '#F9FAFB' },
          { name: 'Carbon Steel Grey', hex: '#374151' },
          { name: 'Brilliant Silver', hex: '#D1D5DB' }
        ]
      } else if (m.name === 'Honda') {
        colors = [
          { name: 'Phoenix Orange Pearl', hex: '#EA580C' },
          { name: 'Obsidian Blue Pearl', hex: '#1E3A8A' },
          { name: 'Radiant Red Metallic', hex: '#DC2626' },
          { name: 'Platinum White Pearl', hex: '#F9FAFB' },
          { name: 'Golden Brown Metallic', hex: '#78350F' },
          { name: 'Lunar Silver Metallic', hex: '#9CA3AF' }
        ]
      } else if (m.name === 'MG') {
        colors = [
          { name: 'Starry Black', hex: '#111827' },
          { name: 'Candy White', hex: '#F9FAFB' },
          { name: 'Aurora Silver', hex: '#D1D5DB' },
          { name: 'Glaze Red', hex: '#B91C1C' },
          { name: 'Havana Grey', hex: '#4B5563' }
        ]
      } else { // Citroen
        colors = [
          { name: 'Polar White', hex: '#F9FAFB' },
          { name: 'Steel Grey', hex: '#6B7280' },
          { name: 'Platinum Grey', hex: '#374151' },
          { name: 'Cosmo Blue', hex: '#1E3A8A' }
        ]
      }

      // Determine buyIfText and skipIfText
      const isTopTrim = ['gtx', 'x-line', 'savvy', 'sharp', 'monte carlo', 'style', 'topline', 'gt plus', 'zx', 'shine+'].some(
        keyword => vData.name.toLowerCase().includes(keyword)
      )
      const isBaseTrim = vData.isBase

      let buyIfText = `You want a balanced trim that offers essential conveniences like a rear camera and alloys without paying top-spec premiums.`
      let skipIfText = `You want the absolute safety assurance of ADAS and 6 airbags, or high-end luxury details.`
      
      if (isBaseTrim) {
        buyIfText = `You want a solid, spacious, and reliable SUV at the lowest possible entry price.`
        skipIfText = `You require modern creature comforts like automatic AC, sunroof, or touchscreen infotainment.`
      } else if (isTopTrim) {
        buyIfText = `You want premium features like ADAS, a panoramic sunroof, and ventilated seats.`
        skipIfText = `You are on a tight budget and want the best price-to-performance ratio.`
      }

      const variant = await prisma.variant.create({
        data: {
          name: vData.name,
          slug: slugify(`${m.name} ${md.name} ${vData.name}`),
          modelId: model.id,
          displayOrder: order++,
          isBase: vData.isBase,
          buyIfText: buyIfText,
          skipIfText: skipIfText,
          alternativeSlug: altSlug,
          colorOptions: JSON.stringify(colors)
        }
      })

      // 1. Seed Price
      await prisma.price.create({
        data: {
          variantId: variant.id,
          priceInrLakh: vData.price,
          priceType: 'Ex-Showroom Delhi',
          isLatest: true
        }
      })



      for (const [featName, dbFeat] of Object.entries(dbFeatures)) {
        let value = 'NO'
        
        // Basic safety and features standard everywhere
        if (['abs with ebd', 'esp', '2 airbags', 'rear parking sensors'].some(k => featName.toLowerCase().includes(k))) {
          value = 'YES'
        }
        
        // Base models get standard items
        if (isBaseTrim) {
          if (['halogen headlights', 'analog cluster with mid', 'tilt and telescopic steering'].some(k => featName.toLowerCase().includes(k))) {
            value = 'YES'
          }
        } else if (isTopTrim) {
          // Top models get all premium items
          if (['sunroof', 'led headlights', 'leatherette seats', 'ventilated front seats', 'rear ac vents', '10.25-inch touchscreen', '360-degree camera', '6 airbags', 'adas', 'cruise control', 'push button start'].some(
            k => featName.toLowerCase().includes(k)
          )) {
            value = 'YES'
          }
        } else {
          // Mid trims get a selection of mid-level features
          if (['alloy', 'sunroof', 'rear ac vents', 'led drls', '10-inch touchscreen', 'rear camera', 'cruise control'].some(
            k => featName.toLowerCase().includes(k)
          )) {
            // Sunroof/alloys might be optional
            if (featName === 'Panoramic Sunroof') {
              value = 'NO'
            } else if (featName === 'Sunroof') {
              value = 'OPTIONAL'
            } else {
              value = 'YES'
            }
          }
        }

        await prisma.variantFeature.create({
          data: {
            variantId: variant.id,
            featureId: dbFeat.id,
            value: value,
            confidence: 100
          }
        })
      }

      // 3. Seed Scores

      
      // Calculate scores for categories
      const valueScore = isBaseTrim ? 180 : isTopTrim ? 120 : 155
      const techScore = isBaseTrim ? 90 : isTopTrim ? 190 : 145
      const safetyScore = isBaseTrim ? 100 : isTopTrim ? 185 : 140
      const comfortScore = isBaseTrim ? 110 : isTopTrim ? 175 : 150
      const overallScore = isBaseTrim ? 120 : isTopTrim ? 180 : 150
      
      const categoryScores = {
        'Value for Money': valueScore,
        'Tech & Features': techScore,
        'Safety': safetyScore,
        'Comfort': comfortScore,
        'Overall': overallScore
      }

      for (const [scName, dbSc] of Object.entries(dbScoreCats)) {
        const scoreVal = categoryScores[scName as keyof typeof categoryScores] || 150
        await prisma.variantScore.create({
          data: {
            variantId: variant.id,
            categoryId: dbSc.id,
            score: scoreVal,
            explanation: `${scName} scored at ${scoreVal}/${dbSc.maxScore} for the ${variant.name} trim.`,
            confidence: 90
          }
        })
      }
      
    }
  }

  console.log('Seed completed successfully.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
