import fs from 'fs'
import path from 'path'

const slugToFolder: Record<string, string> = {
  'kia-seltos': 'Kia_Seltos',
  'hyundai-creta': 'Hyundai_Creta',
  'hyundai-venue': 'Hyundai_Venue',
  'skoda-kushaq': 'Skoda_Kushaq',
  'volkswagen-taigun': 'Volkswagen_Taigun',
  'honda-elevate': 'Honda_Elevate',
  'mg-astor': 'MG_Astor',
  'mg-hector': 'MG_Hector',
  'citroen-basalt': 'Citroen_Basalt',
  'citroen-c3-aircross': 'Citroen_C3_Aircross',
}

export function getCarHeroImage(modelSlug: string): string | null {
  let folder = slugToFolder[modelSlug]
  if (!folder) {
    for (const [slug, f] of Object.entries(slugToFolder)) {
      if (modelSlug.includes(slug)) {
        folder = f
        break
      }
    }
  }
  
  if (folder) {
    const relativePath = `/SUV_Compare_India_2026/${folder}/hero.jpg`
    const absolutePath = path.join(process.cwd(), 'public', relativePath)
    if (fs.existsSync(absolutePath)) {
      return relativePath
    }
  }
  return null
}

const carImages: Record<string, string> = {
  'hyundai-creta': '/images/cars/hyundai-creta.png',
  'kia-seltos': '/images/cars/kia-seltos.png',
  'tata-nexon': '/images/cars/tata-nexon.png',
  'maruti-suzuki-grand-vitara': '/images/cars/maruti-grand-vitara.png',
}

export function getFallbackCarImage(slug: string): string | null {
  if (carImages[slug]) return carImages[slug]
  for (const [key, value] of Object.entries(carImages)) {
    if (slug.includes(key)) return value
  }
  return null
}
