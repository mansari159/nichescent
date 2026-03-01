import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 24

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const q = params.get('q')?.trim() ?? ''
  const brands = params.getAll('brand')
  const types = params.getAll('type')
  const genders = params.getAll('gender')
  const minPrice = params.get('minPrice')
  const maxPrice = params.get('maxPrice')
  const sort = params.get('sort') ?? 'relevance'
  const page = parseInt(params.get('page') ?? '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*, brand:brands(name, slug), current_prices(price_usd, retailer:retailers(name, slug))', { count: 'exact' })
    .eq('is_active', true)

  // Full-text search
  if (q) {
    query = query.textSearch('search_vector', q, { type: 'websearch' })
  }

  // Filters
  if (brands.length) query = query.in('brand.name', brands)
  if (types.length) query = query.in('fragrance_type', types)
  if (genders.length) query = query.in('gender', genders)
  if (minPrice) query = query.gte('lowest_price', parseFloat(minPrice))
  if (maxPrice) query = query.lte('lowest_price', parseFloat(maxPrice))

  // Sort
  switch (sort) {
    case 'price_asc':
      query = query.order('lowest_price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('lowest_price', { ascending: false, nullsFirst: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'name':
      query = query.order('name', { ascending: true })
      break
    default:
      // Relevance: if no query, sort by retailer count (popularity)
      query = q
        ? query.order('retailers_count', { ascending: false })
        : query.order('retailers_count', { ascending: false })
  }

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  return NextResponse.json({
    products: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  })
}
