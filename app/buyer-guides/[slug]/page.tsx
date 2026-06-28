import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export default async function BuyerGuideDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const guide = await db.buyerGuide.findUnique({
    where: { slug },
    include: {
      entries: {
        orderBy: { rank: 'asc' },
        include: {
          model: {
            include: {
              manufacturer: true
            }
          }
        }
      }
    }
  })

  if (!guide) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-4">{guide.title}</h1>
        <p className="text-lg text-muted-foreground">{guide.description}</p>
      </header>

      <section className="bg-muted/30 p-6 rounded-lg border">
        <h2 className="font-semibold mb-2">Judging Criteria</h2>
        <p className="text-muted-foreground">{guide.criteria}</p>
      </section>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Top Recommendations</h2>
        {guide.entries.map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="text-5xl font-extrabold text-muted-foreground opacity-50 shrink-0">
                #{entry.rank}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">
                    <Link href={`/models/${entry.model.slug}`} className="hover:text-primary transition-colors">
                      {entry.model.manufacturer.name} {entry.model.name}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground">{entry.model.bodyType}</p>
                </div>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {entry.explanation}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {guide.entries.length === 0 && (
          <p className="text-muted-foreground">No recommendations added to this guide yet.</p>
        )}
      </div>
    </div>
  )
}
