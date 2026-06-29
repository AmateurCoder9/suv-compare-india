'use client'

import React, { useState } from 'react'
import { Check, X } from 'lucide-react'

interface FeatureCategory {
  name: string
}

interface Feature {
  id: number
  name: string
  category: FeatureCategory
}

interface VariantFeature {
  value: string
  feature: Feature
}

interface VariantData {
  id: number
  name: string
  slug: string
  model: {
    name: string
    manufacturer: { name: string }
  }
  features: VariantFeature[]
}

interface FeatureHeatmapProps {
  variants: VariantData[]
}

export function FeatureHeatmap({ variants }: FeatureHeatmapProps) {
  const [showOnlyDiffs, setShowOnlyDiffs] = useState<boolean>(false)

  if (variants.length === 0) return null

  // 1. Extract categories and features map
  const categoriesMap = new Map<string, Set<string>>()
  variants.forEach(v => {
    v.features.forEach(vf => {
      const catName = vf.feature.category.name
      if (!categoriesMap.has(catName)) {
        categoriesMap.set(catName, new Set())
      }
      categoriesMap.get(catName)?.add(vf.feature.name)
    })
  })

  const getFeatureValue = (v: VariantData, featName: string) => {
    const vf = v.features.find(f => f.feature.name === featName)
    return vf ? vf.value : 'NO'
  }

  // 2. Check if a feature has differences across variants
  const hasDifference = (featName: string) => {
    if (variants.length <= 1) return false
    const firstVal = getFeatureValue(variants[0], featName)
    return variants.some(v => getFeatureValue(v, featName) !== firstVal)
  }

  const renderIcon = (val: string) => {
    if (val === 'YES' || val === 'STANDARD') {
      return (
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--green-light)] text-[var(--green)]">
          <Check className="w-3.5 h-3.5" />
        </span>
      )
    }
    if (val === 'OPTIONAL') {
      return (
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--amber-light)] text-[var(--amber)] text-xs font-extrabold select-none">
          ○
        </span>
      )
    }
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--red-light)] text-[var(--red)]">
        <X className="w-3 h-3" />
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--surface-3)] pb-2">
        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Feature Coverage Comparison</h3>
        {variants.length > 1 && (
          <button
            onClick={() => setShowOnlyDiffs(!showOnlyDiffs)}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] border text-xs font-semibold cursor-pointer transition-all ${
              showOnlyDiffs
                ? 'bg-[var(--accent-light)] border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'bg-[var(--surface-0)] border-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {showOnlyDiffs ? 'Showing Differences Only' : 'Show Only Differences'}
          </button>
        )}
      </div>

      <div className="border border-[var(--surface-3)] rounded-[var(--radius-lg)] overflow-x-auto bg-[var(--surface-0)]">
        <table className="w-full border-collapse text-left text-xs min-w-[600px]">
          <thead>
            <tr className="border-b border-[var(--surface-3)] bg-[var(--surface-1)]">
              <th className="p-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider w-1/3">Feature</th>
              {variants.map(v => (
                <th key={v.id} className="p-3 text-center border-l border-[var(--surface-3)] w-1/4 font-semibold text-[var(--text-primary)]">
                  <div>{v.model.manufacturer.name} {v.model.name}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-normal mt-0.5">{v.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(categoriesMap.entries()).map(([catName, featNames]) => {
              const featuresList = Array.from(featNames).filter(name => {
                if (showOnlyDiffs) return hasDifference(name)
                return true
              })

              if (featuresList.length === 0) return null

              return (
                <React.Fragment key={catName}>
                  <tr className="bg-[var(--surface-2)]">
                    <td 
                      colSpan={variants.length + 1} 
                      className="p-2 font-bold text-[10px] uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--surface-3)]"
                    >
                      {catName}
                    </td>
                  </tr>
                  {featuresList.map(featName => (
                    <tr key={featName} className="border-b border-[var(--surface-3)] hover:bg-[var(--surface-1)]/50 transition-colors">
                      <td className="p-3 font-medium text-[var(--text-primary)]">{featName}</td>
                      {variants.map(v => {
                        const val = getFeatureValue(v, featName)
                        return (
                          <td key={v.id} className="p-3 text-center border-l border-[var(--surface-3)]">
                            <div className="flex justify-center">{renderIcon(val)}</div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
