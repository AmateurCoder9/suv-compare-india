import { Info } from 'lucide-react'
import { translateSpec } from '@/lib/spec-translations'

interface SpecTranslationProps {
  field: string
  value: number
}

export function SpecTranslation({ field, value }: SpecTranslationProps) {
  const advice = translateSpec(field, value)
  if (!advice) return null

  return (
    <div className="flex items-start gap-1.5 mt-1 text-[var(--text-secondary)] leading-relaxed select-none">
      <Info className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
      <span className="text-xs font-normal">{advice}</span>
    </div>
  )
}
