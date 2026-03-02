import { Suspense } from 'react'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/ProductCard'
import FilterSidebar from '@/components/FilterSidebar'
import SortSelect from '@/components/SortSelect'
import type { Product } from '@/types'

interface SearchPageProps {
  searchParams: {
    q?: string
    brand?: string | string[]
    type?: string | string[]
    gender?: string | string[]
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const q = searchParams.q
  return {
    title: q ? `"${q}" — Search Results` : 'All Fragrances',
    description: `Search and compare prices for ${q ?? 'niche MENA fragrances'} across multiple retailers. Find the best deal, updated daily.`,
  }
}

const PAGE_SIZE = 24

async function searchProducts(params: SearchPageProps['searchParams']): Promise<{ products: Product[]; total: number }> {
  const {
    q, brand, type, gender,
    minPrice, maxPrice,
    sort = 'price_asc',
    page = '1',
  } = params

  const pageNum = Math.max(1, parseInt(page))
  const from = (pageNum - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*, brand:brands(name, slug)', { count: 'exact' })
    .eq('is_active', true)

  // Full-text search
  if (q?.trim()) {
    query = query.textSearch('search_vector', q.trim(), { type: 'websearch' })
  }

  // Brand filter — resolve brand names → IDs first
  if (brand) {
    const brandNames = Array.isArray(brand) ? brand : [brand]
    const { data: brandRows } = await supabase
      .from('brands')
      .select('id')
      .in('name', brandNames)
    const brandIds = (brandRows ?? []).map(b => b.id)
    if (brandIds.length) {
      query = query.in('brand_id', brandIds)
    }
  }

  // Type filter
  if (type) {
    const types = Array.isArray(type) ? type : [type]
    query = query.in('fragrance_type', types)
  }

  // Gender filter
  if (gender) {
    const genders = Array.isArray(gender) ? gender : [gender]
    query = query.in('gender', genders)
  }

  // Price filters
  if (minPrice) query = query.gte('lowest_price', parseFloat(minPrice))
  if (maxPrice) query = query.lte('lowest_price', parseFloat(maxPrice))

  // Sort
  switch (sort) {
    case 'price_asc':  query = query.order('lowest_price', { ascending: true, nullsFirst: false }); break
    case 'price_desc': query = query.order('lowest_price', { ascending: false, nullsFirst: false }); break
    case 'newest':     query = query.order('created_at', { ascending: false }); break
    case 'name':       query = query.order('name', { ascending: true }); break
    default:           query = query.order('retailers_count', { ascending: false, nullsFirst: false }); break
  }

  query = query.range(from, to)

  const { data, count } = await query
  return { products: (data ?? []) as Product[], total: count ?? 0 }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { products, total } = await searchProducts(searchParams)
  const q = searchParams.q ?? ''
  const page = parseInt(searchParams.page ?? '1')
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildPageUrl(p: number) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (searchParams.sort) params.set('sort', searchParams.sort)
    params.set('page', String(p))
    ;['brand', 'type', 'gender'].forEach(key => {
      const val = searchParams[key as keyof typeof searchParams]
      if (val) {
        const arr = Array.isArray(val) ? val : [val]
        arr.forEach(v => params.append(key, v))
      }
    })
    if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice)
    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice)
    return `/search?${params.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="mb-6 max-w-2xl">
        <SearchBar initialQuery={q} variant="light" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop sticky, mobile drawer */}
        <Suspense>
          <FilterSidebar />
        </Suspense>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-obsidian-500">
              {total > 0
                ? <><span className="font-medium text-obsidian-800">{total.toLocaleString()}</span> {total === 1 ? 'fragrance' : 'fragrances'}{q ? <> for <span className="italic">&ldquo;{q}&rdquo;</span></> : ''}</>
                : q ? <>No results for <span className="italic">&ldquo;{q}&rdquo;</span></> : 'All fragrances'
              }
            </p>
            <SortSelect value={searchParams.sort ?? 'price_asc'} />
          </div>

          {/* Grid */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <a href={buildPageUrl(page - 1)}
                      className="px-4 py-2 text-sm border border-obsidian-200 text-obsidian-600 hover:border-gold-400 hover:text-obsidian-900 transition-colors">
                      ← Prev
                    </a>
                  )}
                  <span className="text-sm text-obsidian-400 px-2">Page {page} of {totalPages}</span>
                  {page < totalPages && (
                    <a href={buildPageUrl(page + 1)}
                      className="px-4 py-2 text-sm border border-obsidian-200 text-obsidian-600 hover:border-gold-400 hover:text-obsidian-900 transition-colors">
                      Next →
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 border border-obsidian-100 bg-white">
              <p className="font-serif text-2xl text-obsidian-400 font-light mb-3">No results found</p>
              <p className="text-sm text-obsidian-400 mb-6">Try a different search term or clear your filters.</p>
              <a href="/search" className="text-xs tracking-widest uppercase border border-obsidian-300 text-obsidian-600 px-6 py-3 hover:border-gold-400 hover:text-obsidian-900 transition-colors inline-block">
                Browse all fragrances
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
