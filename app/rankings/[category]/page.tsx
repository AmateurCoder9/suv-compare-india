import { getTopVariantsByCategory } from '@/lib/rankings'
import Link from 'next/link'
import { formatCurrencyLakh } from '@/lib/formatters'
import { Trophy, ArrowRight } from 'lucide-react'

export default async function RankingsCategoryPage({
  params
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  
  const variants = await getTopVariantsByCategory(decodedCategory, 20)

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-7 h-7 text-amber-400" />
          <h1 className="text-3xl font-bold tracking-tight">
            Top SUVs for <span className="gradient-text">{decodedCategory}</span>
          </h1>
        </div>
        <p className="text-muted-foreground">Ranked by our transparent scoring methodology out of 1000.</p>
      </div>
      
      {variants.length > 0 ? (
        <div className="space-y-3">
          {variants.map((variant, idx) => (
            <Link key={variant.id} href={`/variants/${variant.slug}`} className="block">
              <div className="glass-card rounded-xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-5 group">
                {/* Rank */}
                <div className={`text-2xl font-extrabold w-12 text-center ${
                  idx === 0 ? 'rank-gold' : idx === 1 ? 'rank-silver' : idx === 2 ? 'rank-bronze' : 'text-muted-foreground'
                }`}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">
                    {variant.model.manufacturer.name} {variant.model.name}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{variant.name}</div>
                </div>

                {/* Score + Price */}
                <div className="text-right shrink-0">
                  <div className="score-badge text-sm font-bold">
                    {variant.score}<span className="text-muted-foreground font-normal">/1000</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {(variant.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(variant.prices[0]?.priceInrLakh || 0) : 'Price TBA'}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-14 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">No rankings available for this category yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Run the scoring engine to populate data.</p>
        </div>
      )}
    </div>
  )
}
