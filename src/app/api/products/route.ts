import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  // Pagination
  const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10))
  const limit  = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') ?? '24', 10)))

  // Single-value filters
  const brand      = searchParams.get('brand')       // brand slug or id
  const country    = searchParams.get('country')     // country code e.g. "ae"
  const vibe       = searchParams.get('vibe')        // e.g. "warm-spicy"
  const priceRange = searchParams.get('priceRange')  // "$" | "$$" | "$$$"
  const q          = searchParams.get('q')           // full-text search
  const sortBy     = searchParams.get('sortBy') ?? 'newest'

  // Multi-value filters (comma-separated)
  const types   = searchParams.get('types')?.split(',').filter(Boolean)
  const genders = searchParams.get('genders')?.split(',').filter(Boolean)
  const vibes   = searchParams.get('vibes')?.split(',').filter(Boolean)

  const supabase = createServerClient()

  let query = supabase
    .from('products')
    .select('*, brand:brands(id, name, slug, country, logo_url)', { count: 'exact' })
    .eq('is_active', true)
    .not('lowest_price', 'is', null)
    .range(offset, offset + limit - 1)

  // Sorting
  switch (sortBy) {
    case 'price_asc':  query = query.order('lowest_price', { ascending: true });  break
    case 'price_desc': query = query.order('lowest_price', { ascending: false }); break
    case 'name':       query = query.order('name', { ascending: true });           break
    default:           query = query.order('created_at', { ascending: false });   break
  }

  // Brand filter — accept slug (string) or uuid
  if (brand) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brand)
    if (isUuid) {
      query = query.eq('brand_id', brand)
    } else {
      // Look up brand id by slug first
      const { data: brandRow } = await supabase
        .from('brands')
        .select('id')
        .eq('slug', brand)
        .single()
      if (brandRow) {
        query = query.eq('brand_id', brandRow.id)
      } else {
        // No such brand — return empty
        return NextResponse.json({ products: [], total: 0 })
      }
    }
  }

  // Country filter — filter products whose brand belongs to this country
  if (country) {
    const { data: brandIds } = await supabase
      .from('brands')
      .select('id')
      .ilike('country', country)
    if (brandIds && brandIds.length > 0) {
      query = query.in('brand_id', brandIds.map((b: { id: string }) => b.id))
    } else {
      return NextResponse.json({ products: [], total: 0 })
    }
  }

  // Fragrance type (single or multi)
  if (types && types.length > 0) {
    query = query.in('fragrance_type', types)
  }

  // Gender (single or multi)
  if (genders && genders.length > 0) {
    query = query.in('gender', genders)
  }

  // Vibe (single or multi)
  if (vibes && vibes.length > 0) {
    query = query.in('primary_vibe_slug', vibes)
  } else if (vibe) {
    query = query.eq('primary_vibe_slug', vibe)
  }

  // Price range
  if (priceRange) {
    if (priceRange === '$')   query = query.lt('lowest_price', 50)
    if (priceRange === '$$')  query = query.gte('lowest_price', 50).lt('lowest_price', 150)
    if (priceRange === '$$$') query = query.gte('lowest_price', 150)
  }

  // Full-text search
  if (q) {
    try {
      query = query.textSearch('search_vector', q, { type: 'websearch', config: 'english' })
    } catch {
      // Fallback to ilike if full-text search not set up
      query = query.ilike('name', `%${q}%`)
    }
  }

  const { data: products, count, error } = await query

  if (error) {
    console.error('/api/products error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: products ?? [], total: count ?? 0 })
}
