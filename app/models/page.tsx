import { db } from '@/lib/db'
import Link from 'next/link'
import { Car } from 'lucide-react'
import Image from 'next/image'

import { getPrimaryImage, getFallbackCarImage } from '@/lib/images'

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
              const img = getPrimaryImage(model.media) || getFallbackCarImage(model.slug)
              return (
                <Link key={model.id} href={`/models/${model.slug}`}>
                  <div className="glass-card rounded-xl overflow-hidden group h-full flex flex-col">
                    <div className="h-52 bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center overflow-hidden relative">
                      {img ? (
                        <Image
                          src={img}
                          alt={`${manufacturer.name} ${model.name}`}
                          width={300}
                          height={200}
                          className="object-contain scale-110 group-hover:scale-125 drop-shadow-md transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-white/20">
                          <Car className="w-8 h-8" />
                          <span className="text-[9px] font-medium tracking-wide">Official image unavailable.</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary">
                        {model.launchYear}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{manufacturer.name} {model.name}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-2 rounded-md bg-accent/50 text-xs text-muted-foreground">
                        {model.bodyType}
                      </span>
                    </div>
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
