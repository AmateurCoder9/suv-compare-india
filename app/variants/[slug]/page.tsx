import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatCurrencyLakh } from '@/lib/formatters'
import { ScoreRadarChart } from '@/components/score-radar-chart'
import { Check, X, Star, Shield, Gauge, Tag } from 'lucide-react'

export default async function VariantDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const variant = await db.variant.findUnique({
    where: { slug },
    include: {
      model: {
        include: {
          manufacturer: true
        }
      },
      scores: {
        include: { category: true }
      },
      features: {
        include: {
          feature: {
            include: {
              category: true
            }
          }
        }
      },
      prices: {
        orderBy: { priceInrLakh: 'asc' },
        take: 1
      }
    }
  })

  if (!variant) notFound()

  // Group features by category
  const categoriesMap = new Map<string, typeof variant.features>()
  variant.features.forEach(vf => {
    const catName = vf.feature.category.name
    if (!categoriesMap.has(catName)) {
      categoriesMap.set(catName, [])
    }
    categoriesMap.get(catName)?.push(vf)
  })

  // Prepare radar chart data
  const radarData = variant.scores.map(s => ({
    category: s.category.name,
    score: s.score
  }))

  // Calculate overall score
  const totalScore = variant.scores.reduce((sum, s) => sum + s.score, 0)

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
      {/* Header Card */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs text-primary font-medium uppercase tracking-wider">
              {variant.model.manufacturer.name} • {variant.model.name}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-1">
              {variant.name}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Tag className="w-3.5 h-3.5" />
                {(variant.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(variant.prices[0]?.priceInrLakh || 0) : 'Price TBA'}
              </span>
              {variant.isBase && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                  <Star className="w-3 h-3" /> Base Model
                </span>
              )}
            </div>
          </div>

          {/* Overall Score */}
          {radarData.length > 0 && (
            <div className="text-center shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex flex-col items-center justify-center animate-pulse-glow">
                <div className="text-2xl font-extrabold gradient-text">{Math.round(totalScore)}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">/1000</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scores Section */}
      {radarData.length > 0 && (
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Score Breakdown
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="w-full max-w-lg mx-auto">
              <ScoreRadarChart data={radarData} />
            </div>
            <div className="space-y-3">
              {variant.scores.map(s => {
                const pct = (s.score / (s.category.maxScore || 1000)) * 100
                return (
                  <div key={s.id} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{s.category.name}</span>
                      <span className="text-muted-foreground">{s.score}/{s.category.maxScore}</span>
                    </div>
                    <div className="h-2 bg-accent/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, oklch(0.72 0.19 145), oklch(0.65 0.2 250))`
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Features
        </h2>
        {Array.from(categoriesMap.entries()).map(([catName, vfs]) => (
          <div key={catName} className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border/30 bg-accent/20">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{catName}</h3>
            </div>
            <ul className="divide-y divide-border/20">
              {vfs.map(vf => (
                <li key={vf.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-accent/10 transition-colors">
                  <span className="font-medium text-sm">{vf.feature.name}</span>
                  <span className="flex items-center gap-2">
                    {vf.value === 'YES' || vf.value === 'STANDARD' ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                        <Check className="h-4 w-4" /> Standard
                      </span>
                    ) : vf.value === 'OPTIONAL' ? (
                      <span className="text-amber-400 text-sm">Optional</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-400/70 text-sm">
                        <X className="h-4 w-4" /> N/A
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {categoriesMap.size === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No feature data available for this variant.</p>
          </div>
        )}
      </div>
    </div>
  )
}
