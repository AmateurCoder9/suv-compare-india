import { db } from '@/lib/db'
import { GlobalSearchBar } from '@/components/global-search-bar'
import Link from 'next/link'
import { getTopVariantsByCategory } from '@/lib/rankings'
import { formatCurrencyLakh } from '@/lib/formatters'
import { Car, GitCompareArrows, Trophy, Shield } from 'lucide-react'


// Import new Buyer Intelligence components
import { BudgetFinder } from '@/components/budget-finder/BudgetFinder'
import { FilterPresets } from '@/components/filter-presets/FilterPresets'
import { PopularComparisons } from '@/components/popular-comparisons/PopularComparisons'

export default async function HomePage() {
  const recentModels = await db.model.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { manufacturer: true, media: true }
  })

  const topValueVariants = await getTopVariantsByCategory('Value for Money', 10)

  const stats = {
    models: await db.model.count(),
    variants: await db.variant.count(),
    manufacturers: await db.manufacturer.count(),
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 max-w-6xl">
      {/* ─── Header / Search Block ───────────────────────────── */}
      <section className="border border-border bg-card p-6 rounded-lg space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SUV Compare India 2026
          </h1>
          <p className="text-sm text-muted-foreground">
            A fully structured database comparing every petrol SUV variant under ₹20 lakh. Search, compare, and filter by score.
          </p>
        </div>

        <div className="max-w-xl">
          <GlobalSearchBar />
        </div>

        {/* Database Stats */}
        <div className="flex gap-6 text-xs text-muted-foreground pt-1 border-t border-border/50">
          <div><span className="font-semibold text-foreground">{stats.manufacturers}</span> Manufacturers</div>
          <div><span className="font-semibold text-foreground">{stats.models}</span> SUV Models</div>
          <div><span className="font-semibold text-foreground">{stats.variants}</span> Variants Indexed</div>
        </div>
      </section>

      {/* ─── Find My SUV Advisor Quiz Banner ─────────────────── */}
      <section className="relative overflow-hidden border border-[var(--surface-3)] bg-[var(--surface-1)] p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[var(--shadow-sm)]">
        <div className="space-y-1 relative z-10">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Confused between multiple SUVs?</h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm">Take our 1-minute personalized advisor quiz to find the perfect trim match.</p>
        </div>
        
        {/* Decorative background car image */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.03] pointer-events-none hidden sm:flex items-center justify-end overflow-hidden">
          <Car className="w-64 h-64 -mr-16 text-[var(--text-primary)]" />
        </div>

        <Link
          href="/quiz"
          className="relative z-10 inline-flex items-center justify-center bg-[var(--accent-color)] text-white text-xs font-bold px-4.5 py-2.5 rounded-[var(--radius-md)] hover:opacity-90 transition-all shrink-0 cursor-pointer text-center"
        >
          Find My SUV Quiz
        </Link>
      </section>

      {/* ─── Fast Navigation Links ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/models', icon: Car, label: 'All SUV Models' },
          { href: '/compare', icon: GitCompareArrows, label: 'Compare Variants' },
          { href: '/rankings', icon: Trophy, label: 'Scoring Rankings' },
          { href: '/buyer-guides', icon: Shield, label: 'Buyer Guides' },
        ].map(action => (
          <Link key={action.href} href={action.href} className="flex items-center gap-3 p-3 border border-border bg-card rounded-lg hover:bg-muted/50 transition-colors">
            <action.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* ─── Scenario Presets ─────────────────────────────────── */}
      <section className="border border-[var(--surface-3)] bg-[var(--surface-1)] p-5 rounded-lg shadow-[var(--shadow-sm)]">
        <FilterPresets />
      </section>

      {/* ─── Budget Finder ───────────────────────────────────── */}
      <BudgetFinder />

      {/* ─── Recently Indexed Models ──────────────────────────── */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-border pb-2">
          <h2 className="text-lg font-bold text-foreground">Recently Indexed</h2>
          <Link href="/models" className="text-xs text-muted-foreground hover:text-foreground">
            View all models →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentModels.map(model => {
            return (
              <Link key={model.id} href={`/models/${model.slug}`} className="border border-border bg-card rounded-lg flex flex-col hover:border-[var(--accent-color)]/30 transition-colors p-4 group">
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] text-[var(--accent-color)] uppercase font-bold tracking-wider">{model.manufacturer.name}</div>
                      <div className="font-bold text-base text-foreground mt-0.5 group-hover:text-[var(--accent-color)] transition-colors">{model.name}</div>
                    </div>
                    <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded font-mono text-muted-foreground font-semibold">
                      {model.launchYear}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-4 font-mono font-medium">{model.bodyType}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ─── Popular Head-to-Head Comparisons ─────────────────── */}
      <section className="border border-[var(--surface-3)] bg-[var(--surface-1)] p-5 rounded-lg shadow-[var(--shadow-sm)]">
        <PopularComparisons />
      </section>

      {/* ─── Top Value Rankings Table ─────────────────────────── */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-border pb-2">
          <h2 className="text-lg font-bold text-foreground">Top Value for Money Rankings</h2>
          <Link href="/rankings/Value%20for%20Money" className="text-xs text-muted-foreground hover:text-foreground">
            Full rankings →
          </Link>
        </div>

        {topValueVariants.length > 0 ? (
          <div className="border border-border rounded-lg overflow-x-auto bg-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left w-12 p-3 border-b border-border text-muted-foreground">Rank</th>
                  <th className="text-left p-3 border-b border-border text-muted-foreground">SUV Variant</th>
                  <th className="text-right p-3 border-b border-border text-muted-foreground">Price (Delhi Ex-Showroom)</th>
                  <th className="text-right w-32 p-3 border-b border-border text-muted-foreground">Score (out of 1000)</th>
                </tr>
              </thead>
              <tbody>
                {topValueVariants.map((variant, idx) => (
                  <tr key={variant.id} className="hover:bg-muted/30 transition-colors border-b border-border/50 group">
                    <td className="text-left font-mono text-xs p-3 font-semibold text-muted-foreground">{idx + 1}</td>
                    <td className="p-3">
                      <Link href={`/variants/${variant.slug}`} className="font-semibold text-foreground hover:underline">
                        {variant.model.manufacturer.name} {variant.model.name} <span className="font-normal text-muted-foreground text-xs">({variant.name})</span>
                      </Link>
                    </td>
                    <td className="text-right font-mono text-xs">
                      {(variant.prices[0]?.priceInrLakh || 0) > 0 ? formatCurrencyLakh(variant.prices[0]?.priceInrLakh || 0) : 'TBA'}
                    </td>
                    <td className="text-right">
                      <span className="score-badge font-mono">{variant.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-border p-6 text-center text-sm text-muted-foreground bg-card rounded-lg">
            No rankings available. Run computation engine.
          </div>
        )}
      </section>
    </div>
  )
}
