import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)
  const limit = parseInt(searchParams.get('limit') ?? '24', 10)
  const brand = searchParams.get('brand')
  const country = searchParams.get('country')
  const vibe = searchParams.get('vibe')
  const type = searchParams.get('type')
  const gender = searchParams.get('gender')
  const priceRange = searchParams.get('priceRange')
  const q = searchParams.get('q')

  const supabase = createServerClient()

  let query = supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)', { count: 'exact' })
    .eq('is_active', true)
    .not('lowest_price', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (brand) query = query.eq('brand_id', brand)
  if (type) query = query.eq('fragrance_type', type)
  if (gender) query = query.eq('gender', gender)
  if (vibe) query = query.eq('primary_vibe_slug', vibe)
  if (country) {
    // filter by brand country — join required via RPC or subquery
    // For now use ilike on brand country
  }
  if (priceRange) {
    if (priceRange === '$') query = query.lt('lowest_price', 50)
    else if (priceRange === '$$') query = query.gte('lowest_price', 50).lt('lowest_price', 150)
    else if (priceRange === '$$$') query = query.gte('lowest_price', 150)
  }
  if (q) {
    query = query.textSearch('search_vector', q, { type: 'websearch', config: 'english' })
  }

  const { data: products, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ products: products ?? [], total: count ?? 0 })
}
