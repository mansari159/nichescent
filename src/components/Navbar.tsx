'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const navLinks = [
    { href: '/vibes', label: 'Vibes' },
    { href: '/countries', label: 'Origins' },
    { href: '/brands', label: 'Brands' },
    { href: '/search', label: 'Browse All' },
    { href: '/about', label: 'About' },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-obsidian-950/95 backdrop-blur-md border-b border-obsidian-800' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-xl tracking-widest text-cream group-hover:text-gold-400 transition-colors">
              RARETRACE
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] tracking-widest uppercase transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'text-gold-400'
                    : 'text-obsidian-300 hover:text-cream'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop: Search icon + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/search"
              className="text-obsidian-400 hover:text-cream transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>

          {/* Mobile: hamburger */}
          <button
            className="md:hidden text-obsidian-300 hover:text-cream transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 pt-16 bg-obsidian-950/98 backdrop-blur-sm md:hidden">
          <nav className="px-6 py-8 flex flex-col gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="font-serif text-2xl font-light text-cream hover:text-gold-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
