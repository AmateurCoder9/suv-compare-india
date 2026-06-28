import Fuse from 'fuse.js'

export interface SearchableVariant {
  id: string | number
  slug: string
  name: string
  model: string
  manufacturer: string
  fullName: string
  bodyType: string
}

export function performSearch(query: string, variants: SearchableVariant[]) {
  if (!query) return []

  const fuse = new Fuse(variants, {
    keys: ['fullName', 'manufacturer', 'model', 'name'],
    threshold: 0.3,
  })

  return fuse.search(query).map(result => result.item)
}
