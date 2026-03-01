'use client'
import Link from 'next/link'
import { useState } from 'react'
import SearchBar from './SearchBar'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="bg-navy-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold tracking-tight">
              Niche<span className="text-gold-500">Scent</span>
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <SearchBar compact />
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <Link href="/category/ouds" className="hover:text-gold-400 transition-colors">Ouds</Link>
            <Link href="/category/attars" className="hover:text-gold-400 transition-colors">Attars</Link>
            <Link href="/category/under-50" className="hover:text-gold-400 transition-colors">Under $50</Link>
            <Link href="/search" className="hover:text-gold-400 transition-colors">All Brands</Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded text-gray-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-navy-700 space-y-3">
            <SearchBar compact />
            <div className="flex flex-col gap-2 text-sm pt-2">
              <Link href="/category/ouds" className="text-gray-300 hover:text-white py-1">Ouds</Link>
              <Link href="/category/attars" className="text-gray-300 hover:text-white py-1">Attars</Link>
              <Link href="/category/under-50" className="text-gray-300 hover:text-white py-1">Under $50</Link>
              <Link href="/search" className="text-gray-300 hover:text-white py-1">All Brands</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
