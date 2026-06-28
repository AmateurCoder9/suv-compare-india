import { db } from '@/lib/db'
import { performSearch } from '@/lib/search'
import Link from 'next/link'
import { Search, ArrowRight, Car } from 'lucide-react'

export default async function SearchResultsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q: query } = await searchParams

  let results: ReturnType<typeof performSearch> = []

  if (query) {
    const variants = await db.variant.findMany({
      include: {
        model: {
          include: {
            manufacturer: true
          }
        }
      }
    })

    const searchableData = variants.map(variant => ({
      id: variant.id,
      slug: variant.slug,
      name: variant.name,
      model: variant.model.name,
      manufacturer: variant.model.manufacturer.name,
      fullName: `${variant.model.manufacturer.name} ${variant.model.name} ${variant.name}`,
      bodyType: variant.model.bodyType,
    }))

    results = performSearch(query, searchableData)
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Search className="w-7 h-7 text-primary" />
          {query ? (
            <>
              Results for <span className="gradient-text">&ldquo;{query}&rdquo;</span>
            </>
          ) : 'Search'}
        </h1>
        {query && <p className="text-muted-foreground mt-2">{results.length} {results.length === 1 ? 'result' : 'results'} found</p>}
      </div>

      <div className="space-y-3">
        {results.length > 0 ? (
          results.map((result) => (
            <Link key={result.id} href={`/variants/${result.slug}`} className="block">
              <div className="glass-card rounded-xl p-5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
                    <Car className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold group-hover:text-primary transition-colors">{result.fullName}</div>
                    <div className="text-xs text-muted-foreground">{result.bodyType}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))
        ) : (
          <div className="glass-card rounded-xl p-14 text-center">
            <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {query ? 'No results found. Try a different search term.' : 'Enter a search term to find SUVs.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
