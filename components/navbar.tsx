'use client'

import Link from 'next/link'
import { GlobalSearchBar } from './global-search-bar'
import { useState } from 'react'
import { Menu, X, Car, BarChart3, GitCompareArrows, BookOpen, Trophy } from 'lucide-react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/models', label: 'Models', icon: Car },
    { href: '/compare', label: 'Compare', icon: GitCompareArrows },
    { href: '/rankings', label: 'Rankings', icon: Trophy },
    { href: '/buyer-guides', label: 'Guides', icon: BookOpen },
  ]

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-lg tracking-tight gradient-text">SUV Compare</span>
            <span className="text-xs text-muted-foreground block -mt-1 tracking-wider">INDIA 2026</span>
          </div>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <GlobalSearchBar />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-accent/50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 px-4 py-4 space-y-2 animate-slide-up">
          <div className="mb-3">
            <GlobalSearchBar />
          </div>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
