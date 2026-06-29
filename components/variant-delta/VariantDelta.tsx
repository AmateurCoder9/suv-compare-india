'use client'

import React, { useState, useEffect } from 'react'
import { DeltaResult } from '@/lib/variant-delta'
import { ArrowRight, Star, AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

interface ModelVariantItem {
  name: string
  slug: string
  price: number
}

interface VariantDeltaProps {
  modelVariants: ModelVariantItem[]
}

export function VariantDelta({ modelVariants }: VariantDeltaProps) {
  const [deltas, setDeltas] = useState<Record<string, DeltaResult>>({})
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (modelVariants.length <= 1) {
      setLoading(false)
      return
    }

    async function fetchAllDeltas() {
      setLoading(true)
      const results: Record<string, DeltaResult> = {}
      
      const promises = modelVariants.slice(0, -1).map(async (v, idx) => {
        const fromSlug = v.slug
        const toSlug = modelVariants[idx + 1].slug
        try {
          const res = await fetch(`/api/variants/delta?from=${fromSlug}&to=${toSlug}`)
          if (res.ok) {
            const json = await res.json()
            if (json.data) {
              results[`${fromSlug}-${toSlug}`] = json.data
            }
          }
        } catch (e) {
          console.error(e)
        }
      })

      await Promise.all(promises)
      setDeltas(results)
      setLoading(false)
    }

    fetchAllDeltas()
  }, [modelVariants])

  if (modelVariants.length <= 1) return null

  if (loading) {
    return (
      <div className="border border-[var(--surface-3)] bg-[var(--surface-1)] rounded-[var(--radius-lg)] p-8 text-center text-xs text-[var(--text-secondary)]">
        Calculating variant upgrades specs difference...
      </div>
    )
  }

  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5 text-[var(--amber)]">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star
            key={idx}
            className={`w-3.5 h-3.5 ${idx < count ? 'fill-current' : 'text-[var(--surface-3)]'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Trim Upgrade Explainer</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Explore changes and verdicts for upgrading along trim levels</p>
      </div>

      <div className="space-y-6">
        {modelVariants.slice(0, -1).map((v, idx) => {
          const fromSlug = v.slug
          const toSlug = modelVariants[idx + 1].slug
          const delta = deltas[`${fromSlug}-${toSlug}`]

          if (!delta) return null

          return (
            <div 
              key={idx}
              className="border border-[var(--surface-3)] bg-[var(--surface-1)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] space-y-4"
            >
              {/* Header: From -> To */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--surface-3)] pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                  <span>{delta.fromVariant.name}</span>
                  <span className="text-[var(--text-secondary)] font-normal">({v.price.toFixed(2)}L)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--accent-color)]">{delta.toVariant.name}</span>
                  <span className="text-[var(--text-secondary)] font-normal">({modelVariants[idx + 1].price.toFixed(2)}L)</span>
                </div>
                <div className="text-xs font-bold text-[var(--amber)] px-2.5 py-0.5 rounded-full bg-[var(--amber-light)] border border-[var(--amber)]/20">
                  +₹{delta.priceDiffInrLakh.toFixed(2)} Lakh
                </div>
              </div>

              {/* Lists of Changes */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                {/* Features Added */}
                {delta.featuresAdded.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                      <ArrowUpCircle className="w-4 h-4 text-[var(--green)] shrink-0" />
                      Features Added
                    </div>
                    <ul className="space-y-1.5 pl-5 list-disc text-[var(--text-secondary)]">
                      {delta.featuresAdded.slice(0, 5).map(f => (
                        <li key={f}>{f}</li>
                      ))}
                      {delta.featuresAdded.length > 5 && (
                        <li className="list-none text-[10px] text-[var(--text-tertiary)] italic">
                          + {delta.featuresAdded.length - 5} more features
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Specs Changes */}
                {delta.specsChanged.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                      <AlertCircle className="w-4 h-4 text-[var(--accent-color)] shrink-0" />
                      Specification Changes
                    </div>
                    <div className="space-y-1.5 pl-1.5 text-[var(--text-secondary)] font-medium">
                      {delta.specsChanged.map(s => (
                        <div key={s.label}>
                          {s.label}: <strong className="text-[var(--text-primary)]">{s.from}</strong> → <strong className="text-[var(--accent-color)]">{s.to}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Verdict Section */}
              <div 
                className={`border rounded-[var(--radius-md)] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  delta.isWorthIt 
                    ? 'bg-[var(--green-light)] border-[var(--green)]/20 text-[var(--text-primary)]' 
                    : 'bg-[var(--red-light)] border-[var(--red)]/20 text-[var(--text-primary)]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {renderStars(delta.verdict)}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {delta.isWorthIt ? 'Worth the upgrade!' : 'Skip this upgrade'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {delta.verdictText}
                  </p>
                </div>
                <div 
                  className={`text-[10px] font-extrabold px-3 py-1.5 rounded-md uppercase tracking-wider text-center shrink-0 border select-none ${
                    delta.isWorthIt 
                      ? 'bg-[var(--surface-0)] border-[var(--green)] text-[var(--green)] shadow-sm' 
                      : 'bg-[var(--surface-0)] border-[var(--red)] text-[var(--red)] shadow-sm'
                  }`}
                >
                  {delta.isWorthIt ? 'Yes, Upgrade' : 'Stay with Lower Trim'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
