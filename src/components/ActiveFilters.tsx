'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const TYPE_LABELS: Record<string, string> = {
  edp: 'EDP', edt: 'EDT', parfum: 'Parfum', attar: 'Attar', oil: 'Oil', bakhoor: 'Bakhoor', 'body-mist': 'Body Mist',
}
const GENDER_LABELS: Record<string, string> = {
  men: 'Men', women: 'Women', unisex: 'Unisex',
}

interface Props {
  brands: string[]
  types: string[]
  genders: string[]
  notes: string[]
  minPrice?: string
  maxPrice?: string
  allBrands: Array<{ id: string; name: string; slug: string }>
  allNotes: Array<{ id: string; name: string; slug: string; category: string }>
}

export default function ActiveFilters({ brands, types, genders, notes, minPrice, maxPrice, allBrands, allNotes }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const removeParam = useCallback((key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== undefined) {
      const existing = params.getAll(key).filter(v => v !== value)
      params.delete(key)
      existing.forEach(v => params.append(key, v))
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/search?${params.toString()}`)
  }, [router, searchParams])

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    ;['brand', 'type', 'gender', 'note', 'minPrice', 'maxPrice', 'page'].forEach(k => params.delete(k))
    router.push(`/search?${params.toString()}`)
  }, [router, searchParams])

  const chips: Array<{ label: string; onRemove: () => void }> = []

  brands.forEach(slug => {
    const brand = allBrands.find(b => b.slug === slug)
    if (brand) chips.push({ label: brand.name, onRemove: () => removeParam('brand', slug) })
  })

  types.forEach(t => {
    chips.push({ label: TYPE_LABELS[t] ?? t, onRemove: () => removeParam('type', t) })
  })

  genders.forEach(g => {
    chips.push({ label: GENDER_LABELS[g] ?? g, onRemove: () => removeParam('gender', g) })
  })

  notes.forEach(slug => {
    const note = allNotes.find(n => n.slug === slug)
    chips.push({ label: note?.name ?? slug, onRemove: () => removeParam('note', slug) })
  })

  if (minPrice) chips.push({ label: `From $${minPrice}`, onRemove: () => removeParam('minPrice') })
  if (maxPrice) chips.push({ label: `Up to $${maxPrice}`, onRemove: () => removeParam('maxPrice') })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 bg-obsidian-900 text-cream text-xs px-3 py-1.5 border border-obsidian-700"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="text-obsidian-400 hover:text-gold-400 transition-colors leading-none"
            aria-label={`Remove ${chip.label} filter`}
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        className="text-xs text-obsidian-400 hover:text-gold-500 transition-colors underline"
      >
        Clear all
      </button>
    </div>
  )
}
