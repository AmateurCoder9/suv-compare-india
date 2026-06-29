import { getAllRankingsCategories } from '@/lib/rankings'
import Link from 'next/link'
import { Trophy, Star, Shield, Zap, BarChart3 } from 'lucide-react'
import { SegmentScatterChart } from '@/components/charts/SegmentScatterChart'

const categoryIcons: Record<string, typeof Trophy> = {
  'Value for Money': Star,
  'Tech & Features': Zap,
  'Safety': Shield,
  'Overall': Trophy,
}

const categoryColors: Record<string, string> = {
  'Value for Money': 'text-amber-500',
  'Tech & Features': 'text-blue-500',
  'Safety': 'text-emerald-500',
  'Overall': 'text-purple-500',
}

export default async function RankingsIndexPage() {
  const categories = await getAllRankingsCategories()
  
  const displayCategories = categories.length > 0 ? categories : [
    'Value for Money',
    'Tech & Features',
    'Safety',
    'Overall'
  ]

  return (
    <div className="container mx-auto px-4 py-10 space-y-10 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight inline-flex items-center gap-3 text-foreground">
          <Trophy className="w-8 h-8 text-amber-500" />
          Scoring Rankings
        </h1>
        <p className="text-muted-foreground mt-2">See which SUVs top the charts in each scoring category.</p>
      </div>

      {/* Interactive Price vs Score Scatter Plot */}
      <section className="space-y-4">
        <SegmentScatterChart />
      </section>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayCategories.map(cat => {
          const Icon = categoryIcons[cat] || BarChart3
          const colorClass = categoryColors[cat] || 'text-[var(--accent-color)]'
          return (
            <Link key={cat} href={`/rankings/${encodeURIComponent(cat)}`}>
              <div className="border border-border bg-card rounded-xl p-7 group h-full flex flex-col justify-between gap-4 hover:border-[var(--accent-color)]/30 transition-all duration-150">
                <div className={`w-14 h-14 rounded-xl bg-secondary border border-border flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-[var(--accent-color)] transition-colors">{cat}</h3>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">View top performers →</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
