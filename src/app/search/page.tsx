import { Suspense } from 'react'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/ProductCard'
import SearchFiltersBar from '@/components/SearchFiltersBar'
import ActiveFilters from '@/components/ActiveFilters'
import type { Product } from '@/types'

interface SearchPageProps {
  searchParams: {
    q?: string
    brand?: string | string[]
    type?: string | string[]
    gender?: string | string[]
    note?: string | string[]
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const q = searchParams.q
  return {
    title: q ? `"${q}" — Search Results · RareTrace` : 'All Fragrances · RareTrace',
    description: `Search and compare prices for ${q ?? 'niche fragrances'} across multiple retailers. Find the best deal, updated daily.`,
  }
}

const PAGE_SIZE = 24

// ── Brand lookup ──────────────────────────────────────────────────────────────
async function getAllBrands() {
  const { data } = await supabase
    .from('brands')
    .select('id, name, slug')
    .order('name', { ascending: true })
  return data ?? []
}

// ── Smart search with brand-prefix detection + ilike fallback ─────────────────
async function searchProducts(
  params: SearchPageProps['searchParams'],
  allBrands: Array<{ id: string; name: string; slug: string }>
): Promise<{ products: Product[]; total: number; detectedBrand: string | null }> {
  const {
    q, brand, type, gender, note,
    minPrice, maxPrice,
    sort = 'relevance',
    page = '1',
  } = params

  const pageNum = Math.max(1, parseInt(page))
  const from = (pageNum - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Brand filter from sidebar/URL
  let brandIdsFromFilter: string[] | null = null
  if (brand) {
    const brandSlugs = Array.isArray(brand) ? brand : [brand]
    const matched = allBrands.filter(b => brandSlugs.includes(b.slug))
    brandIdsFromFilter = matched.map(b => b.id)
    if (brandIdsFromFilter.length === 0) return { products: [], total: 0, detectedBrand: null }
  }

  // Smart query parsing
  let detectedBrandId: string | null = null
  let detectedBrandName: string | null = null
  let productNameQuery: string | null = null
  let freeTextQuery: string | null = null

  if (q?.trim()) {
    const searchTerm = q.trim()
    // Longest brand name first so "Swiss Arabian" wins over "Swiss"
    const sortedBrands = [...allBrands].sort((a, b) => b.name.length - a.name.length)
    const brandPrefix = sortedBrands.find(b =>
      searchTerm.toLowerCase().startsWith(b.name.toLowerCase())
    )
    if (brandPrefix) {
      detectedBrandId   = brandPrefix.id
      detectedBrandName = brandPrefix.name
      const remainder   = searchTerm.slice(brandPrefix.name.length).trim()
      productNameQuery  = remainder || null
    } else {
      freeTextQuery = searchTerm
    }
  }

  const runQuery = async (mode: 'fts' | 'ilike') => {
    let q = supabase
      .from('products')
      .select('*, brand:brands(name, slug, country)', { count: 'exact' })
      .eq('is_active', true)

    // Brand filter
    if (brandIdsFromFilter) {
      q = q.in('brand_id', brandIdsFromFilter)
    } else if (detectedBrandId) {
      q = q.eq('brand_id', detectedBrandId)
    }

    // Product-name part of brand+product query
    if (productNameQuery) {
      q = q.ilike('name', `%${productNameQuery}%`)
    }

    // Free-text search
    if (freeTextQuery) {
      if (mode === 'fts') {
        q = q.textSearch('search_vector', freeTextQuery, { type: 'websearch' })
      } else {
        q = q.ilike('name', `%${freeTextQuery}%`)
      }
    }

    // Type filter
    if (type) {
      const types = Array.isArray(type) ? type : [type]
      q = q.in('fragrance_type', types)
    }

    // Gender filter
    if (gender) {
      const genders = Array.isArray(gender) ? gender : [gender]
      q = q.in('gender', genders)
    }

    // Note filter
    if (note) {
      const noteSlugs = Array.isArray(note) ? note : [note]
      try {
        const { data: noteRows } = await supabase
          .from('notes').select('id').in('slug', noteSlugs)
        const noteIds = (noteRows ?? []).map(n => n.id)
        if (noteIds.length > 0) {
          const { data: pnRows } = await supabase
            .from('product_notes').select('product_id').in('note_id', noteIds)
          const productIds = Array.from(new Set((pnRows ?? []).map(r => r.product_id)))
          if (productIds.length > 0) q = q.in('id', productIds)
          else return { data: [], count: 0, error: null }
        }
      } catch { /* notes table may not be populated */ }
    }

    // Price
    if (minPrice) q = q.gte('lowest_price', parseFloat(minPrice))
    if (maxPrice) q = q.lte('lowest_price', parseFloat(maxPrice))

    // Sort
    switch (sort) {
      case 'price_asc':  q = q.order('lowest_price', { ascending: true,  nullsFirst: false }); break
      case 'price_desc': q = q.order('lowest_price', { ascending: false, nullsFirst: false }); break
      case 'newest':     q = q.order('created_at',   { ascending: false }); break
      case 'name':       q = q.order('name',          { ascending: true  }); break
      default:           q = q.order('retailers_count', { ascending: false, nullsFirst: false }); break
    }

    return q.range(from, to)
  }

  const primary = await runQuery('fts')

  if ((primary.count ?? 0) === 0 && freeTextQuery) {
    const fallback = await runQuery('ilike')
    return {
      products: (fallback.data ?? []) as Product[],
      total: fallback.count ?? 0,
      detectedBrand: detectedBrandName,
    }
  }

  return {
    products: (primary.data ?? []) as Product[],
    total: primary.count ?? 0,
    detectedBrand: detectedBrandName,
  }
}

// ── Filter options ────────────────────────────────────────────────────────────
async function getFilterOptions() {
  const { data } = await supabase
    .from('products')
    .select('fragrance_type')
    .eq('is_active', true)
    .not('fragrance_type', 'is', null)
  const types = Array.from(
    new Set((data ?? []).map(p => p.fragrance_type).filter(Boolean))
  ).sort() as string[]
  return { types }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const allBrands = await getAllBrands()

  const [{ products, total, detectedBrand }, { types: availableTypes }] = await Promise.all([
    searchProducts(searchParams, allBrands),
    getFilterOptions(),
  ])

  const q         = searchParams.q ?? ''
  const sort      = searchParams.sort ?? 'relevance'
  const page      = parseInt(searchParams.page ?? '1')
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const activeGenders = Array.isArray(searchParams.gender) ? searchParams.gender : searchParams.gender ? [searchParams.gender] : []
  const activeTypes   = Array.isArray(searchParams.type)   ? searchParams.type   : searchParams.type   ? [searchParams.type]   : []
  const activeBrands  = Array.isArray(searchParams.brand)  ? searchParams.brand  : searchParams.brand  ? [searchParams.brand]  : []
  const activeNotes   = Array.isArray(searchParams.note)   ? searchParams.note   : searchParams.note   ? [searchParams.note]   : []

  const activeFilterCount = activeBrands.length + activeTypes.length + activeGenders.length + activeNotes.length +
    (searchParams.minPrice ? 1 : 0) + (searchParams.maxPrice ? 1 : 0)

  function buildPageUrl(p: number) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sort !== 'relevance') params.set('sort', sort)
    params.set('page', String(p))
    ;(['brand', 'type', 'gender', 'note'] as const).forEach(key => {
      const val = searchParams[key]
      if (val) (Array.isArray(val) ? val : [val]).forEach(v => params.append(key, v))
    })
    if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice)
    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice)
    return `/search?${params.toString()}`
  }

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Sticky search bar ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-obsidian-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <SearchBar initialQuery={q} variant="light" />
        </div>
      </div>

      {/* ── Horizontal filter bar ────────────────────────────────────────── */}
      <Suspense>
        <SearchFiltersBar
          availableTypes={availableTypes}
          activeGenders={activeGenders}
          activeTypes={activeTypes}
          activeMinPrice={searchParams.minPrice}
          activeMaxPrice={searchParams.maxPrice}
          activeSort={sort}
          totalResults={total}
        />
      </Suspense>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Context header */}
        {(q || detectedBrand) && (
          <div className="mb-4 flex items-center flex-wrap gap-2">
            {q && (
              <p className="text-sm text-obsidian-500">
                {total > 0
                  ? <><span className="font-semibold text-obsidian-900">{total.toLocaleString()}</span> {total === 1 ? 'fragrance' : 'fragrances'} for <span className="italic">&ldquo;{q}&rdquo;</span></>
                  : <>No results for <span className="italic">&ldquo;{q}&rdquo;</span></>
                }
              </p>
            )}
            {detectedBrand && !activeBrands.length && (
              <span className="text-xs text-gold-700 bg-gold-50 border border-gold-200 px-2 py-0.5">
                Showing brand: {detectedBrand}
              </span>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <Suspense>
            <ActiveFilters
              brands={activeBrands}
              types={activeTypes}
              genders={activeGenders}
              notes={activeNotes}
              minPrice={searchParams.minPrice}
              maxPrice={searchParams.maxPrice}
              allBrands={allBrands}
              allNotes={[]}
            />
          </Suspense>
        )}

        {/* Product grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <a key={p} href={buildPageUrl(p)}
                    className={`w-9 h-9 flex items-center justify-center text-sm border transition-colors ${
                      p === page
                        ? 'bg-obsidian-900 text-cream border-obsidian-900'
                        : 'border-obsidian-200 text-obsidian-600 hover:border-gold-400'
                    }`}>
                    {p}
                  </a>
                ))}
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
          <div className="text-center py-24 border border-obsidian-100 bg-white">
            <p className="font-serif text-3xl text-obsidian-300 font-light mb-3">No results found</p>
            {q ? (
              <>
                <p className="text-sm text-obsidian-400 mb-6">
                  No fragrances matched <span className="italic">&ldquo;{q}&rdquo;</span>. Try a different spelling or browse by vibe.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {[['Woody & Earthy','woody-earthy'],['Warm & Spicy','warm-spicy'],['Floral & Romantic','floral-romantic'],['Fresh & Clean','fresh-clean']].map(([label, slug]) => (
                    <a key={slug} href={`/vibe/${slug}`}
                      className="text-xs border border-obsidian-200 text-obsidian-500 hover:border-gold-400 hover:text-obsidian-800 px-3 py-1.5 transition-colors">
                      {label}
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-obsidian-400 mb-6">
                {activeFilterCount > 0 ? 'Try removing some filters.' : 'Browse all fragrances below.'}
              </p>
            )}
            <a href="/search"
              className="text-xs tracking-widest uppercase border border-obsidian-300 text-obsidian-600 px-6 py-3 hover:border-gold-400 hover:text-obsidian-900 transition-colors inline-block">
              Browse all fragrances
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
