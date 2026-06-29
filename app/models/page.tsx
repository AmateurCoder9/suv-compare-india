import { db } from '@/lib/db'
import Link from 'next/link'
import { Car } from 'lucide-react'


export default async function ModelsIndexPage() {
  const manufacturers = await db.manufacturer.findMany({
    include: {
      models: {
        orderBy: { name: 'asc' },
        include: { media: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="container mx-auto px-4 py-10 space-y-14">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text inline-block">All SUV Models</h1>
        <p className="text-muted-foreground mt-2">Browse every petrol SUV under ₹20 lakh, organized by manufacturer.</p>
      </div>
      
      {manufacturers.map(manufacturer => (
        <section key={manufacturer.id}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              {manufacturer.name.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold">{manufacturer.name}</h2>
            <div className="flex-1 h-px bg-border/50"></div>
            <span className="text-xs text-muted-foreground">{manufacturer.models.length} models</span>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {manufacturer.models.map(model => {
              return (
                <Link key={model.id} href={`/models/${model.slug}`} className="border border-border bg-card rounded-lg flex flex-col hover:border-[var(--accent-color)]/30 transition-colors p-6 group shadow-[var(--shadow-sm)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] text-[var(--accent-color)] uppercase font-bold tracking-wider">{manufacturer.name}</div>
                      <div className="font-bold text-lg text-foreground mt-0.5 group-hover:text-[var(--accent-color)] transition-colors">{model.name}</div>
                    </div>
                    <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded font-mono text-muted-foreground font-semibold">
                      {model.launchYear}
                    </span>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-end border-t border-border pt-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 text-xs text-accent font-medium">
                      {model.bodyType}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          {manufacturer.models.length === 0 && (
            <p className="text-muted-foreground text-sm">No models found for {manufacturer.name}.</p>
          )}
        </section>
      ))}
    </div>
  )
}
