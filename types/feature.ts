export interface FeatureCategoryData {
  id: number
  name: string
  slug: string
  order: number
  features: FeatureData[]
}

export interface FeatureData {
  id: number
  name: string
  slug: string
  description?: string | null
  isFilterable: boolean
}
