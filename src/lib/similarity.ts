import { supabase } from './supabase'
import type { Product } from '@/types'

export interface SimilarProduct extends Product {
  score: number
}

/**
 * Get similar fragrances using the Supabase RPC function defined in patch-007.
 * Falls back to "more from same brand" if the RPC doesn't exist yet.
 */
export async function getSimilarProducts(
  productId: string,
  limit = 6
): Promise<Product[]> {
  try {
    // Try the RPC first (requires patch-007 to be applied)
    const { data, error } = await supabase.rpc('get_similar_products', {
      p_product_id: productId,
      p_limit: limit,
    })

    if (!error && data && data.length > 0) {
      // Attach brand info via a follow-up query
      const ids = data.map((d: SimilarProduct) => d.id)
      const { data: products } = await supabase
        .from('products')
        .select('*, brand:brands(name, slug)')
        .in('id', ids)
        .eq('is_active', true)

      if (products && products.length > 0) {
        // Preserve the score-based ordering from RPC
        const orderMap: Record<string, number> = {}
        data.forEach((d: SimilarProduct, i: number) => { orderMap[d.id] = i })
        return (products as Product[]).sort((a, b) => (orderMap[a.id] ?? 99) - (orderMap[b.id] ?? 99))
      }
    }
  } catch {
    // RPC not available yet, fall through to fallback
  }

  // Fallback: simple "more from this brand" query using shared tags
  const { data: source } = await supabase
    .from('products')
    .select('brand_id, fragrance_type, gender, lowest_price, category_tags')
    .eq('id', productId)
    .single()

  if (!source) return []

  const { data: fallback } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug)')
    .eq('is_active', true)
    .eq('fragrance_type', source.fragrance_type)
    .neq('id', productId)
    .not('lowest_price', 'is', null)
    .order('retailers_count', { ascending: false })
    .limit(limit)

  return (fallback ?? []) as Product[]
}
