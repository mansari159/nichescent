import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ brands: [], products: [], notes: [] })
  }

  // Run all three lookups in parallel
  const [brandsRes, productsRes, notesRes] = await Promise.all([
    // Brands matching query (most useful: click takes you to /brand/slug)
    supabase
      .from('brands')
      .select('name, slug, products_count, country')
      .ilike('name', `%${q}%`)
      .order('products_count', { ascending: false })
      .limit(4),

    // Products matching query by name
    supabase
      .from('products')
      .select('name, slug, brand:brands(name, slug), lowest_price, primary_vibe_emoji')
      .eq('is_active', true)
      .ilike('name', `%${q}%`)
      .order('retailers_count', { ascending: false })
      .limit(5),

    // Notes matching query
    supabase
      .from('notes')
      .select('name, slug, category')
      .ilike('name', `%${q}%`)
      .limit(3),
  ])

  // Normalise brand join (Supabase can return object or array depending on relation type)
  const products = (productsRes.data ?? []).map(p => {
    const brand = p.brand as { name: string; slug: string } | Array<{ name: string; slug: string }> | null
    const brandName = Array.isArray(brand) ? brand[0]?.name : brand?.name
    return {
      name: p.name,
      slug: p.slug,
      brandName: brandName ?? '',
      lowestPrice: p.lowest_price as number | null,
      vibeEmoji: (p.primary_vibe_emoji as string | null) ?? null,
    }
  })

  return NextResponse.json({
    brands: (brandsRes.data ?? []) as Array<{ name: string; slug: string; products_count: number; country: string | null }>,
    products,
    notes: (notesRes.data ?? []) as Array<{ name: string; slug: string; category: string }>,
  })
}
