import { BenchmarkLabel } from '@/lib/benchmarks'

interface SpecBenchmarkProps {
  label: BenchmarkLabel
}

export function SpecBenchmark({ label }: SpecBenchmarkProps) {
  if (!label || !label.text) return null

  return (
    <span 
      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full select-none ml-1.5 border border-black/5"
      style={{
        backgroundColor: label.tag === 'best' ? 'var(--green-light)' : 
                         label.tag === 'above-avg' ? 'var(--accent-light)' : 
                         label.tag === 'worst' ? 'var(--red-light)' : 
                         label.tag === 'below-avg' ? 'var(--amber-light)' : 'var(--surface-2)',
        color: label.color
      }}
    >
      {label.text}
    </span>
  )
}
