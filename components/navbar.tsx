'use client'

import Link from 'next/link'
import { GlobalSearchBar } from './global-search-bar'
import { useState } from 'react'
import { Menu, X, Car, GitCompareArrows, BookOpen, Trophy } from 'lucide-react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/models', label: 'Models', icon: Car },
    { href: '/compare', label: 'Compare', icon: GitCompareArrows },
    { href: '/rankings', label: 'Rankings', icon: Trophy },
    { href: '/buyer-guides', label: 'Guides', icon: BookOpen },
  ]

  return (
    <nav className="mac-toolbar">
      <div className="w-full flex items-center justify-between gap-4">
        {/* macOS Traffic Lights */}
        <div className="traffic-lights">
          <div className="traffic-light close"></div>
          <div className="traffic-light min"></div>
          <div className="traffic-light max"></div>
        </div>

        {/* Logo / App Name */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="hidden sm:block text-sm font-semibold tracking-tight text-foreground">
            SUV Compare
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
