'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import SearchBar from './SearchBar'

const VIBES = [
  { name: 'Woody & Earthy',    emoji: '🌿', slug: 'woody-earthy' },
  { name: 'Warm & Spicy',      emoji: '🔥', slug: 'warm-spicy' },
  { name: 'Floral & Romantic', emoji: '🌹', slug: 'floral-romantic' },
  { name: 'Smoky & Intense',   emoji: '🖤', slug: 'smoky-intense' },
  { name: 'Sweet & Gourmand',  emoji: '🍯', slug: 'sweet-gourmand' },
  { name: 'Fresh & Clean',     emoji: '💧', slug: 'fresh-clean' },
]


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [vibeOpen, setVibeOpen] = useState(false)
  const vibeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (vibeRef.current && !vibeRef.current.contains(e.target as Node)) {
        setVibeOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <header className="bg-obsidian-900 border-b border-obsidian-800 relative z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
          <span className="font-serif text-xl text-cream tracking-widest2">RARETRACE</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl">
          <SearchBar />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {/* Browse by Vibe dropdown */}
          <div ref={vibeRef} className="relative">
            <button
              onClick={() => setVibeOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors"
            >
              Vibes
              <svg className={`w-3 h-3 transition-transform ${vibeOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {vibeOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-obsidian-800 border border-obsidian-700 shadow-2xl py-2 z-50">
                <p className="text-[9px] tracking-widest3 uppercase text-obsidian-500 px-4 py-1.5">Browse by Vibe</p>
                {VIBES.map(v => (
                  <Link key={v.slug} href={`/vibe/${v.slug}`} onClick={() => setVibeOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-obsidian-300 hover:text-cream hover:bg-obsidian-700 transition-colors">
                    <span>{v.emoji}</span>
                    <span className="text-xs">{v.name}</span>
                  </Link>
                ))}
                <div className="border-t border-obsidian-700 mt-1 pt-1">
                  <Link href="/notes" onClick={() => setVibeOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-gold-500 hover:text-gold-400 transition-colors">
                    Browse by Note →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/category/ouds"    className="text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors">Ouds</Link>
          <Link href="/category/attars"  className="text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors">Attars</Link>
          <Link href="/category/bakhoor" className="text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors">Bakhoor</Link>
          <Link href="/search"           className="text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors">All</Link>
        </nav>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-obsidian-400 hover:text-cream p-1" aria-label="Toggle menu">
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-obsidian-900 border-t border-obsidian-800 px-6 py-4 space-y-4">
          <SearchBar />
          <nav className="flex flex-col gap-3 pt-2">
            {[
              { href: '/category/ouds',    label: 'Ouds' },
              { href: '/category/attars',  label: 'Attars' },
              { href: '/category/bakhoor', label: 'Bakhoor' },
              { href: '/category/under-50',label: 'Under $50' },
              { href: '/notes',            label: 'Browse by Note' },
              { href: '/search',           label: 'All Fragrances' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors">{label}</Link>
            ))}
            <div className="border-t border-obsidian-800 pt-3">
              <p className="text-[9px] tracking-widest3 uppercase text-obsidian-600 mb-2">Browse by Vibe</p>
              {VIBES.map(v => (
                <Link key={v.slug} href={`/vibe/${v.slug}`} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-xs text-obsidian-400 hover:text-cream transition-colors">
                  <span>{v.emoji}</span>{v.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
