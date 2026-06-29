import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCarHeroImage, getFallbackCarImage } from '@/lib/images'
import { formatCurrencyLakh } from '@/lib/formatters'
import { Trophy, CheckCircle2 } from 'lucide-react'

const GUIDES = {
  'best-under-15l': { title: 'Best SUVs Under ₹15 Lakh', desc: 'Maximum value without stretching the budget.', filter: (v: any) => v.price <= 15, sort: (a: any, b: any) => b.scores['Overall'] - a.scores['Overall'] },
  'best-under-17l': { title: 'Best SUVs Under ₹17 Lakh', desc: 'The sweet spot for features and performance.', filter: (v: any) => v.price <= 17, sort: (a: any, b: any) => b.scores['Overall'] - a.scores['Overall'] },
  'best-under-20l': { title: 'Best SUVs Under ₹20 Lakh', desc: 'Top-tier trims with all the bells and whistles.', filter: (v: any) => v.price <= 20, sort: (a: any, b: any) => b.scores['Overall'] - a.scores['Overall'] },
  'best-family': { title: 'Best Family SUVs', desc: 'Prioritizing safety, rear comfort, and boot space.', filter: () => true, sort: (a: any, b: any) => (b.scores['Comfort'] + b.scores['Rear Comfort'] + b.scores['Safety'] + b.scores['Boot']) - (a.scores['Comfort'] + a.scores['Rear Comfort'] + a.scores['Safety'] + a.scores['Boot']) },
  'best-luxury': { title: 'Best Luxury SUVs', desc: 'Premium interiors and high-end features.', filter: () => true, sort: (a: any, b: any) => b.scores['Luxury'] - a.scores['Luxury'] },
  'most-mercedes-like': { title: 'Most "Mercedes-like" SUVs', desc: 'Focusing on NVH, ride quality, and plush cabins.', filter: () => true, sort: (a: any, b: any) => (b.scores['Luxury'] + b.scores['NVH'] + b.scores['Ride'] + b.scores['Interior']) - (a.scores['Luxury'] + a.scores['NVH'] + a.scores['Ride'] + a.scores['Interior']) },
  'best-city': { title: 'Best City SUVs', desc: 'Easy to park, smooth transmissions, and good visibility.', filter: () => true, sort: (a: any, b: any) => (b.scores['Transmission'] + b.scores['Handling'] + b.scores['Fuel Economy'] + b.scores['Practicality']) - (a.scores['Transmission'] + a.scores['Handling'] + a.scores['Fuel Economy'] + a.scores['Practicality']) },
  'best-highway': { title: 'Best Highway Cruisers', desc: 'High speed stability, strong engines, and comfortable seats.', filter: () => true, sort: (a: any, b: any) => (b.scores['Engine'] + b.scores['Handling'] + b.scores['Safety'] + b.scores['Front Comfort']) - (a.scores['Engine'] + a.scores['Handling'] + a.scores['Safety'] + a.scores['Front Comfort']) },
  'best-value': { title: 'Best Value for Money', desc: 'Maximum points per rupee spent.', filter: () => true, sort: (a: any, b: any) => b.scores['Value'] - a.scores['Value'] },
  'best-driver': { title: "Best Driver's SUVs", desc: 'Performance, handling, and steering feedback.', filter: () => true, sort: (a: any, b: any) => (b.scores['Performance'] + b.scores['Handling'] + b.scores['Steering'] + b.scores['Engine']) - (a.scores['Performance'] + a.scores['Handling'] + a.scores['Steering'] + a.scores['Engine']) },
}

export default async function BuyerGuideDetailPage({ params }: { params: { slug: string } }) {
  const guide = GUIDES[params.slug as keyof typeof GUIDES]
  if (!guide) notFound()

  const rawVariants = await db.variant.findMany({
    include: {
      model: { include: { manufacturer: true } },
      prices: { where: { isLatest: true }, take: 1 },
      scores: { include: { category: true } }
    }
  })

  // Format data
  const formattedVariants = rawVariants.map(v => {
    const scoresMap: Record<string, number> = {}
    v.scores.forEach(s => {
      scoresMap[s.category.name] = s.score
    })
    return {
      ...v,
      price: v.prices[0]?.priceInrLakh || 0,
      scores: scoresMap
    }
  })

  // Filter & Sort
  const filtered = formattedVariants.filter(guide.filter)
  const sorted = filtered.sort(guide.sort).slice(0, 5) // Top 5

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{guide.title}</h1>
        <p className="text-muted-foreground text-lg">{guide.desc}</p>
      </div>

      <div className="space-y-8 mt-12">
        {sorted.map((variant, idx) => {
          const img = getCarHeroImage(variant.model.slug) || getFallbackCarImage(variant.model.slug)
          const rank = idx + 1
          
          return (
            <div key={variant.id} className="border border-border bg-card rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] flex flex-col md:flex-row relative group hover:border-accent/40 transition-colors">
              <div className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white">
                #{rank}
              </div>
              
              <div className="md:w-2/5 bg-gradient-to-br from-muted/20 to-muted/40 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border min-h-[250px]">
                {img ? (
                  <Image src={img} alt={variant.model.name} width={400} height={250} className="object-contain scale-110 drop-shadow-xl group-hover:scale-125 transition-transform duration-500" />
                ) : null}
              </div>

              <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-accent font-bold uppercase tracking-wider mb-1">{variant.model.manufacturer.name}</div>
                  <h2 className="text-2xl font-bold text-foreground">
                    <Link href={`/variants/${variant.slug}`} className="hover:underline">
                      {variant.model.name} <span className="text-muted-foreground font-medium">({variant.name})</span>
                    </Link>
                  </h2>
                  <div className="text-xl font-mono font-extrabold mt-3 bg-accent/10 text-accent inline-block px-3 py-1 rounded">
                    ₹{formatCurrencyLakh(variant.price)} Lakh
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-sm">Why it's #1</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {variant.buyIfText || `Scores highly in key metrics like ${guide.title.split(' ')[1]}.`}
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <Link href={`/variants/${variant.slug}`} className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
                    View full specs &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
