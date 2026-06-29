import Link from 'next/link'
import { Shield, Users, Gem, Star, Building2, Map, Zap, IndianRupee } from 'lucide-react'

const GUIDES = [
  { slug: 'best-under-15l', title: 'Best SUVs Under ₹15 Lakh', icon: IndianRupee, desc: 'Maximum value without stretching the budget.' },
  { slug: 'best-under-17l', title: 'Best SUVs Under ₹17 Lakh', icon: IndianRupee, desc: 'The sweet spot for features and performance.' },
  { slug: 'best-under-20l', title: 'Best SUVs Under ₹20 Lakh', icon: IndianRupee, desc: 'Top-tier trims with all the bells and whistles.' },
  { slug: 'best-family', title: 'Best Family SUVs', icon: Users, desc: 'Prioritizing safety, rear comfort, and boot space.' },
  { slug: 'best-luxury', title: 'Best Luxury SUVs', icon: Gem, desc: 'Premium interiors and high-end features.' },
  { slug: 'most-mercedes-like', title: 'Most "Mercedes-like" SUVs', icon: Star, desc: 'Focusing on NVH, ride quality, and plush cabins.' },
  { slug: 'best-city', title: 'Best City SUVs', icon: Building2, desc: 'Easy to park, smooth transmissions, and good visibility.' },
  { slug: 'best-highway', title: 'Best Highway Cruisers', icon: Map, desc: 'High speed stability, strong engines, and comfortable seats.' },
  { slug: 'best-value', title: 'Best Value for Money', icon: Shield, desc: 'Maximum points per rupee spent.' },
  { slug: 'best-driver', title: "Best Driver's SUVs", icon: Zap, desc: 'Performance, handling, and steering feedback.' },
]

export const metadata = {
  title: 'Buyer Guides | SUV Compare India',
  description: 'Curated lists of the best SUVs based on 1000-point data analysis.',
}

export default function BuyerGuidesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Data-Driven Buyer Guides</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          We don't rely on subjective opinions. Our buyer guides are generated automatically by crunching over 1,000 data points across 24 categories for every single variant in our database.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {GUIDES.map(guide => (
          <Link key={guide.slug} href={`/buyer-guides/${guide.slug}`} className="block border border-border bg-card p-5 rounded-xl hover:border-accent hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <guide.icon className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-semibold text-lg text-foreground mb-1">{guide.title}</h2>
            <p className="text-sm text-muted-foreground">{guide.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
