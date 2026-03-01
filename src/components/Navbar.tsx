'use client'
import Link from 'next/link'
import { useState } from 'react'
import SearchBar from './SearchBar'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-obsidian-900 border-b border-obsidian-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0">
          <span className="font-serif text-xl text-cream tracking-widest2">RARETRACE</span>
        </Link>
        <div className="hidden md:flex flex-1 max-w-xl">
          <SearchBar />
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/category/ouds" className="text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors">Ouds</Link>
          <Link href="/category/attars" className="text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors">Attars</Link>
          <Link href="/category/bakhoor" className="text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors">Bakhoor</Link>
          <Link href="/search" className="text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors">All</Link>
        </nav>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-obsidian-400 hover:text-cream p-1" aria-label="Toggle menu">
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-obsidian-900 border-t border-obsidian-800 px-6 py-4 space-y-4">
          <SearchBar />
          <nav className="flex flex-col gap-3 pt-2">
            {[
              { href: '/category/ouds', label: 'Ouds' },
              { href: '/category/attars', label: 'Attars' },
              { href: '/category/bakhoor', label: 'Bakhoor' },
              { href: '/category/under-50', label: 'Under $50' },
              { href: '/search', label: 'All Fragrances' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="text-xs tracking-widest2 uppercase text-obsidian-400 hover:text-cream transition-colors">{label}</Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
