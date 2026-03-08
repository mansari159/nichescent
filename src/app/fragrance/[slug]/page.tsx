import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdUnit from '@/components/AdUnit'
import EmailCapture from '@/components/EmailCapture'
import type { Product, PriceEntry } from '@/types'
import {
  getFragranceTypeLabel, genderLabels, cleanDescription,
  getPriceSymbol, getPriceSymbolTitle, noteSlug, getVibeStyle, VIBE_MAP,
} from '@/lib/utils'
import { getCountryFlag, getCountryName } from '@/lib/countries'

interface Props { params: { slug: string } }

async function getProduct(slug: string) {
  const { data: product } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug, country, description, logo_url)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) return null

  const { data: prices } = await supabase
    .from('current_prices')
    .select('*, retailer:retailers(name, slug, logo_url, domain, affiliate_url_pattern)')
    .eq('product_id', product.id)
    .order('price_usd', { ascending: true })

  const { data: similar } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)')
    .eq('brand_id', product.brand_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .not('lowest_price', 'is', null)
    .limit(4)

  return {
    ...product,
    current_prices: (prices ?? []) as PriceEntry[],
    similar: similar ?? [],
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Fragrance Not Found' }
  const brand = product.brand?.name ?? ''
  const priceSymbol = getPriceSymbol(product.lowest_price)
  const storeCount = product.retailers_count ?? 0
  return {
    title: `${product.name} by ${brand}`,
    description: `${product.name} by ${brand} — ${priceSymbol} · Available at ${storeCount} store${storeCount !== 1 ? 's' : ''}. ${product.notes_top?.slice(0, 3).join(', ') ?? ''}.`,
    openGraph: {
      images: product.image_url ? [{ url: product.image_url, width: 800, height: 800, alt: product.name }] : [],
    },
    other: {
      'schema:type': 'Product',
    },
  }
}

function NoteSection({ label, notes }: { label: string; notes: string[] }) {
  if (!notes?.length) return null
  return (
    <div className="mb-4">
      <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">{label} Notes</p>
      <div className="flex flex-wrap gap-1.5">
        {notes.map(note => (
          <Link
            key={note}
            href={`/note/${noteSlug(note)}`}
            className="text-xs text-obsidian-600 border border-obsidian-200 hover:border-gold-400 hover:text-gold-700 px-2.5 py-1 transition-colors"
          >
            {note}
          </Link>
        ))}
      </div>
    </div>
  )
}

function PriceSymbolDisplay({ symbol, title }: { symbol: string; title: string }) {
  return (
    <span className="font-serif text-4xl text-obsidian-900 tracking-wide" title={title}>
      {symbol}
    </span>
  )
}

export default async function FragrancePage({ params }: Props) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const brand = product.brand
  const countryCode = brand?.country ?? null
  const countryFlag = getCountryFlag(countryCode)
  const countryName = getCountryName(countryCode)
  const cleanDesc = cleanDescription(product.description)
  const priceSymbol = getPriceSymbol(product.lowest_price)
  const priceTitle = getPriceSymbolTitle(product.lowest_price)
  const vibeStyle = getVibeStyle(product.primary_vibe_slug)

  // Best purchase URL
  const bestPrice = product.current_prices[0]
  const purchaseUrl = bestPrice?.affiliate_url ?? bestPrice?.product_url ?? '#'

  // Schema.org structured data
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: cleanDesc ?? undefined,
    brand: { '@type': 'Brand', name: brand?.name ?? '' },
    image: product.image_url ?? undefined,
    offers: product.current_prices.map((p: PriceEntry) => ({
      '@type': 'Offer',
      url: p.affiliate_url ?? p.product_url,
      priceCurrency: 'USD',
      price: p.price_usd?.toFixed(2) ?? '0',
      availability: p.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: p.retailer?.name ?? '' },
    })),
  }

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="pt-16 bg-cream">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-5">
          <nav className="flex items-center gap-2 text-xs text-obsidian-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-obsidian-700 transition-colors">Home</Link>
            <span>/</span>
            {brand && (
              <>
                <Link href={`/brand/${brand.slug}`} className="hover:text-obsidian-700 transition-colors">
                  {brand.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-obsidian-700">{product.name}</span>
          </nav>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-16">

            {/* ── Left: Image Gallery ─────────────────────────────────────── */}
            <div>
              <div className="relative aspect-square bg-parchment overflow-hidden">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={`${product.name} by ${brand?.name ?? ''}`}
                    fill
                    priority
                    className="object-contain p-10"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-6xl text-obsidian-200">
                      {brand?.name?.charAt(0) ?? '?'}
                    </span>
                  </div>
                )}
                {/* Country flag */}
                {countryFlag && (
                  <span className="absolute top-5 left-5 text-2xl" title={countryName}>{countryFlag}</span>
                )}
                {/* Vibe badge */}
                {vibeStyle && (
                  <div
                    className="absolute top-5 right-5 flex items-center gap-2 px-3 py-1.5"
                    style={{ background: vibeStyle.css }}
                  >
                    <span className="text-[10px] tracking-widest uppercase font-sans" style={{ color: vibeStyle.textColor }}>
                      {vibeStyle.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Info ──────────────────────────────────────────────── */}
            <div className="flex flex-col">
              {/* Brand */}
              {brand && (
                <Link
                  href={`/brand/${brand.slug}`}
                  className="text-[11px] tracking-widest uppercase text-gold-500 hover:text-gold-600 transition-colors mb-2"
                >
                  {brand.name}
                  {countryName && <span className="text-obsidian-400 ml-2">· {countryName} {countryFlag}</span>}
                </Link>
              )}

              {/* Name */}
              <h1 className="font-serif text-4xl sm:text-5xl font-light text-obsidian-900 leading-tight mb-4">
                {product.name}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.fragrance_type && (
                  <span className="text-[10px] tracking-widest uppercase bg-obsidian-100 text-obsidian-600 px-3 py-1.5">
                    {getFragranceTypeLabel(product.fragrance_type)}
                  </span>
                )}
                {product.gender && (
                  <span className="text-[10px] tracking-widest uppercase bg-obsidian-100 text-obsidian-600 px-3 py-1.5">
                    {genderLabels[product.gender] ?? product.gender}
                  </span>
                )}
                {product.size_ml && (
                  <span className="text-[10px] tracking-widest uppercase bg-obsidian-100 text-obsidian-600 px-3 py-1.5">
                    {product.size_ml}ml
                  </span>
                )}
              </div>

              {/* Description */}
              {cleanDesc && (
                <p className="text-base text-obsidian-600 leading-relaxed mb-6 border-l-2 border-gold-300 pl-4">
                  {cleanDesc}
                </p>
              )}

              {/* Price + Purchase */}
              <div className="border border-obsidian-100 p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-1">Price</p>
                    <PriceSymbolDisplay symbol={priceSymbol} title={priceTitle} />
                    {product.lowest_price && (
                      <p className="text-xs text-obsidian-400 mt-0.5">
                        From ${product.lowest_price.toFixed(0)} USD
                      </p>
                    )}
                  </div>
                  {product.retailers_count > 0 && (
                    <div className="text-right">
                      <p className="font-serif text-2xl text-obsidian-900">{product.retailers_count}</p>
                      <p className="text-[10px] tracking-widest uppercase text-obsidian-400">
                        {product.retailers_count === 1 ? 'store' : 'stores'}
                      </p>
                    </div>
                  )}
                </div>

                {purchaseUrl !== '#' && (
                  <a
                    href={purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="block w-full text-center py-3.5 bg-obsidian-900 text-cream text-xs tracking-widest uppercase hover:bg-gold-600 transition-colors"
                  >
                    Purchase Now →
                  </a>
                )}
              </div>

              {/* Ad after purchase */}
              <AdUnit position="after_purchase" className="mb-4" />

              {/* All retailers */}
              {product.current_prices.length > 1 && (
                <div className="border border-obsidian-100 p-5 mb-6">
                  <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-4">Compare Prices</p>
                  <div className="space-y-3">
                    {product.current_prices.map((price: PriceEntry, i: number) => (
                      <div key={price.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {i === 0 && (
                            <span className="text-[9px] tracking-widest uppercase bg-gold-100 text-gold-700 px-1.5 py-0.5">Best</span>
                          )}
                          <span className="text-sm text-obsidian-700">{price.retailer?.name ?? 'Retailer'}</span>
                          {!price.in_stock && (
                            <span className="text-[9px] text-red-500 uppercase tracking-widest">Out of stock</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-lg text-obsidian-900" title={`$${price.price_usd?.toFixed(0)}`}>
                            {getPriceSymbol(price.price_usd)}
                          </span>
                          {price.in_stock && (
                            <a
                              href={price.affiliate_url ?? price.product_url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="text-[10px] tracking-widest uppercase text-gold-500 hover:text-gold-700 transition-colors"
                            >
                              Buy →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes pyramid */}
              <div className="border border-obsidian-100 p-5 mb-6">
                <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-4">Scent Profile</p>
                <div className="space-y-3">
                  <NoteSection label="Top" notes={product.notes_top} />
                  <NoteSection label="Heart" notes={product.notes_mid} />
                  <NoteSection label="Base" notes={product.notes_base} />
                </div>
              </div>

              {/* Vibe gradient bar */}
              {vibeStyle && (
                <div className="mb-6">
                  <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">Scent Character</p>
                  <Link href={`/vibe/${product.primary_vibe_slug}`} className="group block">
                    <div
                      className="h-3 w-full group-hover:opacity-80 transition-opacity"
                      style={{ background: vibeStyle.css }}
                    />
                    <p className="text-xs text-obsidian-500 mt-1.5 group-hover:text-gold-600 transition-colors">
                      {vibeStyle.name} — Explore this vibe →
                    </p>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Ad before similar ────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <AdUnit position="product_page" />
        </div>

        {/* ── Similar fragrances ───────────────────────────────────────────── */}
        {product.similar?.length > 0 && (
          <section className="bg-parchment py-16">
            <div className="max-w-7xl mx-auto px-6">
              <p className="label-overline text-obsidian-400 mb-2">From the same house</p>
              <h2 className="font-serif text-3xl text-obsidian-900 font-light mb-8">More by {brand?.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {product.similar.map((p: Product) => (
                  <div key={p.id} className="bg-white border border-obsidian-100 hover:border-gold-300 transition-colors overflow-hidden">
                    <Link href={`/fragrance/${p.slug}`} className="block">
                      <div className="relative aspect-square bg-parchment">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} fill className="object-contain p-6" sizes="25vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-serif text-3xl text-obsidian-200">{brand?.name?.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-serif text-sm text-obsidian-900 font-light">{p.name}</p>
                        <p className="text-[10px] tracking-widest uppercase text-gold-500 mt-1">{getPriceSymbol(p.lowest_price)}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Email capture ────────────────────────────────────────────────── */}
        <section className="py-16 border-t border-obsidian-100">
          <div className="max-w-sm mx-auto px-6 text-center">
            <p className="font-serif text-2xl text-obsidian-900 font-light mb-2">New arrivals weekly.</p>
            <p className="text-sm text-obsidian-500 mb-6">Be first to know when new fragrances from {brand?.name ?? 'this brand'} arrive.</p>
            <EmailCapture source="product_page" placeholder="your@email.com" />
          </div>
        </section>
      </div>
    </>
  )
}
