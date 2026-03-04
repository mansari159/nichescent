'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCountryFlag } from '@/lib/countries'
import { formatPriceUSD } from '@/lib/utils'

interface SuggestionBrand   { name: string; slug: string; products_count: number; country: string | null }
interface SuggestionProduct { name: string; slug: string; brandName: string; lowestPrice: number | null; vibeEmoji: string | null }
interface SuggestionNote    { name: string; slug: string; category: string }

interface Suggestions {
  brands: SuggestionBrand[]
  products: SuggestionProduct[]
  notes: SuggestionNote[]
}

const EMPTY: Suggestions = { brands: [], products: [], notes: [] }

const POPULAR_BRANDS = [
  { label: 'Lattafa', slug: 'lattafa' },
  { label: 'Gissah', slug: 'gissah' },
  { label: 'Rasasi', slug: 'rasasi' },
  { label: 'Ajmal', slug: 'ajmal' },
  { label: 'Swiss Arabian', slug: 'swiss-arabian' },
  { label: 'Amouage', slug: 'amouage' },
]

const NOTE_CATEGORY_COLORS: Record<string, string> = {
  woody:    'bg-stone-100 text-stone-700',
  spicy:    'bg-orange-50 text-orange-700',
  floral:   'bg-rose-50 text-rose-700',
  resinous: 'bg-amber-100 text-amber-800',
  sweet:    'bg-yellow-50 text-yellow-700',
  citrus:   'bg-amber-50 text-amber-700',
  musk:     'bg-slate-100 text-slate-600',
  aquatic:  'bg-sky-50 text-sky-700',
  earthy:   'bg-neutral-100 text-neutral-700',
}

interface Props {
  compact?: boolean
  initialQuery?: string
  variant?: 'dark' | 'light'
}

export default function SearchBar({ compact = false, initialQuery = '', variant = 'dark' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Suggestions>(EMPTY)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  const hasSuggestions = suggestions.brands.length > 0 || suggestions.products.length > 0 || suggestions.notes.length > 0

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions(EMPTY)
      return
    }
    clearTimeout(debounceRef.current)
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions({
          brands:   data.brands   ?? [],
          products: data.products ?? [],
          notes:    data.notes    ?? [],
        })
      } catch {
        setSuggestions(EMPTY)
      } finally {
        setLoading(false)
      }
    }, 220)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }, [query, router])

  const goTo = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  const inputCls = variant === 'light'
    ? 'w-full bg-white border border-obsidian-200 text-obsidian-900 placeholder-obsidian-400 px-5 py-3.5 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-colors'
    : 'w-full bg-white/10 border border-white/20 text-cream placeholder-obsidian-500 px-5 py-3.5 text-sm focus:outline-none focus:border-gold-500 focus:bg-white/15 transition-colors'

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search by name, brand, or scent notes..."
          className={inputCls}
          autoComplete="off"
        />
        <button
          type="submit"
          className="bg-gold-500 hover:bg-gold-600 text-white text-xs tracking-widest2 uppercase px-6 shrink-0 transition-colors"
        >
          Search
        </button>
      </form>

      {/* ── Suggestions dropdown ───────────────────────────────────────── */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-obsidian-950 border border-obsidian-700 shadow-2xl z-50 max-h-[480px] overflow-y-auto">

          {/* ── Empty input: show popular brands ─────────────────────── */}
          {query.length < 2 && (
            <div className="p-4">
              <p className="text-[10px] tracking-widest2 uppercase text-obsidian-500 mb-3">Popular brands</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_BRANDS.map(b => (
                  <button
                    key={b.slug}
                    onMouseDown={() => goTo(`/brand/${b.slug}`)}
                    className="text-xs text-obsidian-300 border border-obsidian-700 hover:border-gold-500 hover:text-gold-400 px-3 py-1.5 transition-colors"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] tracking-widest2 uppercase text-obsidian-500 mt-5 mb-3">Browse by vibe</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '🌿 Woody', slug: 'woody-earthy' },
                  { label: '🔥 Warm & Spicy', slug: 'warm-spicy' },
                  { label: '🌹 Floral', slug: 'floral-romantic' },
                  { label: '🖤 Smoky', slug: 'smoky-intense' },
                ].map(v => (
                  <button
                    key={v.slug}
                    onMouseDown={() => goTo(`/vibe/${v.slug}`)}
                    className="text-xs text-obsidian-400 hover:text-cream transition-colors"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Loading ───────────────────────────────────────────────── */}
          {query.length >= 2 && loading && (
            <div className="px-5 py-4 text-sm text-obsidian-500">Searching…</div>
          )}

          {/* ── Grouped results ───────────────────────────────────────── */}
          {query.length >= 2 && !loading && (
            <>
              {/* Brands */}
              {suggestions.brands.length > 0 && (
                <div>
                  <p className="px-5 pt-4 pb-1 text-[10px] tracking-widest2 uppercase text-obsidian-500">Brands</p>
                  {suggestions.brands.map(b => (
                    <button
                      key={b.slug}
                      onMouseDown={() => goTo(`/brand/${b.slug}`)}
                      className="flex items-center justify-between w-full px-5 py-2.5 hover:bg-obsidian-800 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        {b.country && (
                          <span className="text-base leading-none">{getCountryFlag(b.country)}</span>
                        )}
                        <span className="text-sm text-cream group-hover:text-gold-400 transition-colors">
                          {b.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-obsidian-500 shrink-0">
                        {b.products_count} fragrances
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Products */}
              {suggestions.products.length > 0 && (
                <div>
                  <p className="px-5 pt-4 pb-1 text-[10px] tracking-widest2 uppercase text-obsidian-500">Fragrances</p>
                  {suggestions.products.map(p => (
                    <button
                      key={p.slug}
                      onMouseDown={() => goTo(`/product/${p.slug}`)}
                      className="flex items-center justify-between w-full px-5 py-2.5 hover:bg-obsidian-800 transition-colors group"
                    >
                      <div className="text-left">
                        <span className="text-sm text-cream group-hover:text-gold-400 transition-colors block leading-snug">
                          {p.vibeEmoji && <span className="mr-1">{p.vibeEmoji}</span>}
                          {p.name}
                        </span>
                        {p.brandName && (
                          <span className="text-[11px] text-obsidian-500">{p.brandName}</span>
                        )}
                      </div>
                      {p.lowestPrice != null && (
                        <span className="text-[11px] text-gold-400 shrink-0 ml-3">
                          {formatPriceUSD(p.lowestPrice)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Notes */}
              {suggestions.notes.length > 0 && (
                <div>
                  <p className="px-5 pt-4 pb-1 text-[10px] tracking-widest2 uppercase text-obsidian-500">Notes</p>
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {suggestions.notes.map(n => (
                      <button
                        key={n.slug}
                        onMouseDown={() => goTo(`/note/${n.slug}`)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-opacity hover:opacity-80 ${NOTE_CATEGORY_COLORS[n.category] ?? 'bg-obsidian-800 text-obsidian-300'}`}
                      >
                        {n.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nothing found */}
              {!hasSuggestions && (
                <div className="px-5 py-5">
                  <p className="text-sm text-obsidian-400 mb-1">
                    No exact matches for <span className="text-cream italic">&ldquo;{query}&rdquo;</span>
                  </p>
                  <button
                    onMouseDown={handleSubmit as unknown as React.MouseEventHandler}
                    className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    Search all fragrances for &ldquo;{query}&rdquo; →
                  </button>
                </div>
              )}

              {/* Full search footer */}
              {hasSuggestions && (
                <button
                  onMouseDown={handleSubmit as unknown as React.MouseEventHandler}
                  className="w-full px-5 py-3 border-t border-obsidian-800 text-xs text-obsidian-400 hover:text-gold-400 hover:bg-obsidian-900 transition-colors text-left"
                >
                  Search all results for &ldquo;{query}&rdquo; →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
