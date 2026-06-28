import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrencyLakh } from '@/lib/formatters'
import { PriceRangeBar } from '@/components/price-range-bar'
import { ArrowRight, Car, Tag } from 'lucide-react'
import Image from 'next/image'

const carImages: Record<string, string> = {
  'hyundai-creta': '/images/cars/hyundai-creta.png',
  'kia-seltos': '/images/cars/kia-seltos.png',
  'tata-nexon': '/images/cars/tata-nexon.png',
  'maruti-suzuki-grand-vitara': '/images/cars/maruti-grand-vitara.png',
}

function getCarImage(slug: string): string | null {
  if (carImages[slug]) return carImages[slug]
  for (const [key, value] of Object.entries(carImages)) {
    if (slug.includes(key)) return value
  }
  return null
}

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
      variants: {
        orderBy: { displayOrder: 'asc' },
        include: {
          prices: { orderBy: { priceInrLakh: 'asc' }, take: 1 }
        }
      }
    }
  })

  if (!model) notFound()

  const validPrices = model.variants.filter(v => (v.prices[0]?.priceInrLakh || 0) > 0).map(v => v.prices[0]?.priceInrLakh || 0)
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0
  const img = getCarImage(model.slug)

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-12">
      {/* Hero section */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="h-64 md:h-auto bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center p-8">
            {img ? (
              <Image
                src={img}
                alt={`${model.manufacturer.name} ${model.name}`}
                width={400}
                height={280}
                className="object-contain drop-shadow-lg"
              />
            ) : (
              <Car className="w-24 h-24 text-muted-foreground/20" />
            )}
          </div>
          
          {/* Info */}
          <div className="p-8 flex flex-col justify-center">
            <div className="text-xs text-primary font-medium uppercase tracking-wider">{model.manufacturer.name}</div>
            <h1 className="text-3xl font-bold tracking-tight mt-1">{model.name}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/50 text-xs text-muted-foreground">
                {model.bodyType}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/50 text-xs text-muted-foreground">
                Launched {model.launchYear}
              </span>
              {model.generationName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/50 text-xs text-muted-foreground">
                  {model.generationName}
                </span>
              )}
            </div>

            {/* Price Range */}
            {minPrice > 0 && maxPrice > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="w-4 h-4 text-primary" />
                  Price Range
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
      </div>

      {/* Variants list */}
      <div>
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
          Variants
          <span className="text-sm font-normal text-muted-foreground">({model.variants.length})</span>
        </h2>
        <div className="space-y-3">
          {model.variants.map((variant) => (
            <Link key={variant.id} href={`/variants/${variant.slug}`}>
              <div className="glass-card rounded-xl p-5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
                    <Car className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{variant.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {variant.isBase ? '⭐ Base Model' : 'Higher Trim'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {(variant.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(variant.prices[0]?.priceInrLakh || 0) : 'TBA'}
                    </div>
                    <div className="text-xs text-muted-foreground">Ex-showroom</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
          {model.variants.length === 0 && (
            <div className="glass-card rounded-xl p-12 text-center">
              <p className="text-muted-foreground">No variants found for this model.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
