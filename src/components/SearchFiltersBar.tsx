'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useRef, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface FilterOption { value: string; label: string }

const GENDER_OPTIONS: FilterOption[] = [
  { value: 'men',    label: 'Men' },
  { value: 'women',  label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
]

const FORMAT_OPTIONS: FilterOption[] = [
  { value: 'edp',    label: 'EDP' },
  { value: 'edt',    label: 'EDT' },
  { value: 'parfum', label: 'Parfum' },
  { value: 'attar',  label: 'Attar' },
  { value: 'oil',    label: 'Oil' },
  { value: 'bakhoor', label: 'Bakhoor' },
]

const PRICE_PRESETS = [
  { label: 'Under $30',   min: undefined, max: '30'  },
  { label: '$30–$60',     min: '30',      max: '60'  },
  { label: '$60–$120',    min: '60',      max: '120' },
  { label: '$120+',       min: '120',     max: undefined },
]

const SORT_OPTIONS: FilterOption[] = [
  { value: 'relevance',  label: 'Most Relevant' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'name',       label: 'Name A–Z' },
]

interface Props {
  availableTypes: string[]   // actual fragrance_type values in DB
  activeGenders: string[]
  activeTypes: string[]
  activeMinPrice?: string
  activeMaxPrice?: string
  activeSort: string
  totalResults: number
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SearchFiltersBar({
  availableTypes,
  activeGenders,
  activeTypes,
  activeMinPrice,
  activeMaxPrice,
  activeSort,
  totalResults,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceOpen, setPriceOpen] = useState(false)
  const [customMin, setCustomMin] = useState(activeMinPrice ?? '')
  const [customMax, setCustomMax] = useState(activeMaxPrice ?? '')
  const priceRef = useRef<HTMLDivElement>(null)

  // Close price popover on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (priceRef.current && !priceRef.current.contains(e.target as Node)) {
        setPriceOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // ── Param helpers ───────────────────────────────────────────────────────────
  const push = useCallback((updater: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    updater(params)
    params.delete('page')
    router.push(`/search?${params.toString()}`)
  }, [router, searchParams])

  const toggleMulti = useCallback((key: string, value: string) => {
    push(p => {
      const current = p.getAll(key)
      p.delete(key)
      if (current.includes(value)) {
        current.filter(v => v !== value).forEach(v => p.append(key, v))
      } else {
        [...current, value].forEach(v => p.append(key, v))
      }
    })
  }, [push])

  const setSort = useCallback((value: string) => {
    push(p => p.set('sort', value))
  }, [push])

  const applyPricePreset = useCallback((min?: string, max?: string) => {
    push(p => {
      if (min) p.set('minPrice', min); else p.delete('minPrice')
      if (max) p.set('maxPrice', max); else p.delete('maxPrice')
    })
    setPriceOpen(false)
  }, [push])

  const applyCustomPrice = useCallback(() => {
    push(p => {
      if (customMin) p.set('minPrice', customMin); else p.delete('minPrice')
      if (customMax) p.set('maxPrice', customMax); else p.delete('maxPrice')
    })
    setPriceOpen(false)
  }, [push, customMin, customMax])

  const clearPrice = useCallback(() => {
    push(p => { p.delete('minPrice'); p.delete('maxPrice') })
    setCustomMin(''); setCustomMax('')
    setPriceOpen(false)
  }, [push])

  // ── Price label ─────────────────────────────────────────────────────────────
  const hasPriceFilter = activeMinPrice || activeMaxPrice
  const priceLabel = hasPriceFilter
    ? activeMinPrice && activeMaxPrice
      ? `$${activeMinPrice}–$${activeMaxPrice}`
      : activeMinPrice
        ? `$${activeMinPrice}+`
        : `Under $${activeMaxPrice}`
    : 'Price'

  // Which format options are actually available in the DB?
  const visibleFormats = FORMAT_OPTIONS.filter(o => availableTypes.includes(o.value))

  // ── Chip styles ─────────────────────────────────────────────────────────────
  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
      active
        ? 'bg-obsidian-900 text-cream border-obsidian-900'
        : 'bg-white text-obsidian-600 border-obsidian-200 hover:border-obsidian-400 hover:text-obsidian-900'
    }`

  return (
    <div className="bg-white border-b border-obsidian-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">

          {/* ── Sort ─────────────────────────────────────────────────────── */}
          <div className="relative shrink-0">
            <select
              value={activeSort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none bg-obsidian-900 text-cream text-xs tracking-wide px-3 py-1.5 pr-7 focus:outline-none cursor-pointer border border-obsidian-900"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
              <svg className="w-2.5 h-2.5 text-cream/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="w-px h-5 bg-obsidian-100 hidden sm:block" />

          {/* ── Gender chips ──────────────────────────────────────────────── */}
          {GENDER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleMulti('gender', opt.value)}
              className={chip(activeGenders.includes(opt.value))}
            >
              {activeGenders.includes(opt.value) && <span className="text-gold-400 text-[10px]">✓</span>}
              {opt.label}
            </button>
          ))}

          {/* ── Format chips ──────────────────────────────────────────────── */}
          {visibleFormats.length > 0 && (
            <>
              <div className="w-px h-5 bg-obsidian-100 hidden sm:block" />
              {visibleFormats.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => toggleMulti('type', opt.value)}
                  className={chip(activeTypes.includes(opt.value))}
                >
                  {activeTypes.includes(opt.value) && <span className="text-gold-400 text-[10px]">✓</span>}
                  {opt.label}
                </button>
              ))}
            </>
          )}

          <div className="w-px h-5 bg-obsidian-100 hidden sm:block" />

          {/* ── Price filter ──────────────────────────────────────────────── */}
          <div ref={priceRef} className="relative">
            <button
              onClick={() => setPriceOpen(v => !v)}
              className={chip(!!hasPriceFilter)}
            >
              {hasPriceFilter && <span className="text-gold-400 text-[10px]">✓</span>}
              {priceLabel}
              <svg className={`w-3 h-3 transition-transform ${priceOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Price popover */}
            {priceOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-obsidian-200 shadow-xl z-40 w-64 p-4">
                {/* Presets */}
                <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">Quick ranges</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {PRICE_PRESETS.map(preset => {
                    const isActive =
                      (preset.min ?? '') === (activeMinPrice ?? '') &&
                      (preset.max ?? '') === (activeMaxPrice ?? '')
                    return (
                      <button
                        key={preset.label}
                        onClick={() => applyPricePreset(preset.min, preset.max)}
                        className={`text-xs px-2.5 py-1 border transition-colors ${
                          isActive
                            ? 'bg-obsidian-900 text-cream border-obsidian-900'
                            : 'border-obsidian-200 text-obsidian-600 hover:border-obsidian-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>

                {/* Custom range */}
                <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">Custom range</p>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={customMin}
                    onChange={e => setCustomMin(e.target.value)}
                    className="w-full border border-obsidian-200 px-2.5 py-1.5 text-sm text-obsidian-900 focus:outline-none focus:border-gold-500"
                  />
                  <span className="text-obsidian-300 shrink-0">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={customMax}
                    onChange={e => setCustomMax(e.target.value)}
                    className="w-full border border-obsidian-200 px-2.5 py-1.5 text-sm text-obsidian-900 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={applyCustomPrice}
                    className="flex-1 bg-obsidian-900 text-cream text-xs py-1.5 hover:bg-obsidian-800 transition-colors"
                  >
                    Apply
                  </button>
                  {hasPriceFilter && (
                    <button
                      onClick={clearPrice}
                      className="text-xs text-obsidian-400 hover:text-obsidian-700 px-3 border border-obsidian-200 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Clear all (only when filters active) ─────────────────────── */}
          {(activeGenders.length > 0 || activeTypes.length > 0 || hasPriceFilter) && (
            <button
              onClick={() => push(p => {
                ['gender', 'type', 'minPrice', 'maxPrice'].forEach(k => p.delete(k))
              })}
              className="text-xs text-obsidian-400 hover:text-gold-600 transition-colors ml-1"
            >
              Clear filters
            </button>
          )}

          {/* ── Result count (right-aligned) ──────────────────────────────── */}
          <span className="ml-auto text-xs text-obsidian-400 shrink-0 hidden sm:block">
            {totalResults.toLocaleString()} {totalResults === 1 ? 'result' : 'results'}
          </span>

        </div>
      </div>
    </div>
  )
}
