import { db } from '@/lib/db'
import { CompareEngine } from '@/components/compare-engine'
import { Suspense } from 'react'
import { GitCompareArrows, Loader2 } from 'lucide-react'

export default async function ComparePage() {
  const variants = await db.variant.findMany({
    include: {
      model: {
        include: {
          manufacturer: true
        }
      },
      prices: {
        orderBy: { priceInrLakh: 'asc' },
        take: 1
      }
    }
  })

  variants.sort((a, b) => {
    const priceA = a.prices[0]?.priceInrLakh || 0
    const priceB = b.prices[0]?.priceInrLakh || 0
    return priceA - priceB
  })

  const options = variants.map(v => ({
    value: v.slug,
    label: `${v.model.manufacturer.name} ${v.model.name} ${v.name}`
  })).sort((a, b) => a.label.localeCompare(b.label))

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <GitCompareArrows className="w-8 h-8 text-blue-400" />
          <span className="gradient-text">Compare SUVs</span>
        </h1>
        <p className="text-muted-foreground mt-2">Select two variants to see a detailed side-by-side comparison of every feature and spec.</p>
      </div>
      <Suspense fallback={
        <div className="glass-card rounded-xl p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading comparison engine...</p>
        </div>
      }>
        <CompareEngine options={options} />
      </Suspense>
    </div>
  )
}
