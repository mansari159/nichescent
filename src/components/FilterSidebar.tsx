'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import NoteFilter from './NoteFilter'

// Maps raw DB fragrance_type values to friendly display labels
const TYPE_LABELS: Record<string, string> = {
  edp: 'Eau de Parfum',
  edt: 'Eau de Toilette',
  parfum: 'Parfum / Extrait',
  attar: 'Attar / Oil',
  oil: 'Perfume Oil',
  bakhoor: 'Bakhoor',
  'body-mist': 'Body Mist',
  cologne: 'Cologne',
  concentrate: 'Concentrate',
}
const formatType = (v: string) =>
  TYPE_LABELS[v.toLowerCase()] ?? v.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

// Maps raw DB gender values to friendly display labels
const GENDER_LABELS: Record<string, string> = {
  men: 'Men', male: 'Men', masculine: 'Men',
  women: 'Women', female: 'Women', feminine: 'Women',
  unisex: 'Unisex', 'for him': 'Men', 'for her': 'Women',
}
const formatGender = (v: string) =>
  GENDER_LABELS[v.toLowerCase()] ?? v.replace(/\b\w/g, c => c.toUpperCase())

interface Note { id: string; name: string; slug: string; category: string }
interface FilterBrand { id: string; name: string; slug: string }
interface FilterSidebarProps {
  notes?: Note[]
  brands?: FilterBrand[]
  types?: string[]
  genders?: string[]
}

export default function FilterSidebar({ notes = [], brands = [], types = [], genders = [] }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const currentBrands = searchParams.getAll('brand')
  const currentTypes = searchParams.getAll('type')
  const currentGenders = searchParams.getAll('gender')
  const currentNotes = searchParams.getAll('note')
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''

  const activeCount = currentBrands.length + currentTypes.length + currentGenders.length + currentNotes.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)

  // Lock body scroll when drawer open on mobile
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const updateParam = useCallback((key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    const existing = params.getAll(key).filter(v => v !== value)
    params.delete(key)
    existing.forEach(v => params.append(key, v))
    if (checked) params.append(key, value)
    params.delete('page')
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const updatePrice = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    params.delete('page')
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const clearAll = () => { router.push('/search'); setDrawerOpen(false) }

  const filterContent = (
    <div className="space-y-6">
      {/* Price */}
      <div>
        <h3 className="text-xs tracking-widest uppercase text-obsidian-500 mb-3">Price (USD)</h3>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={minPrice}
            onChange={e => updatePrice('minPrice', e.target.value)}
            className="w-full border border-obsidian-200 bg-white px-3 py-2 text-sm text-obsidian-900 focus:outline-none focus:ring-1 focus:ring-gold-500" />
          <span className="text-obsidian-300 text-sm shrink-0">–</span>
          <input type="number" placeholder="Max" value={maxPrice}
            onChange={e => updatePrice('maxPrice', e.target.value)}
            className="w-full border border-obsidian-200 bg-white px-3 py-2 text-sm text-obsidian-900 focus:outline-none focus:ring-1 focus:ring-gold-500" />
        </div>
      </div>

      {/* Format */}
      {types.length > 0 && (
        <div>
          <h3 className="text-xs tracking-widest uppercase text-obsidian-500 mb-3">Format</h3>
          <div className="space-y-2.5">
            {types.map(t => (
              <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={currentTypes.includes(t)}
                  onChange={e => updateParam('type', t, e.target.checked)}
                  className="w-3.5 h-3.5 rounded-none border-obsidian-300 text-gold-500 focus:ring-gold-400 focus:ring-offset-0" />
                <span className="text-sm text-obsidian-600 group-hover:text-obsidian-900 transition-colors">{formatType(t)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* For */}
      {genders.length > 0 && (
        <div>
          <h3 className="text-xs tracking-widest uppercase text-obsidian-500 mb-3">For</h3>
          <div className="space-y-2.5">
            {genders.map(g => (
              <label key={g} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={currentGenders.includes(g)}
                  onChange={e => updateParam('gender', g, e.target.checked)}
                  className="w-3.5 h-3.5 rounded-none border-obsidian-300 text-gold-500 focus:ring-gold-400 focus:ring-offset-0" />
                <span className="text-sm text-obsidian-600 group-hover:text-obsidian-900 transition-colors">{formatGender(g)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-xs tracking-widest uppercase text-obsidian-500 mb-3">Brand</h3>
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {brands.map(b => (
              <label key={b.slug} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={currentBrands.includes(b.slug)}
                  onChange={e => updateParam('brand', b.slug, e.target.checked)}
                  className="w-3.5 h-3.5 rounded-none border-obsidian-300 text-gold-500 focus:ring-gold-400 focus:ring-offset-0" />
                <span className="text-sm text-obsidian-600 group-hover:text-obsidian-900 transition-colors">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes.length > 0 && (
        <div>
          <NoteFilter notes={notes} />
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* ── Mobile: Filter trigger button ── */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 border border-obsidian-200 bg-white px-4 py-2.5 text-sm text-obsidian-700 hover:border-gold-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="bg-gold-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile: Drawer overlay ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-obsidian-950/60" onClick={() => setDrawerOpen(false)} />
          {/* Drawer */}
          <div className="relative ml-auto w-80 max-w-full bg-cream h-full overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-100">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-obsidian-900">Filters</span>
                {activeCount > 0 && (
                  <span className="bg-gold-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">{activeCount}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {activeCount > 0 && (
                  <button onClick={clearAll} className="text-xs text-gold-600 hover:text-gold-700 underline">
                    Clear all
                  </button>
                )}
                <button onClick={() => setDrawerOpen(false)} className="text-obsidian-400 hover:text-obsidian-700 p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-5 flex-1">{filterContent}</div>
            <div className="p-5 border-t border-obsidian-100">
              <button onClick={() => setDrawerOpen(false)}
                className="w-full bg-obsidian-900 text-cream text-sm tracking-widest uppercase py-3 hover:bg-obsidian-800 transition-colors">
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop: Sticky sidebar ── */}
      <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
        <div className="bg-white border border-obsidian-100 p-5 sticky top-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-xs tracking-widest uppercase text-obsidian-900 font-medium">Filters</h2>
              {activeCount > 0 && (
                <span className="bg-gold-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">{activeCount}</span>
              )}
            </div>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-gold-600 hover:text-gold-700 underline">
                Clear all
              </button>
            )}
          </div>
          {filterContent}
        </div>
      </aside>
    </>
  )
}
