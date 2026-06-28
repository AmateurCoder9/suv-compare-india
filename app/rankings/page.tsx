import { getAllRankingsCategories } from '@/lib/rankings'
import Link from 'next/link'
import { Trophy, Star, Shield, Zap, BarChart3 } from 'lucide-react'

const categoryIcons: Record<string, typeof Trophy> = {
  'Value for Money': Star,
  'Tech & Features': Zap,
  'Safety': Shield,
  'Overall': Trophy,
}

const categoryColors: Record<string, string> = {
  'Value for Money': 'text-amber-400',
  'Tech & Features': 'text-blue-400',
  'Safety': 'text-emerald-400',
  'Overall': 'text-purple-400',
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
    <div className="container mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text inline-block flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          Rankings
        </h1>
        <p className="text-muted-foreground mt-2">See which SUVs top the charts in each scoring category.</p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayCategories.map(cat => {
          const Icon = categoryIcons[cat] || BarChart3
          const colorClass = categoryColors[cat] || 'text-primary'
          return (
            <Link key={cat} href={`/rankings/${encodeURIComponent(cat)}`}>
              <div className="glass-card rounded-xl p-7 group h-full flex flex-col justify-between gap-4">
                <div className={`w-14 h-14 rounded-xl bg-accent/50 flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{cat}</h3>
                  <p className="text-sm text-muted-foreground mt-1">View top performers →</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
