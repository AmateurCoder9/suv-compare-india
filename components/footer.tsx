import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center relative overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="SUV Compare Logo"
                  fill
                  className="object-contain p-1.5"
                />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">SUV Compare</span>
                <span className="text-xs text-muted-foreground block -mt-1 tracking-wider">INDIA 2026</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              The most comprehensive, data-driven SUV comparison database for Indian buyers. 
              Transparent scoring, real specs, zero fluff.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Explore</h3>
            <div className="space-y-2.5">
              <Link href="/models" className="block text-sm text-foreground/70 hover:text-primary transition-colors">All Models</Link>
              <Link href="/compare" className="block text-sm text-foreground/70 hover:text-primary transition-colors">Compare SUVs</Link>
              <Link href="/rankings" className="block text-sm text-foreground/70 hover:text-primary transition-colors">Rankings</Link>
              <Link href="/buyer-guides" className="block text-sm text-foreground/70 hover:text-primary transition-colors">Buyer Guides</Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">About</h3>
            <div className="space-y-2.5">
              <p className="text-sm text-foreground/70">All prices are ex-showroom Delhi</p>
              <p className="text-sm text-foreground/70">Data updated regularly</p>
              <p className="text-sm text-foreground/70">Petrol SUVs under ₹20L</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SUV Compare India. Built with <Heart className="w-3 h-3 inline text-red-400" /> for car enthusiasts.
          </p>
          <p className="text-xs text-muted-foreground">
            Not affiliated with any manufacturer. All data sourced from public brochures.
          </p>
        </div>
      </div>
    </footer>
  )
}
