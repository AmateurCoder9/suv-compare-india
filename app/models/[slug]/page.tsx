import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrencyLakh } from '@/lib/formatters'
import { PriceRangeBar } from '@/components/price-range-bar'
import { ArrowRight, Car, Tag } from 'lucide-react'


// Import new Buyer Intelligence components
import { ShortlistButton } from '@/components/shortlist/ShortlistButton'
import { PersonaTag } from '@/components/persona/PersonaTag'
import { VariantDelta } from '@/components/variant-delta/VariantDelta'
import { assignPersonaTags } from '@/lib/persona-engine'

export default async function ModelOverviewPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const model = await db.model.findUnique({
    where: { slug },
    include: {
      manufacturer: true,
      media: true,
      variants: {
        orderBy: { displayOrder: 'asc' },
        include: {
          prices: { orderBy: { priceInrLakh: 'asc' }, take: 1 },
          scores: { include: { category: true } },
          features: { include: { feature: true } }
        }
      }
    }
  })

  if (!model) notFound()

  const validPrices = model.variants.filter(v => (v.prices[0]?.priceInrLakh || 0) > 0).map(v => v.prices[0]?.priceInrLakh || 0)
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0

  // Construct modelVariants list for trim upgrade explainer
  const modelVariants = model.variants.map(v => ({
    name: v.name,
    slug: v.slug,
    price: v.prices[0]?.priceInrLakh || 0
  })).filter(v => v.price > 0)

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-12">
      {/* Hero section */}
      <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="p-8 flex flex-col justify-center">
            <div className="text-xs text-[var(--accent-color)] font-bold uppercase tracking-wider">{model.manufacturer.name}</div>
            <h1 className="text-3xl font-bold tracking-tight mt-1">{model.name}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary border border-border text-xs text-muted-foreground font-semibold">
                {model.bodyType}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary border border-border text-xs text-muted-foreground font-semibold">
                Launched {model.launchYear}
              </span>
              {model.generationName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary border border-border text-xs text-muted-foreground font-semibold">
                  {model.generationName}
                </span>
              )}
            </div>

            {/* Price Range */}
            {minPrice > 0 && maxPrice > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="w-4 h-4 text-[var(--accent-color)]" />
                  Delhi Price Range
                </div>
                <div className="max-w-sm">
                  <PriceRangeBar 
                    minPrice={minPrice} 
                    maxPrice={maxPrice} 
                    currentPrice={(minPrice + maxPrice) / 2} 
                    formatPrice={formatCurrencyLakh}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Variants list */}
      <div>
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
          Variants Trims
          <span className="text-sm font-normal text-muted-foreground">({model.variants.length})</span>
        </h2>
        <div className="space-y-3">
          {model.variants.map((variant) => {
            const personaTags = assignPersonaTags({
              slug: variant.slug,
              name: variant.name,
              prices: variant.prices,
              scores: variant.scores,
              features: variant.features.map(f => ({ value: f.value }))
            })

            return (
              <Link key={variant.id} href={`/variants/${variant.slug}`}>
                <div className="border border-border bg-card rounded-xl p-4 flex items-center justify-between group hover:border-[var(--accent-color)]/30 transition-all duration-150 relative">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-[var(--accent-color)] transition-colors">{variant.name}</h3>
                        <ShortlistButton slug={variant.slug} variantName={`${model.name} ${variant.name}`} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {variant.isBase ? '⭐ Base Trim' : 'Higher Trim'}
                      </p>
                      {/* Persona badges */}
                      {personaTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {personaTags.map(tag => (
                            <PersonaTag key={tag} tag={tag} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono font-bold text-base">
                        {(variant.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(variant.prices[0]?.priceInrLakh || 0) : 'TBA'}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Ex-showroom</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[var(--accent-color)] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            )
          })}
          {model.variants.length === 0 && (
            <div className="border border-border bg-card rounded-xl p-12 text-center shadow-[var(--shadow-sm)]">
              <p className="text-muted-foreground">No variants found for this model.</p>
            </div>
          )}
        </div>
      </div>

      {/* Trim Upgrade Explainer */}
      {modelVariants.length >= 2 && (
        <section className="space-y-4 pt-4 border-t border-border">
          <VariantDelta modelVariants={modelVariants} />
        </section>
      )}
    </div>
  )
}
