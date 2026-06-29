'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GitCompare, Loader2 } from 'lucide-react'

interface ComparisonItem {
  a: string
  b: string
  label: string
}

export function PopularComparisons() {
  const router = useRouter()
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchComparisons() {
      try {
        const res = await fetch('/api/popular-comparisons')
        if (res.ok) {
          const json = await res.json()
          setComparisons(json.data || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchComparisons()
  }, [])

  const handleComparisonClick = (item: ComparisonItem) => {
    router.push(`/compare?slugs=${item.a},${item.b}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-color)]" />
      </div>
    )
  }

  if (comparisons.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Popular Head-to-Head Comparisons</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {comparisons.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleComparisonClick(item)}
            className="flex items-center gap-3 p-3 bg-[var(--surface-0)] border border-[var(--surface-3)] rounded-[var(--radius-lg)] hover:border-[var(--accent-color)] hover:bg-[var(--accent-light)]/10 text-left cursor-pointer transition-all duration-150 group"
          >
            <GitCompare className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-color)] shrink-0" />
            <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-color)] line-clamp-1 leading-normal">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
