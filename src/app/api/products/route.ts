import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/products — used by scrapers & admin to fetch product list
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const limit = parseInt(params.get('limit') ?? '50', 10)
  const offset = parseInt(params.get('offset') ?? '0', 10)

  const supabase = createServerClient()

  const { data, count, error } = await supabase
    .from('products')
    .select('id, name, slug, brand:brands(name), fragrance_type, gender, lowest_price, retailers_count', { count: 'exact' })
    .eq('is_active', true)
    .order('name')
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data, total: count, limit, offset })
}
