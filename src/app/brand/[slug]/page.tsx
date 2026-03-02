import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

interface Props { params: { slug: string } }

async function getBrandWithProducts(slug: string) {
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!brand) return null

  const { data: products } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug), current_prices(price_usd, retailer:retailers(name, slug))')
    .eq('brand_id', brand.id)
    .eq('is_active', true)
    .order('lowest_price', { ascending: true, nullsFirst: false })

  return { brand, products: (products ?? []) as Product[] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getBrandWithProducts(params.slug)
  if (!result) return { title: 'Brand Not Found' }
  const { brand, products } = result
  return {
    title: `${brand.name} Fragrances — Price Comparison`,
    description: `Browse ${products.length} fragrances from ${brand.name}. Compare prices across retailers and find the best deals. ${brand.country ? `Based in ${brand.country}.` : ''}`,
  }
}

const regionLabels: Record<string, string> = {
  MENA: 'Middle East & North Africa',
  European: 'European',
  American: 'American',
  Asian: 'Asian',
}

export default async function BrandPage({ params }: Props) {
  const result = await getBrandWithProducts(params.slug)
  if (!result) notFound()

  const { brand, products } = result

  const types = Array.from(new Set(products.map(p => p.fragrance_type)))
  const priceRange = products
    .filter(p => p.lowest_price)
    .map(p => p.lowest_price as number)

  const minPrice = priceRange.length ? Math.min(...priceRange) : null
  const maxPrice = priceRange.length ? Math.max(...priceRange) : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        <Link href="/brands" className="hover:text-gray-600">All Brands</Link>
        <span>/</span>
        <span className="text-gray-700">{brand.name}</span>
      </nav>

      {/* Brand Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {brand.logo_url ? (
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-obsidian-100 rounded-xl flex items-center justify-center text-obsidian-700 font-bold text-xl">
              {brand.name.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
              {brand.region && (
                <span className="bg-obsidian-100 text-obsidian-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {regionLabels[brand.region] ?? brand.region}
                </span>
              )}
              {brand.country && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                  {brand.country}
                </span>
              )}
            </div>

            {brand.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{brand.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span><strong className="text-gray-900">{products.length}</strong> fragrances</span>
              {minPrice !== null && maxPrice !== null && (
                <span>
                  <strong className="text-gray-900">${minPrice.toFixed(0)}–${maxPrice.toFixed(0)}</strong> price range
                </span>
              )}
              {types.length > 0 && (
                <span>{types.slice(0, 3).join(', ')}{types.length > 3 ? ` +${types.length - 3} more` : ''}</span>
              )}
            </div>
          </div>

          {brand.website_url && (
            <a
              href={brand.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gold-600 hover:text-gold-700 underline shrink-0"
            >
              Official site ↗
            </a>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {products.length} Fragrances
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No products listed yet for {brand.name}.</p>
          <p className="text-sm mt-2">Run the scraper to populate prices.</p>
        </div>
      )}
    </div>
  )
}
