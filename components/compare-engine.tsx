"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrencyLakh } from '@/lib/formatters'
import { Check, X, Loader2, ArrowLeftRight } from 'lucide-react'

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
  v1: VariantComparisonData
  v2: VariantComparisonData
}

export function CompareEngine({ options }: CompareEngineProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const v1Param = searchParams.get('v1')
  const v2Param = searchParams.get('v2')

  const [v1Slug, setV1Slug] = useState(v1Param || '')
  const [v2Slug, setV2Slug] = useState(v2Param || '')
  
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchComparison = async (v1: string, v2: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/compare?v1=${v1}&v2=${v2}`)
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
    if (v1Slug && v2Slug) {
      router.push(`/compare?v1=${v1Slug}&v2=${v2Slug}`)
      Promise.resolve().then(() => {
        fetchComparison(v1Slug, v2Slug)
      })
    }
  }, [v1Slug, v2Slug, router])

  const swapVariants = () => {
    setV1Slug(v2Slug)
    setV2Slug(v1Slug)
  }

  const getCategories = () => {
    if (!comparisonData) return []
    const catSet = new Set<string>()
    const addCats = (v: VariantComparisonData) => v.features.forEach((f) => catSet.add(f.feature.category.name))
    addCats(comparisonData.v1)
    addCats(comparisonData.v2)
    return Array.from(catSet)
  }

  const getFeaturesForCategory = (category: string) => {
    if (!comparisonData) return []
    const featMap = new Map<string, string>()
    const addFeats = (v: VariantComparisonData) => {
      v.features.filter((f) => f.feature.category.name === category).forEach((f) => {
        featMap.set(f.feature.name, f.feature.name)
      })
    }
    addFeats(comparisonData.v1)
    addFeats(comparisonData.v2)
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
    if (status === 'Standard') return <Check className="h-5 w-5 text-emerald-400 mx-auto" />
    if (status === 'Optional') return <span className="text-sm text-amber-400">Optional</span>
    return <X className="h-5 w-5 text-red-400/60 mx-auto" />
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Selector */}
      <div className="glass-card rounded-xl p-6">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Variant 1</label>
            <select 
              className="w-full border border-border/50 rounded-lg p-3 bg-accent/30 text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              value={v1Slug}
              onChange={(e) => setV1Slug(e.target.value)}
            >
              <option value="">Select a variant...</option>
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={swapVariants}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-accent/50 border border-border/30 hover:bg-primary/10 hover:border-primary/30 transition-all mb-0.5"
            title="Swap variants"
          >
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Variant 2</label>
            <select 
              className="w-full border border-border/50 rounded-lg p-3 bg-accent/30 text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              value={v2Slug}
              onChange={(e) => setV2Slug(e.target.value)}
            >
              <option value="">Select a variant...</option>
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading comparison...</p>
        </div>
      )}

      {!loading && comparisonData && (
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/30">
                <th className="p-5 font-medium text-muted-foreground text-sm uppercase tracking-wider w-1/3">Feature</th>
                <th className="p-5 w-1/3 text-center border-l border-border/30">
                  <div className="font-semibold">{comparisonData.v1.model.manufacturer.name} {comparisonData.v1.model.name}</div>
                  <div className="text-sm text-muted-foreground">{comparisonData.v1.name}</div>
                  <div className="score-badge text-xs font-medium mt-2 inline-block">
                    {(comparisonData.v1.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(comparisonData.v1.prices[0]?.priceInrLakh || 0) : 'TBA'}
                  </div>
                </th>
                <th className="p-5 w-1/3 text-center border-l border-border/30">
                  <div className="font-semibold">{comparisonData.v2.model.manufacturer.name} {comparisonData.v2.model.name}</div>
                  <div className="text-sm text-muted-foreground">{comparisonData.v2.name}</div>
                  <div className="score-badge text-xs font-medium mt-2 inline-block">
                    {(comparisonData.v2.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(comparisonData.v2.prices[0]?.priceInrLakh || 0) : 'TBA'}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {getCategories().map(cat => (
                <optgroup key={cat} label={cat} className="contents">
                  <tr className="bg-accent/20">
                    <td colSpan={3} className="p-3 font-semibold text-xs uppercase tracking-wider text-primary">{cat}</td>
                  </tr>
                  {getFeaturesForCategory(cat).map(featName => {
                    const status1 = getFeatureStatus(comparisonData.v1, featName)
                    const status2 = getFeatureStatus(comparisonData.v2, featName)
                    
                    return (
                      <tr key={featName} className="border-b border-border/10 hover:bg-accent/10 transition-colors">
                        <td className="p-4 text-sm font-medium">{featName}</td>
                        <td className="p-4 text-center border-l border-border/10">{renderStatus(status1)}</td>
                        <td className="p-4 text-center border-l border-border/10">{renderStatus(status2)}</td>
                      </tr>
                    )
                  })}
                </optgroup>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !comparisonData && v1Slug === '' && v2Slug === '' && (
        <div className="glass-card rounded-xl p-14 text-center">
          <ArrowLeftRight className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Select two variants above to see a detailed comparison.</p>
        </div>
      )}
    </div>
  )
}
