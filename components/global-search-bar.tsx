"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SearchableVariant } from '@/lib/search'

export function GlobalSearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchableVariant[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([])
        return
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    }

    const timer = setTimeout(fetchResults, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-2.5 border border-border/50 rounded-xl bg-accent/30 focus:bg-accent/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm placeholder:text-muted-foreground/60"
          placeholder="Search SUVs (e.g., Creta, Seltos HTX...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsOpen(false)
              router.push(`/search?q=${encodeURIComponent(query)}`)
            }
          }}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 glass rounded-xl shadow-2xl shadow-black/20 max-h-80 overflow-y-auto animate-fade-in">
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/variants/${result.slug}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 border-b border-border/10 last:border-0 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div>
                <div className="font-medium text-sm">{result.fullName}</div>
                <div className="text-xs text-muted-foreground">{result.bodyType}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
