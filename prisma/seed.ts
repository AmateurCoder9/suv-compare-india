import { PrismaClient } from '@prisma/client'
import { slugify } from '../lib/slugify'

const prisma = new PrismaClient()

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
    'Rear AC Vents', 'Cruise Control', 'Steering-Mounted Controls',
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

const modelsData = [
  {
    manufacturer: 'Kia', name: 'Seltos', bodyType: 'Compact SUV', launchYear: 2019, currentYear: 2024, generationName: '2023 Facelift',
    variants: ['HTE(O)', 'HTK', 'HTK(O)', 'HTX', 'HTX(A)', 'GTX', 'GTX(A)', 'X-Line', 'X-Line(A)']
  },
  {
    manufacturer: 'Hyundai', name: 'Creta', bodyType: 'Compact SUV', launchYear: 2015, currentYear: 2024, generationName: '2024 Facelift',
    variants: ['EX', 'S', 'S(O)', 'SX', 'SX(O)', 'SX Tech', 'SX(O) Knight']
  },
  {
    manufacturer: 'Hyundai', name: 'Venue', bodyType: 'Compact SUV', launchYear: 2019, currentYear: 2024, generationName: '2022 Facelift',
    variants: ['S', 'S(O)', 'SX', 'SX(O)', 'SX+']
  },
  {
    manufacturer: 'Volkswagen', name: 'Taigun', bodyType: 'Compact SUV', launchYear: 2021, currentYear: 2024, generationName: '1st Gen',
    variants: ['Comfortline', 'Highline', 'Topline', 'GT', 'GT Plus']
  },
  {
    manufacturer: 'Skoda', name: 'Kushaq', bodyType: 'Compact SUV', launchYear: 2021, currentYear: 2024, generationName: '1st Gen',
    variants: ['Ambition', 'Style', 'Monte Carlo']
  },
  {
    manufacturer: 'Honda', name: 'Elevate', bodyType: 'Compact SUV', launchYear: 2023, currentYear: 2024, generationName: '1st Gen',
    variants: ['V', 'VX', 'ZX', 'ZX Advance']
  },
  {
    manufacturer: 'MG', name: 'Astor', bodyType: 'Compact SUV', launchYear: 2021, currentYear: 2024, generationName: '1st Gen',
    variants: ['Super', 'Smart', 'Savvy']
  },
  {
    manufacturer: 'MG', name: 'Hector', bodyType: 'SUV', launchYear: 2019, currentYear: 2024, generationName: '2023 Facelift',
    variants: ['Super', 'Smart', 'Sharp', 'Savvy']
  },
  {
    manufacturer: 'Citroën', name: 'Basalt', bodyType: 'Coupe SUV', launchYear: 2024, currentYear: 2024, generationName: '1st Gen',
    variants: ['Feel', 'Shine+']
  },
  {
    manufacturer: 'Citroën', name: 'C3 Aircross', bodyType: 'Compact SUV', launchYear: 2023, currentYear: 2024, generationName: '1st Gen',
    variants: ['Feel', 'Shine+']
  }
]

async function main() {
  console.log('Seeding Feature Categories and Features...')
  for (const cat of featureCategories) {
    const category = await prisma.featureCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        slug: slugify(cat.name),
        order: cat.order
      }
    })

    const feats = features[cat.name as keyof typeof features]
    for (const feat of feats) {
      await prisma.feature.upsert({
        where: { slug: slugify(feat) },
        update: {},
        create: {
          name: feat,
          slug: slugify(feat),
          categoryId: category.id,
          isFilterable: true
        }
      })
    }
  }

  console.log('Seeding Manufacturers...')
  for (const m of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { name: m.name },
      update: {},
      create: {
        name: m.name,
        slug: slugify(m.name),
        country: m.country,
      }
    })
  }

  console.log('Seeding Models and Variants...')
  for (const md of modelsData) {
    const m = await prisma.manufacturer.findUnique({ where: { name: md.manufacturer }})
    if (!m) continue;

    const model = await prisma.model.upsert({
      where: { slug: slugify(`${m.name} ${md.name}`) },
      update: {},
      create: {
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
    for (const vName of md.variants) {
      await prisma.variant.upsert({
        where: { slug: slugify(`${m.name} ${md.name} ${vName}`) },
        update: {},
        create: {
          name: vName,
          slug: slugify(`${m.name} ${md.name} ${vName}`),
          modelId: model.id,
          displayOrder: order++,
          isBase: false
        }
      })
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
