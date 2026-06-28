import { db } from '@/lib/db'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function BuyerGuidesIndexPage() {
  const guides = await db.buyerGuide.findMany({
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Buyer Guides</h1>
      
      <div className="grid gap-6">
        {guides.map(guide => (
          <Link key={guide.id} href={`/buyer-guides/${guide.slug}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>{guide.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{guide.description}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Last updated: {new Date(guide.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {guides.length === 0 && (
          <div className="p-12 border rounded-lg border-dashed text-center text-muted-foreground">
            No buyer guides available yet.
          </div>
        )}
      </div>
    </div>
  )
}
