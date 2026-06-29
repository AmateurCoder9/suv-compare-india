'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Loader2, ArrowRight, GitCompare } from 'lucide-react'

interface BudgetVariant {
  variantSlug: string
  variantName: string
  modelName: string
  manufacturerName: string
  priceInrLakh: number
  overallScore: number
}

export function BudgetFinder() {
  const router = useRouter()
  const [budget, setBudget] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [results, setResults] = useState<BudgetVariant[]>([])

  useEffect(() => {
    if (!budget || parseFloat(budget) < 8) {
      setResults([])
      return
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/budget?amount=${budget}&range=0.75`)
        if (res.ok) {
          const json = await res.json()
          setResults(json.data || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [budget])

  return (
    <div 
      className="border border-[var(--surface-3)] bg-[var(--surface-1)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] space-y-4"
    >
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Variants In My Budget</h3>
        <p className="text-xs text-[var(--text-secondary)]">Enter a budget to find optimal matching variants sorted by overall score</p>
      </div>

      <div className="flex items-center gap-2 bg-[var(--surface-0)] border border-[var(--surface-3)] rounded-[var(--radius-md)] px-3 py-2 max-w-sm">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">₹</span>
        <input
          type="number"
          min="8"
          max="25"
          step="0.5"
          placeholder="Enter budget (e.g. 15.5)"
          className="flex-1 bg-transparent border-none text-xs font-semibold text-[var(--text-primary)] focus:outline-none w-full"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Lakh</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-color)]" />
          <span>Searching variants...</span>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="divide-y divide-[var(--surface-3)]/60 bg-[var(--surface-0)] border border-[var(--surface-3)] rounded-[var(--radius-md)] overflow-hidden">
            {results.slice(0, 5).map((item) => (
              <div 
                key={item.variantSlug}
                className="p-3 flex items-center justify-between text-xs hover:bg-[var(--surface-1)]/40 transition-colors gap-4"
              >
                <div className="flex-1 truncate">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {item.manufacturerName} {item.modelName}
                  </span>
                  <span className="text-[var(--text-secondary)] font-normal ml-1">({item.variantName})</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <span className="text-[var(--text-primary)] font-semibold">₹{item.priceInrLakh.toFixed(2)}L</span>
                  <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--green)] font-extrabold text-[10px]">
                    {item.overallScore}/200
                  </span>
                  <Link
                    href={`/variants/${item.variantSlug}`}
                    className="p-1 hover:bg-[var(--surface-2)] rounded transition-colors text-[var(--accent-color)]"
                    title="View details"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {results.length >= 2 && (
            <button
              onClick={() => {
                const slugs = results.slice(0, 4).map(r => r.variantSlug).join(',')
                router.push(`/compare?slugs=${slugs}`)
              }}
              className="w-full bg-[var(--surface-2)] hover:bg-[var(--surface-3)]/50 border border-[var(--surface-3)] text-[var(--text-primary)] font-bold text-xs p-2.5 rounded-[var(--radius-md)] cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <GitCompare className="w-3.5 h-3.5" /> Compare top matches side-by-side
            </button>
          )}
        </div>
      )}

      {!loading && budget && parseFloat(budget) >= 8 && results.length === 0 && (
        <p className="text-xs text-[var(--text-tertiary)] italic py-2">
          No variants found matching exactly ₹{budget} Lakh (±0.75L). Try a different budget.
        </p>
      )}
    </div>
  )
}
