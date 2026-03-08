'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SearchFilters } from '@/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  filters: SearchFilters
  onApply: (filters: SearchFilters) => void
  availableCountries?: string[]
  availableVibes?: { slug: string; name: string }[]
}

const FRAGRANCE_TYPES = [
  { value: 'edp', label: 'Eau de Parfum' },
  { value: 'edt', label: 'Eau de Toilette' },
  { value: 'parfum', label: 'Parfum' },
  { value: 'attar', label: 'Attar / Oil' },
  { value: 'bakhoor', label: 'Bakhoor' },
]

const PRICE_RANGES = [
  { value: '$', label: '$', desc: 'Under $50' },
  { value: '$$', label: '$$', desc: '$50–$150' },
  { value: '$$$', label: '$$$', desc: '$150+' },
]

const GENDERS = [
  { value: 'men', label: "Men's" },
  { value: 'women', label: "Women's" },
  { value: 'unisex', label: 'Unisex' },
]

const DEFAULT_VIBES = [
  { slug: 'warm-spicy', name: 'Warm & Spicy' },
  { slug: 'woody-earthy', name: 'Woody & Earthy' },
  { slug: 'floral-romantic', name: 'Floral & Romantic' },
  { slug: 'smoky-intense', name: 'Smoky & Intense' },
  { slug: 'sweet-gourmand', name: 'Sweet & Gourmand' },
  { slug: 'fresh-clean', name: 'Fresh & Clean' },
]

export default function FilterModal({ isOpen, onClose, filters, onApply, availableVibes }: Props) {
  const [local, setLocal] = useState<SearchFilters>(filters)
  const vibes = availableVibes ?? DEFAULT_VIBES

  useEffect(() => { setLocal(filters) }, [filters])

  const toggle = useCallback((key: 'vibes' | 'countries' | 'types' | 'genders', value: string) => {
    setLocal(prev => {
      const arr = (prev[key] as string[] | undefined) ?? []
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...prev, [key]: next.length ? next : undefined } as any
    })
  }, [])

  const handleApply = () => { onApply(local); onClose() }
  const handleClear = () => { setLocal({}); onApply({}) }

  const activeCount = [
    ...(local.types ?? []),
    ...(local.genders ?? []),
    ...(local.vibes ?? []),
    ...(local.countries ?? []),
    ...(local.priceRange ? [local.priceRange] : []),
  ].length

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-obsidian-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:w-[540px] max-h-[90vh] sm:max-h-[80vh] bg-cream border border-obsidian-200 shadow-2xl flex flex-col overflow-hidden sm:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-obsidian-100 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-obsidian-900 font-serif text-xl font-light">Filters</span>
            {activeCount > 0 && (
              <span className="text-[10px] tracking-widest uppercase bg-gold-500 text-white px-2 py-0.5">
                {activeCount} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-obsidian-400 hover:text-obsidian-900 transition-colors"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-8">
          {/* Vibe */}
          <section>
            <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-3">Scent Vibe</p>
            <div className="grid grid-cols-2 gap-2">
              {vibes.map(vibe => {
                const active = (local.vibes ?? []).includes(vibe.slug)
                return (
                  <button
                    key={vibe.slug}
                    onClick={() => toggle('vibes', vibe.slug)}
                    className={`text-left px-3 py-2.5 text-sm border transition-all duration-150 ${
                      active
                        ? 'bg-obsidian-900 text-cream border-obsidian-900'
                        : 'bg-white text-obsidian-700 border-obsidian-200 hover:border-obsidian-400'
                    }`}
                  >
                    {vibe.name}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Price Range */}
          <section>
            <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-3">Price Range</p>
            <div className="flex gap-2">
              {PRICE_RANGES.map(p => {
                const active = local.priceRange === p.value
                return (
                  <button
                    key={p.value}
                    onClick={() => setLocal(prev => ({ ...prev, priceRange: active ? undefined : p.value as SearchFilters['priceRange'] }))}
                    className={`flex-1 py-3 text-center border transition-all duration-150 ${
                      active
                        ? 'bg-obsidian-900 text-cream border-obsidian-900'
                        : 'bg-white text-obsidian-700 border-obsidian-200 hover:border-obsidian-400'
                    }`}
                  >
                    <span className="font-serif text-lg block">{p.label}</span>
                    <span className="text-[10px] tracking-wide">{p.desc}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Fragrance Type */}
          <section>
            <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-3">Fragrance Type</p>
            <div className="grid grid-cols-2 gap-2">
              {FRAGRANCE_TYPES.map(type => {
                const active = (local.types as string[] ?? []).includes(type.value)
                return (
                  <button
                    key={type.value}
                    onClick={() => toggle('types', type.value)}
                    className={`text-left px-3 py-2 text-sm border transition-all duration-150 ${
                      active
                        ? 'bg-obsidian-900 text-cream border-obsidian-900'
                        : 'bg-white text-obsidian-700 border-obsidian-200 hover:border-obsidian-400'
                    }`}
                  >
                    {type.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Gender */}
          <section>
            <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-3">Gender</p>
            <div className="flex gap-2">
              {GENDERS.map(g => {
                const active = (local.genders as string[] ?? []).includes(g.value)
                return (
                  <button
                    key={g.value}
                    onClick={() => toggle('genders', g.value)}
                    className={`flex-1 py-2.5 text-sm border transition-all duration-150 ${
                      active
                        ? 'bg-obsidian-900 text-cream border-obsidian-900'
                        : 'bg-white text-obsidian-700 border-obsidian-200 hover:border-obsidian-400'
                    }`}
                  >
                    {g.label}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-obsidian-100 shrink-0">
          <button
            onClick={handleClear}
            className="flex-1 py-3 border border-obsidian-300 text-obsidian-600 text-sm tracking-widest uppercase hover:bg-obsidian-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] py-3 bg-obsidian-900 text-cream text-sm tracking-widest uppercase hover:bg-obsidian-700 transition-colors"
          >
            Apply Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
