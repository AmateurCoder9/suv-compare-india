'use client'

import React, { Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export const FILTER_PRESETS = [
  { id: 'auto-under-16',   label: 'Best Automatic Under ₹16L',   emoji: '🤖' },
  { id: 'safety-focused',  label: 'Safety Focus (6 Airbags)',    emoji: '🛡️' },
  { id: 'panoramic-sunroof', label: 'Panoramic Sunroof',         emoji: '☀️' },
  { id: 'mileage-diesel',  label: 'High Mileage',                emoji: '⛽' },
  { id: 'adas-under-18',   label: 'ADAS Under ₹18L',             emoji: '🤖' },
  { id: 'boot-space',      label: 'Large Boot Space (400L+)',    emoji: '📦' },
  { id: 'highway-cruiser', label: 'Highway Cruiser (Turbo/DCT)', emoji: '🛣️' },
  { id: 'value-picks',     label: 'Value for Money Picks',       emoji: '💰' },
] as const

function FilterPresetsInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activePreset = searchParams.get('preset')

  const handlePresetClick = (id: string) => {
    if (pathname === '/models') {
      const params = new URLSearchParams(searchParams.toString())
      if (params.get('preset') === id) {
        params.delete('preset')
      } else {
        params.set('preset', id)
      }
      router.push(`/models?${params.toString()}`)
    } else {
      router.push(`/models?preset=${id}`)
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Quick Filter Presets</div>
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {FILTER_PRESETS.map((preset) => {
          const isActive = activePreset === preset.id
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'bg-[var(--accent-light)] border-[var(--accent-color)] text-[var(--accent-color)]'
                  : 'bg-[var(--surface-0)] border-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
              }`}
            >
              <span>{preset.emoji}</span>
              <span>{preset.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function FilterPresets() {
  return (
    <Suspense fallback={
      <div className="space-y-3">
        <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Quick Filter Presets</div>
        <div className="h-8 bg-[var(--surface-2)] animate-pulse rounded-full w-full" />
      </div>
    }>
      <FilterPresetsInner />
    </Suspense>
  )
}
