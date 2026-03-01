import { Suspense } from 'react'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/ProductCard'
import FilterSidebar from '@/components/FilterSidebar'
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
    title: q ? `"${q}" — Niche Fragrance Search` : 'Search Niche Fragrances',
    description: `Search and compare prices for ${q ?? 'niche MENA fragrances'} across 20+ retailers.`,
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

  // Brand filter
  if (brand) {
    const brands = Array.isArray(brand) ? brand : [brand]
    // Join through brands table
    query = query.in('brand.name', brands)
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
        <SearchBar initialQuery={q} />
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <Suspense>
          <FilterSidebar />
        </Suspense>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {total > 0
                ? <><span className="font-semibold">{total}</span> fragrances{q ? ` for "${q}"` : ''}</>
                : q ? `No results for "${q}"` : 'All fragrances'}
            </p>

            <select
              defaultValue={searchParams.sort ?? 'price_asc'}
              onChange={e => {
                const url = new URL(window.location.href)
                url.searchParams.set('sort', e.target.value)
                window.location.href = url.toString()
              }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold-500">
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          {/* Grid */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {page > 1 && (
                    <a href={buildPageUrl(page - 1)}
                      className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gold-400 transition-colors">
                      ← Prev
                    </a>
                  )}
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  {page < totalPages && (
                    <a href={buildPageUrl(page + 1)}
                      className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gold-400 transition-colors">
                      Next →
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">Try a different search or browse by category.</p>
              <a href="/search" className="btn-primary inline-block">Browse all fragrances</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
