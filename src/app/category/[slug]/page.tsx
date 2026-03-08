import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

interface Props { params: { slug: string } }

async function getCategoryWithProducts(slug: string) {
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) return null

  // Special handling for price-based categories
  let productsQuery = supabase
    .from('products')
    .select('*, brand:brands(name, slug), current_prices(price_usd, retailer:retailers(name, slug))')
    .eq('is_active', true)

  if (slug === 'under-30') {
    productsQuery = productsQuery.lte('lowest_price', 30).not('lowest_price', 'is', null)
  } else if (slug === 'under-50') {
    productsQuery = productsQuery.lte('lowest_price', 50).not('lowest_price', 'is', null)
  } else if (slug === 'unisex') {
    productsQuery = productsQuery.eq('gender', 'unisex')
  } else if (slug === 'attars') {
    productsQuery = productsQuery.in('fragrance_type', ['attar', 'oil'])
  } else if (slug === 'bakhoor') {
    productsQuery = productsQuery.eq('fragrance_type', 'bakhoor')
  } else if (slug === 'new-arrivals') {
    productsQuery = productsQuery.order('created_at', { ascending: false })
  } else if (slug === 'ouds') {
    // Match products with 'oud' in the name or category_tags
    productsQuery = productsQuery.or("name.ilike.%oud%,category_tags.cs.{oud}")
  } else if (slug === 'floral') {
    productsQuery = productsQuery.or("name.ilike.%floral%,notes_mid.cs.{rose},notes_mid.cs.{jasmine},category_tags.cs.{floral}")
  } else if (slug === 'woody') {
    productsQuery = productsQuery.or("category_tags.cs.{woody},notes_base.cs.{sandalwood},notes_base.cs.{cedar}")
  } else {
    // Fallback: try product_categories join, then fall back to name search
    const { data: productIds } = await supabase
      .from('product_categories')
      .select('product_id')
      .eq('category_id', category.id)

    if (productIds?.length) {
      productsQuery = productsQuery.in('id', productIds.map(r => r.product_id))
    } else {
      // No join table entries — search by category slug as a name keyword
      productsQuery = productsQuery.ilike('name', `%${category.name.split(' ')[0]}%`)
    }
  }

  productsQuery = productsQuery
    .order('retailers_count', { ascending: false })
    .limit(48)

  const { data: products } = await productsQuery

  return { category, products: (products ?? []) as Product[] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getCategoryWithProducts(params.slug)
  if (!result) return { title: 'Category Not Found' }
  const { category, products } = result
  return {
    title: `${category.name} — Fragrance Price Comparison`,
    description: `${category.description ?? `Browse ${category.name} fragrances.`} Compare prices across retailers. ${products.length} fragrances available.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const result = await getCategoryWithProducts(params.slug)
  if (!result) notFound()

  const { category, products } = result

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-obsidian-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-obsidian-600">Home</Link>
        <span>/</span>
        <span className="text-obsidian-700">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase text-obsidian-400 mb-2">Collection</p>
        <h1 className="font-serif text-4xl text-obsidian-900 font-light mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-obsidian-500 text-sm">{category.description}</p>
        )}
        {products.length > 0 && (
          <p className="text-xs text-obsidian-400 mt-2">{products.length} fragrances</p>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-obsidian-400">
          <p className="text-lg">No fragrances in this category yet.</p>
          <p className="text-sm mt-2">
            <Link href="/search" className="text-gold-600 hover:text-gold-700">
              Browse all fragrances →
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
