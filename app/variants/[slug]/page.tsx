import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatCurrencyLakh } from '@/lib/formatters'
import { ScoreRadarChart } from '@/components/score-radar-chart'
import { Check, X, Star, Shield, Gauge, Tag, Car } from 'lucide-react'
import Image from 'next/image'
import { getCarHeroImage, getFallbackCarImage } from '@/lib/images'

// Import new Buyer Intelligence components
import { ShortlistButton } from '@/components/shortlist/ShortlistButton'
import { PersonaTag } from '@/components/persona/PersonaTag'
import { JargonTooltip } from '@/components/tooltip/JargonTooltip'
import { ColorSwatches } from '@/components/color-swatches/ColorSwatches'
import { OnRoadCalculator } from '@/components/price-calculator/OnRoadCalculator'
import { FiveYearCost } from '@/components/ownership/FiveYearCost'
import { assignPersonaTags } from '@/lib/persona-engine'

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
      },
      dimensions: true,
      fuelEconomy: true
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

  // Calculate overall score (Value for Money + Tech + Safety + Comfort)
  const totalScore = variant.scores.find(s => s.category.name === 'Overall')?.score || 600

  // Calculate Persona Tags
  const personaTags = assignPersonaTags({
    slug: variant.slug,
    name: variant.name,
    prices: variant.prices,
    scores: variant.scores,
    features: variant.features.map(f => ({ value: f.value }))
  })

  const img = getCarHeroImage(variant.model.slug) || getFallbackCarImage(variant.model.slug)

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
      {/* Header Card */}
      <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="h-64 md:h-auto bg-muted/20 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-border">
            {img ? (
              <Image
                src={img}
                alt={`${variant.model.manufacturer.name} ${variant.model.name}`}
                width={400}
                height={280}
                className="object-contain drop-shadow-md"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                <Car className="w-16 h-16" />
                <span className="text-[11px] font-medium tracking-wide">Official image unavailable.</span>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="p-8 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {variant.model.manufacturer.name} • {variant.model.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      {variant.name}
                    </h1>
                    <ShortlistButton slug={variant.slug} variantName={`${variant.model.name} ${variant.name}`} />
                  </div>
                </div>

                {/* Overall Score */}
                {radarData.length > 0 && (
                  <div className="text-center shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-card border border-border flex flex-col items-center justify-center shadow-sm">
                      <div className="text-lg font-extrabold text-foreground">{Math.round(totalScore)}</div>
                      <div className="text-[8px] text-muted-foreground uppercase tracking-wider">Overall</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Persona Badges */}
              {personaTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {personaTags.map(tag => (
                    <PersonaTag key={tag} tag={tag} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-semibold text-foreground">
                <Tag className="w-3.5 h-3.5" />
                {(variant.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(variant.prices[0]?.priceInrLakh || 0) : 'Price TBA'}
              </span>
              {variant.isBase && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  <Star className="w-3 h-3 fill-current" /> Base Model
                </span>
              )}
            </div>

            {/* Color Swatches */}
            {variant.colorOptions && (
              <div className="border-t border-border pt-4">
                <ColorSwatches optionsJson={variant.colorOptions} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RTO and EMI Calculator */}
      {(variant.prices[0]?.priceInrLakh || 0) > 0 && (
        <section className="space-y-4">
          <h2 className="text-base font-bold text-foreground uppercase tracking-wider">Pricing & EMI Estimator</h2>
          <OnRoadCalculator exShowroomPrice={variant.prices[0].priceInrLakh} />
        </section>
      )}

      {/* 5-Year Ownership Cost */}
      <section className="space-y-4">
        <FiveYearCost 
          exShowroomLakh={variant.prices[0]?.priceInrLakh || 0} 
          araiKmpl={variant.fuelEconomy?.araiKmpl || 16.5} 
        />
      </section>

      {/* Scores Section */}
      {radarData.length > 0 && (
        <div className="border border-border bg-card rounded-2xl p-6 shadow-[var(--shadow-sm)]">
          <h2 className="text-base font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[var(--accent-color)]" />
            Decision Score Grid
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="w-full max-w-lg mx-auto">
              <ScoreRadarChart data={radarData} />
            </div>
            <div className="space-y-3">
              {variant.scores.map(s => {
                const pct = (s.score / (s.category.maxScore || 200)) * 100
                return (
                  <div key={s.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground">{s.category.name}</span>
                      <span className="text-muted-foreground">{s.score}/{s.category.maxScore}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-color)] transition-all duration-700"
                        style={{ width: `${pct}%` }}
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
        <h2 className="text-base font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--accent-color)]" />
          Technical Features Checklist
        </h2>
        {Array.from(categoriesMap.entries()).map(([catName, vfs]) => (
          <div key={catName} className="border border-border bg-card rounded-xl overflow-hidden shadow-[var(--shadow-sm)]">
            <div className="px-4 py-2.5 border-b border-border bg-muted/20">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">{catName}</h3>
            </div>
            <ul className="divide-y divide-border">
              {vfs.map(vf => (
                <li key={vf.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <JargonTooltip term={vf.feature.name}>
                    <span className="font-semibold text-xs text-foreground cursor-help">{vf.feature.name}</span>
                  </JargonTooltip>
                  <span className="flex items-center gap-2">
                    {vf.value === 'YES' || vf.value === 'STANDARD' ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <Check className="h-3.5 w-3.5" /> Standard
                      </span>
                    ) : vf.value === 'OPTIONAL' ? (
                      <span className="text-amber-600 text-xs font-bold">Optional</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500/70 text-xs font-bold">
                        <X className="h-3.5 w-3.5" /> N/A
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {categoriesMap.size === 0 && (
          <div className="border border-border bg-card rounded-xl p-12 text-center shadow-[var(--shadow-sm)]">
            <p className="text-muted-foreground text-xs italic">No feature data available for this variant.</p>
          </div>
        )}
      </div>
    </div>
  )
}
