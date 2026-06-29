import { Media } from '@prisma/client'

// Pre-defined fallback map for cases where DB has zero images (rare after pipeline runs)
const legacyFallbackImages: Record<string, string> = {
  'hyundai-creta': '/images/cars/hyundai-creta.png',
  'kia-seltos': '/images/cars/kia-seltos.png',
  'tata-nexon': '/images/cars/tata-nexon.png',
  'maruti-suzuki-grand-vitara': '/images/cars/maruti-grand-vitara.png',
}

export function getFallbackCarImage(slug: string): string | null {
  if (legacyFallbackImages[slug]) return legacyFallbackImages[slug]
  for (const [key, value] of Object.entries(legacyFallbackImages)) {
    if (slug.includes(key)) return value
  }
  return null
}

/**
 * Implements the mandated fallback logic:
 * If Hero missing -> Use highest-quality Front 3/4 -> Front -> Side -> Any Exterior -> Highest-quality Unknown
 */
export function getPrimaryImage(media: Media[] | undefined | null): string | null {
  if (!media || media.length === 0) return null

  // 1. Hero
  const hero = media.find(m => m.isHero || m.category === 'Hero')
  if (hero) return hero.imageUrl

  // Helper to sort by resolution quality (width * height)
  const sortByQuality = (a: Media, b: Media) => (b.width * b.height) - (a.width * a.height)

  // 2. Highest-quality Front 3/4
  const front34 = media.filter(m => m.category === 'Front 3/4').sort(sortByQuality)
  if (front34.length > 0) return front34[0].imageUrl

  // 3. Front
  const front = media.filter(m => m.category === 'Front').sort(sortByQuality)
  if (front.length > 0) return front[0].imageUrl

  // 4. Side
  const side = media.filter(m => m.category === 'Side').sort(sortByQuality)
  if (side.length > 0) return side[0].imageUrl

  // 5. Any Exterior
  const exteriorCategories = ['Rear', 'Rear 3/4', 'Top', 'Headlight', 'Tail Light']
  const exterior = media.filter(m => exteriorCategories.includes(m.category)).sort(sortByQuality)
  if (exterior.length > 0) return exterior[0].imageUrl

  // 6. Highest-quality Unknown
  const unknown = media.filter(m => m.category === 'Unknown').sort(sortByQuality)
  if (unknown.length > 0) return unknown[0].imageUrl

  // 7. Last resort: just the highest quality image we have
  const anyImg = [...media].sort(sortByQuality)
  if (anyImg.length > 0) return anyImg[0].imageUrl

  return null
}
