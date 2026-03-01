'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const BRANDS = [
  'Arabian Oud', 'Ajmal', 'Swiss Arabian', 'Rasasi', 'Al Haramain',
  'Lattafa', 'Afnan', 'Armaf', 'Al Rehab', 'Nabeel', 'Amouage', 'Dukhni',
]

const TYPES = [
  { value: 'edp', label: 'Eau de Parfum' },
  { value: 'edt', label: 'Eau de Toilette' },
  { value: 'attar', label: 'Attar / Oil' },
  { value: 'bakhoor', label: 'Bakhoor' },
  { value: 'parfum', label: 'Parfum' },
]

const GENDERS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
]

export default function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentBrands = searchParams.getAll('brand')
  const currentTypes = searchParams.getAll('type')
  const currentGenders = searchParams.getAll('gender')
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''

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

  const clearAll = () => router.push('/search')

  const hasFilters = currentBrands.length || currentTypes.length || currentGenders.length || minPrice || maxPrice

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Filters</h2>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-gold-600 hover:text-gold-700 underline">
              Clear all
            </button>
          )}
        </div>

        {/* Price range */}
        <div className="mb-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Price (USD)</h3>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={minPrice}
              onChange={e => updatePrice('minPrice', e.target.value)}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500" />
            <span className="text-gray-400 text-sm">–</span>
            <input type="number" placeholder="Max" value={maxPrice}
              onChange={e => updatePrice('maxPrice', e.target.value)}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500" />
          </div>
        </div>

        {/* Fragrance type */}
        <div className="mb-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
          <div className="space-y-1.5">
            {TYPES.map(t => (
              <label key={t.value} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={currentTypes.includes(t.value)}
                  onChange={e => updateParam('type', t.value, e.target.checked)}
                  className="rounded border-gray-300 text-gold-500 focus:ring-gold-400" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="mb-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">For</h3>
          <div className="space-y-1.5">
            {GENDERS.map(g => (
              <label key={g.value} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={currentGenders.includes(g.value)}
                  onChange={e => updateParam('gender', g.value, e.target.checked)}
                  className="rounded border-gray-300 text-gold-500 focus:ring-gold-400" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">{g.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Brand</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {BRANDS.map(b => (
              <label key={b} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={currentBrands.includes(b)}
                  onChange={e => updateParam('brand', b, e.target.checked)}
                  className="rounded border-gray-300 text-gold-500 focus:ring-gold-400" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">{b}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
