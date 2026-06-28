export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SearchResult {
  id: number
  type: 'model' | 'variant'
  name: string
  url: string
  score?: number
}
