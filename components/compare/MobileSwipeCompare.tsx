'use client'

import React, { useRef, useState, useEffect } from 'react'
import { formatCurrencyLakh } from '@/lib/formatters'
import { Check, X } from 'lucide-react'

interface FeatureCategory {
  name: string
}

interface Feature {
  name: string
  category: FeatureCategory
}

interface VariantFeature {
  value: string
  feature: Feature
}

interface PriceItem {
  priceInrLakh: number
}

interface VariantData {
  id: number
  name: string
  slug: string
  model: {
    name: string
    manufacturer: { name: string }
  }
  prices: PriceItem[]
  features: VariantFeature[]
}

interface MobileSwipeCompareProps {
  variants: VariantData[]
}

export function MobileSwipeCompare({ variants }: MobileSwipeCompareProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState<number>(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const { scrollLeft, clientWidth } = containerRef.current
      const newIndex = Math.round(scrollLeft / 160) // column min-width is 160
      setActiveIndex(Math.min(Math.max(newIndex, 0), variants.length - 1))
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [variants])

  if (variants.length === 0) return null

  // 1. Get Categories & Features
  const getCategories = () => {
    const catSet = new Set<string>()
    variants.forEach(v => {
      v.features.forEach((f) => catSet.add(f.feature.category.name))
    })
    return Array.from(catSet)
  }

  const getFeaturesForCategory = (category: string) => {
    const featMap = new Map<string, string>()
    variants.forEach(v => {
      v.features
        .filter((f) => f.feature.category.name === category)
        .forEach((f) => {
          featMap.set(f.feature.name, f.feature.name)
        })
    })
    return Array.from(featMap.values())
  }

  const getFeatureStatus = (variant: VariantData, featureName: string) => {
    const feat = variant.features.find((f) => f.feature.name === featureName)
    if (!feat) return 'Not Available'
    if (feat.value === 'YES' || feat.value === 'STANDARD') return 'Standard'
    if (feat.value === 'OPTIONAL') return 'Optional'
    return 'Not Available'
  }

  const renderStatus = (status: string) => {
    if (status === 'Standard') return <Check className="h-4 w-4 text-emerald-600 mx-auto" />
    if (status === 'Optional') return <span className="text-[10px] text-amber-600 font-bold">Opt</span>
    return <X className="h-4 w-4 text-red-400 mx-auto" />
  }

  return (
    <div className="border border-[var(--surface-3)] bg-[var(--surface-0)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] md:hidden">
      <div className="flex">
        {/* Sticky spec labels (left side) */}
        <div className="w-[120px] shrink-0 bg-[var(--surface-1)] border-r border-[var(--surface-3)] select-none">
          <div className="h-[96px] border-b border-[var(--surface-3)] p-3 flex items-end">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] tracking-wider">Features</span>
          </div>
          {getCategories().map(cat => {
            const feats = getFeaturesForCategory(cat)
            return (
              <React.Fragment key={cat}>
                <div className="h-[28px] bg-[var(--surface-2)] border-b border-[var(--surface-3)] px-2.5 py-1.5 flex items-center font-bold text-[9px] uppercase tracking-wider text-[var(--text-primary)]">
                  {cat}
                </div>
                {feats.map(fName => (
                  <div key={fName} className="h-[36px] border-b border-[var(--surface-3)]/60 px-2.5 py-2 flex items-center text-[10px] font-medium text-[var(--text-primary)] truncate" title={fName}>
                    {fName}
                  </div>
                ))}
              </React.Fragment>
            )
          })}
        </div>

        {/* Scrollable variant columns (right side) */}
        <div 
          ref={containerRef}
          className="flex-1 flex overflow-x-auto scroll-smooth scroll-x-snap"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {variants.map((v, idx) => {
            const isHighlighted = activeIndex === idx
            return (
              <div 
                key={v.id} 
                className={`w-[160px] shrink-0 border-r border-[var(--surface-3)] scroll-snap-item ${
                  isHighlighted ? 'bg-[var(--accent-light)]/20' : ''
                }`}
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Column Header */}
                <div className={`h-[96px] border-b border-[var(--surface-3)] p-2.5 text-center flex flex-col justify-between ${
                  isHighlighted ? 'bg-[var(--accent-light)]/40' : 'bg-[var(--surface-1)]/40'
                }`}>
                  <div className="space-y-0.5">
                    <div className="font-bold text-[10px] text-[var(--text-primary)] leading-tight line-clamp-2">
                      {v.model.manufacturer.name} {v.model.name}
                    </div>
                    <div className="text-[9px] text-[var(--text-secondary)] truncate">{v.name}</div>
                  </div>
                  <div className="font-mono text-[10px] font-extrabold text-[var(--accent-color)] mt-1.5">
                    {(v.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(v.prices[0]?.priceInrLakh || 0) : 'TBA'}
                  </div>
                </div>

                {/* Rows data */}
                {getCategories().map(cat => {
                  const feats = getFeaturesForCategory(cat)
                  return (
                    <React.Fragment key={cat}>
                      <div className="h-[28px] bg-[var(--surface-2)]/60 border-b border-[var(--surface-3)]" />
                      {feats.map(fName => {
                        const status = getFeatureStatus(v, fName)
                        return (
                          <div key={fName} className="h-[36px] border-b border-[var(--surface-3)]/60 p-2 flex items-center justify-center">
                            {renderStatus(status)}
                          </div>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Swipe indicators */}
      {variants.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 py-3 border-t border-[var(--surface-3)] bg-[var(--surface-1)]">
          {variants.map((_, idx) => (
            <span
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                activeIndex === idx ? 'bg-[var(--accent-color)] w-3' : 'bg-[var(--surface-3)]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
