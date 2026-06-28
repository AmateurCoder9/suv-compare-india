import { db } from '@/lib/db'
import { GlobalSearchBar } from '@/components/global-search-bar'
import Link from 'next/link'
import { getTopVariantsByCategory } from '@/lib/rankings'
import { formatCurrencyLakh } from '@/lib/formatters'
import { ArrowRight, BarChart3, Car, GitCompareArrows, Trophy, Shield, Zap } from 'lucide-react'
import Image from 'next/image'
import { Hero3DCar } from '@/components/hero-3d-car'

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

export default async function HomePage() {
  const recentModels = await db.model.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: { manufacturer: true }
  })

  const topValueVariants = await getTopVariantsByCategory('Value for Money', 5)

  const stats = {
    models: await db.model.count(),
    variants: await db.variant.count(),
    manufacturers: await db.manufacturer.count(),
  }

  return (
    <div className="space-y-0">
      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="space-y-8 animate-slide-up z-10 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 glass text-xs font-medium text-white/80">
                <Zap className="w-3.5 h-3.5 text-primary" />
                2026 Edition — Updated Weekly
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
                Find Your <br />
                <span className="gradient-text">Perfect SUV</span>
              </h1>

              <p className="text-lg text-white/60 max-w-lg leading-relaxed">
                Compare every petrol SUV under ₹20 lakh in India. Real specs, transparent scoring out of 1000, 
                and side-by-side feature breakdowns — powered by data, not opinions.
              </p>

              <div className="max-w-lg">
                <GlobalSearchBar />
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-2">
                <div>
                  <div className="text-3xl font-bold gradient-text">{stats.manufacturers}+</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Brands</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">{stats.models}+</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Models</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">{stats.variants}+</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Variants</div>
                </div>
              </div>
            </div>

            {/* Right: 3D Hero */}
            <div className="relative animate-fade-in lg:ml-8 z-0">
              <Hero3DCar />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quick Actions ────────────────────────────────────── */}
      <section className="container mx-auto px-4 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: '/models', icon: Car, label: 'Browse Models', desc: 'All SUVs at a glance', color: 'text-white' },
            { href: '/compare', icon: GitCompareArrows, label: 'Compare', desc: 'Side-by-side specs', color: 'text-white' },
            { href: '/rankings', icon: Trophy, label: 'Rankings', desc: 'Top scorers by category', color: 'text-white' },
            { href: '/buyer-guides', icon: Shield, label: 'Buyer Guides', desc: 'Expert recommendations', color: 'text-white' },
          ].map(action => (
            <Link key={action.href} href={action.href}>
              <div className="glass-card p-5 flex items-center gap-4 group">
                <div className={`w-12 h-12 rounded-2xl glass flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white/90">{action.label}</div>
                  <div className="text-xs text-white/50">{action.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Recently Added Models ────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white/90">Recently Added</h2>
            <p className="text-sm text-white/50 mt-1">The latest SUVs in our database</p>
          </div>
          <Link href="/models" className="text-sm text-primary hover:text-primary-foreground transition-colors flex items-center gap-1 font-medium">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentModels.map((model, idx) => {
            const img = getCarImage(model.slug)
            return (
              <Link key={model.id} href={`/models/${model.slug}`}>
                <div className="glass-card overflow-hidden group" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {/* Image area */}
                  <div className="h-44 bg-white/5 flex items-center justify-center overflow-hidden relative">
                    {img ? (
                      <Image
                        src={img}
                        alt={`${model.manufacturer.name} ${model.name}`}
                        width={280}
                        height={180}
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Car className="w-16 h-16 text-white/10" />
                    )}
                    {/* Year badge */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg glass text-xs font-medium text-white/80">
                      {model.launchYear}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="text-xs text-white/40 font-medium uppercase tracking-wider">{model.manufacturer.name}</div>
                    <h3 className="text-lg font-semibold mt-1 text-white/90">{model.name}</h3>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 text-[11px] font-medium text-white/60">
                        {model.bodyType}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ─── Top Value for Money ──────────────────────────────── */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white/90 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Top Value for Money
            </h2>
            <p className="text-sm text-white/50 mt-1">Best bang for your buck</p>
          </div>
          <Link href="/rankings/Value%20for%20Money" className="text-sm text-primary hover:text-primary-foreground transition-colors flex items-center gap-1 font-medium">
            Full rankings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {topValueVariants.length > 0 ? (
          <div className="space-y-3">
            {topValueVariants.map((variant, idx) => (
              <Link key={variant.id} href={`/variants/${variant.slug}`} className="block">
                <div className="glass-card p-5 flex items-center gap-5 group">
                  {/* Rank */}
                  <div className={`text-3xl font-extrabold w-12 text-center ${
                    idx === 0 ? 'rank-gold' : idx === 1 ? 'rank-silver' : idx === 2 ? 'rank-bronze' : 'text-white/30'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-white/90">
                      {variant.model.manufacturer.name} {variant.model.name}
                    </div>
                    <div className="text-sm text-white/50 mt-0.5">{variant.name}</div>
                  </div>

                  {/* Score + Price */}
                  <div className="text-right shrink-0">
                    <div className="score-badge text-sm font-bold text-white/90">
                      {variant.score}<span className="text-white/50 font-normal">/1000</span>
                    </div>
                    <div className="text-lg font-bold mt-2 text-white/90">
                      {(variant.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(variant.prices[0]?.priceInrLakh || 0) : 'TBA'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <BarChart3 className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/50">Rankings are being calculated...</p>
          </div>
        )}
      </section>

      {/* ─── CTA Banner ──────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-[2rem] overflow-hidden relative glass border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
          <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white/90">Ready to compare?</h3>
              <p className="text-white/60 mt-2 max-w-md">
                Pick any two variants and see exactly how they stack up — feature by feature, spec by spec.
              </p>
            </div>
            <Link
              href="/compare"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-2xl transition-all flex items-center gap-2 shrink-0 backdrop-blur-xl"
            >
              <GitCompareArrows className="w-5 h-5" />
              Start Comparing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
