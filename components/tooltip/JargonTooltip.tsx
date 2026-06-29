'use client'

import React, { useState } from 'react'
import { JARGON } from '@/lib/jargon'

interface JargonTooltipProps {
  term: string
  children: React.ReactNode
}

export function JargonTooltip({ term, children }: JargonTooltipProps) {
  const [visible, setVisible] = useState(false)
  const explanation = JARGON[term.toUpperCase()] || JARGON[term] || null

  if (!explanation) return <>{children}</>

  return (
    <span 
      className="relative inline-block cursor-help group"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)}
    >
      <span className="border-b border-dotted border-muted-foreground/60 pb-0.5">
        {children}
      </span>
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 z-50 p-2.5 bg-[var(--surface-0)] border border-[var(--surface-3)] text-[var(--text-primary)] text-xs rounded-md shadow-[var(--shadow-md)] leading-normal pointer-events-none transition-all duration-150">
          <strong>{term}</strong>: {explanation}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--surface-0)]" />
        </span>
      )}
    </span>
  )
}
