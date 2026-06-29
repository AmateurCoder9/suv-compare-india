"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrencyLakh } from '@/lib/formatters'
import { Check, X, Loader2, GitCompare } from 'lucide-react'
import { FeatureHeatmap } from '@/components/compare/FeatureHeatmap'
import { MobileSwipeCompare } from '@/components/compare/MobileSwipeCompare'
import { ScoreRadarChart } from '@/components/score-radar-chart'

interface CompareEngineProps {
  options: { value: string, label: string }[]
}

interface FeatureCategory {
  name: string
}

interface Feature {
  id: number
  name: string
  category: FeatureCategory
}

interface VariantFeature {
  id: number
  value: string
  feature: Feature
}

interface Price {
  priceInrLakh: number
}

interface Manufacturer {
  name: string
}

interface Model {
  name: string
  manufacturer: Manufacturer
}

interface ScoreCategory {
  name: string
}

interface VariantScore {
  id: number
  score: number
  category: ScoreCategory
}

interface VariantComparisonData {
  id: number
  name: string
  slug: string
  model: Model
  prices: Price[]
  features: VariantFeature[]
  scores: VariantScore[]
}

interface ComparisonResponse {
  variants: VariantComparisonData[]
}

export function CompareEngine({ options }: CompareEngineProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const v1Param = searchParams.get('v1')
  const v2Param = searchParams.get('v2')
  const slugsParam = searchParams.get('slugs')

  // Initialize selected slots based on query params or defaults
  const getInitialSlugs = (): string[] => {
    if (slugsParam) {
      const parsed = slugsParam.split(',').filter(Boolean)
      if (parsed.length >= 2) return parsed
    }
    const defaultList = [v1Param || '', v2Param || '']
    while (defaultList.length < 2) {
      defaultList.push('')
    }
    return defaultList
  }

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(getInitialSlugs())
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchComparison = async (slugsList: string[]) => {
    const activeSlugs = slugsList.filter(Boolean)
    if (activeSlugs.length === 0) {
      setComparisonData(null)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/compare?slugs=${encodeURIComponent(activeSlugs.join(','))}`)
      if (res.ok) {
        const data = await res.json()
        setComparisonData(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const activeSlugs = selectedSlugs.filter(Boolean)
    if (activeSlugs.length > 0) {
      router.push(`/compare?slugs=${activeSlugs.join(',')}`)
      Promise.resolve().then(() => {
        fetchComparison(selectedSlugs)
      })
    } else {
      router.push('/compare')
      Promise.resolve().then(() => {
        setComparisonData(null)
      })
    }
  }, [selectedSlugs, router])

  const handleSlugChange = (index: number, value: string) => {
    const newSlugs = [...selectedSlugs]
    newSlugs[index] = value
    setSelectedSlugs(newSlugs)
  }

  const addSelector = () => {
    if (selectedSlugs.length < 4) {
      setSelectedSlugs([...selectedSlugs, ''])
    }
  }

  const removeSelector = (index: number) => {
    if (selectedSlugs.length > 2) {
      const newSlugs = selectedSlugs.filter((_, i) => i !== index)
      setSelectedSlugs(newSlugs)
    }
  }

  const getRadarComparisonData = () => {
    if (!comparisonData || !comparisonData.variants || comparisonData.variants.length !== 2) return undefined
    const [vA, vB] = comparisonData.variants
    
    const categoriesSet = new Set<string>()
    vA.scores.forEach(s => categoriesSet.add(s.category.name))
    vB.scores.forEach(s => categoriesSet.add(s.category.name))
    
    // Sort so Overall score is excluded or listed cleanly
    const list = Array.from(categoriesSet).filter(cat => cat !== 'Overall')
    
    return list.map(cat => {
      const scoreA = vA.scores.find(s => s.category.name === cat)?.score || 0
      const scoreB = vB.scores.find(s => s.category.name === cat)?.score || 0
      return {
        category: cat,
        scoreA,
        scoreB,
        variantNameA: `${vA.model.name} ${vA.name}`,
        variantNameB: `${vB.model.name} ${vB.name}`
      }
    })
  }

  const radarComparisonData = getRadarComparisonData()

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Dynamic Selectors block */}
      <div className="border border-border bg-card rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedSlugs.map((slug, idx) => (
            <div key={idx} className="border border-border/60 bg-muted/10 p-3 rounded-md space-y-2 relative">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Vehicle {idx + 1}</span>
                {selectedSlugs.length > 2 && (
                  <button
                    onClick={() => removeSelector(idx)}
                    className="text-[10px] text-red-500 font-semibold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              <select
                className="w-full border border-border/50 rounded p-1.5 bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                value={slug}
                onChange={(e) => handleSlugChange(idx, e.target.value)}
              >
                <option value="">Select variant...</option>
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {selectedSlugs.length < 4 && (
          <div className="flex justify-start pt-1">
            <button
              onClick={addSelector}
              className="px-3 py-1.5 border border-dashed border-border hover:bg-muted text-xs font-semibold rounded cursor-pointer transition-colors"
            >
              + Add Another Vehicle to Compare (Max 4)
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="border border-border p-12 text-center bg-card rounded-lg">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading vehicle specifications...</p>
        </div>
      )}

      {!loading && comparisonData && comparisonData.variants && comparisonData.variants.length > 0 && (
        <div className="space-y-6">
          {/* Radar Chart Overlay Panel (only for exactly 2 vehicles) */}
          {radarComparisonData && (
            <div className="border border-border bg-card rounded-xl p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                <GitCompare className="w-5 h-5 text-[var(--accent-color)]" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Score Overlay Mapping</h3>
              </div>
              <div className="w-full max-w-md mx-auto">
                <ScoreRadarChart data={[]} comparisonData={radarComparisonData} />
              </div>
            </div>
          )}

          {/* Desktop/Tablet Heatmap View */}
          <div className="hidden md:block">
            <FeatureHeatmap variants={comparisonData.variants} />
          </div>

          {/* Mobile Swipe View */}
          <div className="block md:hidden">
            <MobileSwipeCompare variants={comparisonData.variants} />
          </div>
        </div>
      )}

      {!loading && (!comparisonData || !comparisonData.variants || comparisonData.variants.length === 0) && (
        <div className="border border-border p-14 text-center bg-card rounded-lg">
          <p className="text-sm text-muted-foreground">Select variants above to see side-by-side comparison tables.</p>
        </div>
      )}
    </div>
  )
}
