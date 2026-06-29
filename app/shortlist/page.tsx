'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bookmark, Trash2, ArrowRight, GitCompare, Loader2 } from 'lucide-react'
import { getShortlist, removeFromShortlist, clearShortlist } from '@/lib/shortlist-store'

interface ShortlistVariant {
  id: number
  name: string
  slug: string
  model: {
    name: string
    manufacturer: { name: string }
  }
  prices: { priceInrLakh: number }[]
  scores: { score: number; category: { name: string } }[]
}

export default function ShortlistPage() {
  const router = useRouter()
  const [slugs, setSlugs] = useState<string[]>([])
  const [variants, setVariants] = useState<ShortlistVariant[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadShortlist = async () => {
    setLoading(true)
    const savedSlugs = getShortlist()
    setSlugs(savedSlugs)

    if (savedSlugs.length === 0) {
      setVariants([])
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/compare?slugs=${encodeURIComponent(savedSlugs.join(','))}`)
      if (res.ok) {
        const json = await res.json()
        setVariants(json.variants || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShortlist()
  }, [])

  const handleRemove = (slug: string) => {
    removeFromShortlist(slug)
    loadShortlist()
  }

  const handleClearAll = () => {
    clearShortlist()
    loadShortlist()
  }

  const getOverallScore = (v: ShortlistVariant) => {
    return v.scores.find(s => s.category.name === 'Overall')?.score || 600
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl min-h-[75vh] flex flex-col">
      <div className="flex items-center justify-between border-b border-[var(--surface-3)] pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">My Watchlist</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Your saved variants (Max 6)</p>
        </div>
        {slugs.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs text-[var(--red)] font-semibold hover:underline cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-color)]" />
          <span className="text-xs text-[var(--text-secondary)] mt-2">Loading saved shortlist...</span>
        </div>
      ) : slugs.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-1)] flex items-center justify-center border border-[var(--surface-3)]">
            <Bookmark className="w-8 h-8 text-[var(--text-tertiary)]" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">No SUVs Saved Yet</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Explore variant spec sheets or models and tap the bookmark icon to save them to your shortlist.
            </p>
          </div>
          <Link
            href="/models"
            className="inline-flex items-center justify-center bg-[var(--accent-color)] text-white font-bold text-xs px-4 py-2.5 rounded-[var(--radius-md)] hover:opacity-90 transition-all cursor-pointer"
          >
            Browse SUVs
          </Link>
        </div>
      ) : (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="grid gap-4">
            {variants.map(v => (
              <div 
                key={v.slug}
                className="border border-[var(--surface-3)] bg-[var(--surface-1)] rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-sm)] flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    {v.model.manufacturer.name}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {v.model.name} <span className="text-[var(--accent-color)]">{v.name}</span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] pt-0.5">
                    <span>Ex-Showroom: <strong className="text-[var(--text-primary)]">₹{v.prices[0]?.priceInrLakh.toFixed(2)}L</strong></span>
                    <span>•</span>
                    <span>Score: <strong className="text-[var(--green)]">{getOverallScore(v)}/200</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/variants/${v.slug}`}
                    className="p-2 bg-[var(--surface-0)] border border-[var(--surface-3)] rounded-[var(--radius-md)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] cursor-pointer"
                    title="View Details"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleRemove(v.slug)}
                    className="p-2 bg-[var(--surface-0)] border border-[var(--surface-3)] hover:border-[var(--red)] rounded-[var(--radius-md)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--red)] cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {slugs.length >= 2 && (
            <button
              onClick={() => router.push(`/compare?slugs=${slugs.join(',')}`)}
              className="w-full bg-[var(--accent-color)] text-white border-none rounded-[var(--radius-md)] p-3 text-xs font-bold cursor-pointer transition-all hover:opacity-90 flex items-center justify-center gap-2 mt-6"
            >
              <GitCompare className="w-4 h-4" /> Compare saved watchlist ({slugs.length} vehicles)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
