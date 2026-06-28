export interface ScoreBreakdown {
  category: string
  score: number
  maxScore: number
  percentage: number
  explanation: string
  confidence: number
}

export interface VariantScoreCard {
  variantId: number
  variantName: string
  modelName: string
  overallScore: number   // out of 1000
  breakdown: ScoreBreakdown[]
  mercedezIndex: number  // out of 100
  luxuryScore: number
  comfortScore: number
  technologyScore: number
  familyScore: number
  driverScore: number
  cityScore: number
  highwayScore: number
}
