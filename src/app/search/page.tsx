import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import AdUnit from '@/components/AdUnit'
import EmailCapture from '@/components/EmailCapture'
import type { Product } from '@/types'
import dynamic from 'next/dynamic'

const SearchBar = dynamic(() => import('@/components/SearchBar'), { ssr: false })
const FilterModal = dynamic(() => import('@/components/FilterModal'), { ssr: false })

interface Props {
  searchParams: { q?: string; brand?: string; vibe?: string; type?: string; gender?: string; priceRange?: string; sort?: string }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = searchParams.q
  return {
    title: q ? `"${q}" — Fragrance Search` : 'Search Fragrances — Browse All Niche Perfumes',
    description: q
      ? `Search results for "${q}" — Discover niche fragrances matching your search.`
      : 'Browse all niche fragrances from 50+ countries. Filter by vibe, type, price, and more.',
  }
}

async function searchProducts(params: Props['searchParams']): Promise<{ products: Product[]; total: number }> {
  const { q, brand, vibe, type, gender, priceRange, sort } = params

  let query = supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)', { count: 'exact' })
    .eq('is_active', true)
    .not('lowest_price', 'is', null)
    .range(0, 23)

  if (q) {
    try {
      query = query.textSearch('search_vector', q.trim(), { type: 'websearch', config: 'english' })
    } catch {
      query = query.ilike('name', `%${q}%`)
    }
  }
  if (brand) query = query.ilike('name', `%${brand}%`)
  if (vibe) query = query.eq('primary_vibe_slug', vibe)
  if (type) query = query.eq('fragrance_type', type)
  if (gender) query = query.eq('gender', gender)
  // Support both legacy symbol format ($, $$, $$$) and new numeric range format (0-50, 50-150, 150-99999)
  if (priceRange) {
    if (priceRange === '$') { query = query.lt('lowest_price', 50) }
    else if (priceRange === '$$') { query = query.gte('lowest_price', 50).lt('lowest_price', 150) }
    else if (priceRange === '$$$') { query = query.gte('lowest_price', 150) }
    else if (priceRange.includes('-')) {
      const [minStr, maxStr] = priceRange.split('-')
      const min = parseFloat(minStr)
      const max = parseFloat(maxStr)
      if (!isNaN(min)) query = query.gte('lowest_price', min)
      if (!isNaN(max) && max < 99999) query = query.lte('lowest_price', max)
    }
  }

  if (sort === 'price_asc') query = query.order('lowest_price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('lowest_price', { ascending: false })
  else if (sort === 'name') query = query.order('name', { ascending: true })
  else query = query.order('created_at', { ascending: false })

  const { data, count } = await query
  return { products: (data ?? []) as Product[], total: count ?? 0 }
}

const SUGGESTED_SEARCHES = [
  'Oud', 'Rose & Oud', 'Saffron', 'Bakhoor', 'Attar oil',
  'Kuwait', 'UAE', 'French niche', 'Sweet amber', 'Leather',
]

export default async function SearchPage({ searchParams }: Props) {
  const { q } = searchParams
  const { products, total } = await searchProducts(searchParams)

  const hasFilters = !!(searchParams.vibe || searchParams.type || searchParams.gender || searchParams.priceRange)

  return (
    <div className="pt-16 bg-cream min-h-screen">
      {/* ── Search Header ─────────────────────────────────────────────────── */}
      <section className="bg-obsidian-950 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] tracking-widest uppercase text-obsidian-500 mb-4">
            {q ? `Results for` : 'Browse All Fragrances'}
          </p>
          {q && (
            <h1 className="font-serif text-4xl sm:text-5xl text-cream font-light mb-6">
              &ldquo;{q}&rdquo;
            </h1>
          )}
          <div className="max-w-2xl">
            <Suspense fallback={null}>
              <SearchBar defaultValue={q ?? ''} autoFocus={!q} />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Result count + filter bar ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-obsidian-500">
            <span className="font-medium text-obsidian-900">{total.toLocaleString()}</span>{' '}
            {total === 1 ? 'fragrance' : 'fragrances'}{q ? ` for "${q}"` : ''}
          </p>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <form method="get" className="hidden sm:block">
              {q && <input type="hidden" name="q" value={q} />}
              <select
                name="sort"
                defaultValue={searchParams.sort ?? ''}
                onChange={e => (e.target.closest('form') as HTMLFormElement)?.submit()}
                className="text-xs border border-obsidian-200 bg-white text-obsidian-700 px-3 py-2 focus:outline-none focus:border-gold-400"
              >
                <option value="">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">A–Z</option>
              </select>
            </form>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              searchParams.vibe && { label: searchParams.vibe.replace(/-/g, ' '), param: 'vibe' },
              searchParams.type && { label: searchParams.type.toUpperCase(), param: 'type' },
              searchParams.gender && { label: searchParams.gender, param: 'gender' },
              searchParams.priceRange && { label: searchParams.priceRange, param: 'priceRange' },
            ].filter((x): x is { label: string; param: string } => Boolean(x)).map((chip, i) => chip && (
              <a
                key={i}
                href={(() => {
                  const p = new URLSearchParams(searchParams as Record<string, string>)
                  p.delete(chip.param)
                  return `/search?${p.toString()}`
                })()}
                className="flex items-center gap-1.5 text-xs bg-obsidian-100 text-obsidian-700 px-3 py-1.5 hover:bg-obsidian-200 transition-colors"
              >
                {chip.label}
                <span className="text-obsidian-400">×</span>
              </a>
            ))}
            <a
              href={`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`}
              className="text-xs text-gold-500 hover:text-gold-600 transition-colors px-2 py-1.5"
            >
              Clear filters
            </a>
          </div>
        )}

        {/* ── Ad ─────────────────────────────────────────────────────────── */}
        <AdUnit position="before_scroll" className="mb-8" />

        {/* ── Grid ───────────────────────────────────────────────────────── */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-24 border border-obsidian-100">
            <div className="max-w-md mx-auto">
              <p className="font-serif text-3xl text-obsidian-400 font-light mb-3">
                No results found
              </p>
              {q && (
                <p className="text-sm text-obsidian-400 mb-8">
                  We couldn&apos;t find any fragrances matching &ldquo;{q}&rdquo;. Try a different search or browse by vibe.
                </p>
              )}

              <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-4">Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {SUGGESTED_SEARCHES.map(s => (
                  <Link
                    key={s}
                    href={`/search?q=${encodeURIComponent(s)}`}
                    className="text-xs text-obsidian-600 border border-obsidian-200 hover:border-gold-400 hover:text-gold-700 px-3 py-1.5 transition-colors"
                  >
                    {s}
                  </Link>
                ))}
              </div>

              <div className="border-t border-obsidian-100 pt-8">
                <p className="text-sm text-obsidian-500 mb-4">Can&apos;t find what you&apos;re looking for? Let us know.</p>
                <EmailCapture
                  source="search_empty_state"
                  placeholder="your@email.com"
                  buttonText="Request This Fragrance"
                />
              </div>
            </div>
          </div>
        )}

        {/* End state */}
        {products.length > 0 && total > 24 && (
          <div className="mt-16 border-t border-obsidian-100 pt-16 text-center">
            <p className="font-serif text-3xl text-obsidian-900 font-light mb-3">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <p className="text-sm text-obsidian-500 mb-8">
              We&apos;re adding 50+ brands weekly. Tell us what you&apos;re searching for.
            </p>
            <EmailCapture source="search_end_state" placeholder="your@email.com" buttonText="Keep Me Updated" />
          </div>
        )}
      </div>
    </div>
  )
}
