import { PersonaTag as TagType, PERSONA_CONFIG } from '@/lib/persona-engine'

interface PersonaTagProps {
  tag: TagType
}

export function PersonaTag({ tag }: PersonaTagProps) {
  const config = PERSONA_CONFIG[tag]
  if (!config) return null

  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full select-none border border-black/5"
      style={{
        backgroundColor: config.color,
        color: config.textColor,
      }}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
