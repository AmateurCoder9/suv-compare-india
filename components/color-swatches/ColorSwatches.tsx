'use client'

import React, { useState } from 'react'

interface ColorOption {
  name: string
  hex: string
}

interface ColorSwatchesProps {
  optionsJson: string | null
}

export function ColorSwatches({ optionsJson }: ColorSwatchesProps) {
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null)
  
  if (!optionsJson) return null

  let options: ColorOption[] = []
  try {
    options = JSON.parse(optionsJson)
  } catch (e) {
    console.error(e)
    return null
  }

  if (options.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Available Colors</div>
      <div className="flex flex-wrap gap-2.5 items-center">
        {options.map((opt, idx) => {
          const isSelected = selectedColor?.name === opt.name
          return (
            <button
              key={idx}
              className={`w-8 h-8 rounded-full border-2 border-[var(--surface-3)] cursor-pointer focus:outline-none transition-all duration-150 relative group ${
                isSelected ? 'outline outline-2 outline-[var(--accent-color)] outline-offset-2' : ''
              }`}
              style={{ backgroundColor: opt.hex }}
              title={opt.name}
              onMouseEnter={() => setSelectedColor(opt)}
              onMouseLeave={() => setSelectedColor(null)}
              onClick={() => setSelectedColor(opt)}
            />
          )
        })}
      </div>
      <div className="text-xs text-[var(--text-secondary)] font-medium h-4">
        {selectedColor ? selectedColor.name : 'Hover or tap a swatch to see the color name'}
      </div>
    </div>
  )
}
