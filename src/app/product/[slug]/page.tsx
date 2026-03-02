import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PriceTable from '@/components/PriceTable'
import type { Product, PriceEntry } from '@/types'
import { getFragranceTypeLabel, genderLabels, capitalize } from '@/lib/utils'

interface Props { params: { slug: string } }

async function getProduct(slug: string): Promise<(Product & { current_prices: PriceEntry[] }) | null> {
  const { data: product } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) return null

  const { data: prices } = await supabase
    .from('current_prices')
    .select('*, retailer:retailers(name, slug, logo_url, domain)')
    .eq('product_id', product.id)
    .order('price_usd', { ascending: true })

  return { ...product, current_prices: (prices ?? []) as PriceEntry[] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Product Not Found' }
  const brand = product.brand?.name ?? ''
  const lowestPrice = product.current_prices[0]?.price_usd

  return {
    title: `${product.name} by ${brand} — Price Comparison`,
    description: `Compare prices for ${product.name} by ${brand} across ${product.current_prices.length} retailers.${lowestPrice ? ` From $${lowestPrice.toFixed(2)}.` : ''} Updated daily.`,
  }
}

/** Strip the raw "Top Notes X Middle Notes Y Base Notes Z" appended at end of scraped descriptions */
function cleanDescription(desc: string | null): string | null {
  if (!desc) return null
  // Find where the raw notes dump starts (second occurrence of "Top Notes" or "Top notes")
  const rawStart = desc.search(/\.\s+Top Notes\s/i)
  if (rawStart > 0) return desc.slice(0, rawStart + 1).trim()
  return desc.trim()
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const brand = product.brand
  const allNotes = [...product.notes_top, ...product.notes_mid, ...product.notes_base]
  const cleanDesc = cleanDescription(product.description)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        {brand && (
          <>
            <Link href={`/search?brand=${encodeURIComponent(brand.name)}`} className="hover:text-gray-600">
              {brand.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Image */}
        <div className="bg-parchment border border-obsidian-100 flex items-center justify-center aspect-square">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={500}
              height={500}
              className="object-contain w-full h-full p-8"
            />
          ) : (
            <div className="text-gray-200 text-center">
              <svg className="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p className="text-sm mt-2">No image available</p>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            {brand && (
              <Link href={`/search?brand=${encodeURIComponent(brand.name)}`}
                className="text-gold-600 font-medium hover:text-gold-700 text-sm">
                {brand.name}
              </Link>
            )}
            <h1 className="font-serif text-4xl font-light text-obsidian-900 mt-1 leading-tight">{product.name}</h1>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="bg-obsidian-900 text-cream text-[10px] tracking-widest uppercase px-3 py-1">
                {getFragranceTypeLabel(product.fragrance_type)}
              </span>
              <span className="border border-obsidian-200 text-obsidian-600 text-[10px] tracking-widest uppercase px-3 py-1">
                {genderLabels[product.gender] ?? product.gender}
              </span>
              {product.size_ml && (
                <span className="border border-obsidian-200 text-obsidian-600 text-[10px] tracking-widest uppercase px-3 py-1">
                  {product.size_ml}ml
                </span>
              )}
            </div>
          </div>

          {/* Price summary */}
          {product.current_prices.length > 0 && (
            <div className="border-l-2 border-gold-500 pl-4 py-1">
              <p className="text-xs tracking-widest uppercase text-obsidian-400 mb-1">Best current price</p>
              <p className="font-serif text-4xl font-light text-obsidian-900">
                ${product.current_prices[0]?.price_usd?.toFixed(2)}
              </p>
              <p className="text-sm text-obsidian-500 mt-1">
                at {product.current_prices[0]?.retailer?.name}
              </p>
            </div>
          )}

          {/* Price table */}
          <PriceTable
            prices={product.current_prices}
            productId={product.id}
            productSlug={product.slug}
          />

          {/* Scent Notes */}
          {allNotes.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Scent Notes</h2>
              <div className="space-y-3">
                {product.notes_top.length > 0 && (
                  <div className="flex gap-3">
                    <span className="text-xs text-gray-400 w-10 pt-0.5 shrink-0">Top</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.notes_top.map(n => (
                        <span key={n} className="bg-amber-50 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                          {capitalize(n)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.notes_mid.length > 0 && (
                  <div className="flex gap-3">
                    <span className="text-xs text-gray-400 w-10 pt-0.5 shrink-0">Mid</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.notes_mid.map(n => (
                        <span key={n} className="bg-rose-50 text-rose-800 text-xs px-2 py-0.5 rounded-full">
                          {capitalize(n)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.notes_base.length > 0 && (
                  <div className="flex gap-3">
                    <span className="text-xs text-gray-400 w-10 pt-0.5 shrink-0">Base</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.notes_base.map(n => (
                        <span key={n} className="bg-stone-100 text-stone-700 text-xs px-2 py-0.5 rounded-full">
                          {capitalize(n)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {cleanDesc && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">About this fragrance</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{cleanDesc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
