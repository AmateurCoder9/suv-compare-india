"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrencyLakh } from '@/lib/formatters'
import { Check, X, Loader2 } from 'lucide-react'

interface CompareEngineProps {
  options: { value: string, label: string }[]
}

interface FeatureCategory {
  name: string
}

interface Feature {
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

interface VariantComparisonData {
  id: number
  name: string
  slug: string
  model: Model
  prices: Price[]
  features: VariantFeature[]
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

  const getCategories = () => {
    if (!comparisonData || !comparisonData.variants) return []
    const catSet = new Set<string>()
    comparisonData.variants.forEach(v => {
      v.features.forEach((f) => catSet.add(f.feature.category.name))
    })
    return Array.from(catSet)
  }

  const getFeaturesForCategory = (category: string) => {
    if (!comparisonData || !comparisonData.variants) return []
    const featMap = new Map<string, string>()
    comparisonData.variants.forEach(v => {
      v.features
        .filter((f) => f.feature.category.name === category)
        .forEach((f) => {
          featMap.set(f.feature.name, f.feature.name)
        })
    })
    return Array.from(featMap.values())
  }

  const getFeatureStatus = (variant: VariantComparisonData, featureName: string) => {
    const feat = variant.features.find((f) => f.feature.name === featureName)
    if (!feat) return 'Not Available'
    if (feat.value === 'YES' || feat.value === 'STANDARD') return 'Standard'
    if (feat.value === 'OPTIONAL') return 'Optional'
    return 'Not Available'
  }

  const renderStatus = (status: string) => {
    if (status === 'Standard') return <Check className="h-4 w-4 text-emerald-600 mx-auto" />
    if (status === 'Optional') return <span className="text-xs text-amber-600 font-medium">Optional</span>
    return <X className="h-4 w-4 text-red-400 mx-auto" />
  }

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
                    className="text-[10px] text-red-500 font-semibold hover:underline"
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
        <div className="border border-border rounded-lg overflow-x-auto bg-card">
          <table className="w-full text-left min-w-[600px] md:min-w-0">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <th className="p-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-1/5">Feature</th>
                {comparisonData.variants.map((v) => (
                  <th key={v.id} className="p-3 text-center border-l border-border/30 w-1/4">
                    <div className="font-semibold text-xs md:text-sm text-foreground">{v.model.manufacturer.name} {v.model.name}</div>
                    <div className="text-[11px] text-muted-foreground font-normal mt-0.5">{v.name}</div>
                    <div className="score-badge font-mono text-[10px] mt-2 inline-block">
                      {(v.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(v.prices[0]?.priceInrLakh || 0) : 'TBA'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getCategories().map(cat => (
                <optgroup key={cat} label={cat} className="contents">
                  <tr className="bg-muted/40">
                    <td colSpan={comparisonData.variants.length + 1} className="p-2 font-bold text-xs uppercase tracking-wider text-foreground/80">{cat}</td>
                  </tr>
                  {getFeaturesForCategory(cat).map(featName => (
                    <tr key={featName} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                      <td className="p-3 text-xs font-medium text-foreground">{featName}</td>
                      {comparisonData.variants.map(v => {
                        const status = getFeatureStatus(v, featName)
                        return (
                          <td key={v.id} className="p-3 text-center border-l border-border/10">
                            {renderStatus(status)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </optgroup>
              ))}
            </tbody>
          </table>
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
