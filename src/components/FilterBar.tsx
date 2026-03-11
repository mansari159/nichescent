'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { VIBE_MAP } from '@/lib/utils'

const VIBES = Object.entries(VIBE_MAP).map(([slug, v]) => ({ slug, name: v.name }))
const PRICE_OPTIONS = [
  { value: '', label: 'Any Price' },
  { value: '0-50', label: 'Under $50' },
  { value: '50-150', label: '$50–$150' },
  { value: '150-99999', label: '$150+' },
]
const TYPE_OPTIONS = [
  { value: '', label: 'Any Type' },
  { value: 'edp', label: 'EDP' },
  { value: 'edt', label: 'EDT' },
  { value: 'parfum', label: 'Parfum' },
  { value: 'attar', label: 'Attar' },
  { value: 'oil', label: 'Oil' },
]
const GENDER_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'men', label: "Men's" },
  { value: 'women', label: "Women's" },
]

interface Props {
  navigatesToSearch?: boolean
}

export default function FilterBar({ navigatesToSearch = false }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const target = navigatesToSearch ? '/search' : pathname
    router.push(`${target}?${params.toString()}`)
  }, [router, pathname, searchParams, navigatesToSearch])

  const current = {
    vibe: searchParams.get('vibe') ?? '',
    priceRange: searchParams.get('priceRange') ?? '',
    type: searchParams.get('type') ?? '',
    gender: searchParams.get('gender') ?? '',
  }

  const hasActive = Object.values(current).some(Boolean)

  return (
    <div className="sticky top-16 z-20 bg-cream/95 backdrop-blur-sm border-b border-obsidian-100 py-3">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">

          <FilterSelect
            label={current.vibe ? VIBE_MAP[current.vibe]?.name ?? 'Vibe' : 'Vibe'}
            active={!!current.vibe}
            onChange={v => setParam('vibe', v)}
            value={current.vibe}
            options={[{ value: '', label: 'All Vibes' }, ...VIBES.map(v => ({ value: v.slug, label: v.name }))]}
          />

          <FilterSelect
            label={current.priceRange ? PRICE_OPTIONS.find(p => p.value === current.priceRange)?.label ?? 'Price' : 'Price'}
            active={!!current.priceRange}
            onChange={v => setParam('priceRange', v)}
            value={current.priceRange}
            options={PRICE_OPTIONS}
          />

          <FilterSelect
            label={current.type ? current.type.toUpperCase() : 'Type'}
            active={!!current.type}
            onChange={v => setParam('type', v)}
            value={current.type}
            options={TYPE_OPTIONS}
          />

          <FilterSelect
            label={current.gender ? GENDER_OPTIONS.find(g => g.value === current.gender)?.label ?? 'Gender' : 'Gender'}
            active={!!current.gender}
            onChange={v => setParam('gender', v)}
            value={current.gender}
            options={GENDER_OPTIONS}
          />

          {hasActive && (
            <button
              onClick={() => router.push(navigatesToSearch ? '/search' : pathname)}
              className="shrink-0 text-[10px] tracking-widest uppercase text-gold-500 hover:text-gold-700 transition-colors ml-2 whitespace-nowrap"
            >
              Clear ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ label, active, onChange, value, options }: {
  label: string
  active: boolean
  onChange: (v: string) => void
  value: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`appearance-none text-xs pl-3 pr-7 py-1.5 border cursor-pointer focus:outline-none focus:border-gold-400 transition-colors whitespace-nowrap ${
          active
            ? 'bg-obsidian-900 text-cream border-obsidian-700'
            : 'bg-white text-obsidian-700 border-obsidian-200 hover:border-obsidian-400'
        }`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px]">▾</span>
    </div>
  )
}
