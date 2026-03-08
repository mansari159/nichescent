import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdUnit from '@/components/AdUnit'
import EmailCapture from '@/components/EmailCapture'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'
import { getCountryFlag, getCountryName } from '@/lib/countries'
import { getPriceSymbol, noteSlug } from '@/lib/utils'

interface Props { params: { slug: string } }

async function getBrand(slug: string) {
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single()
  return brand
}

async function getBrandProducts(brandId: string): Promise<{ products: Product[]; total: number }> {
  const { data, count } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)', { count: 'exact' })
    .eq('brand_id', brandId)
    .eq('is_active', true)
    .not('lowest_price', 'is', null)
    .order('lowest_price', { ascending: true, nullsFirst: false })
    .range(0, 23)
  return { products: (data ?? []) as Product[], total: count ?? 0 }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await getBrand(params.slug)
  if (!brand) return { title: 'Brand Not Found' }
  return {
    title: `${brand.name} Fragrances — Niche ${brand.country ? `${brand.country} ` : ''}Perfumery`,
    description: brand.description?.slice(0, 160) ?? `Explore ${brand.name} fragrances. ${brand.products_count} fragrances tracked and price compared.`,
    other: { 'schema:type': 'Organization' },
  }
}

const HERO_IMAGES: Record<string, string> = {
  default: 'https://images.unsplash.com/photo-1583753771919-ad6c2c7e21ee?auto=format&fit=crop&w=1920&q=80',
}

const NOTE_COLORS: Record<string, string> = {
  oud: '#3D2B1F', rose: '#E8A0AA', saffron: '#FFC200', amber: '#FF8C00',
  sandalwood: '#C4A265', musk: '#B8A9A9', vanilla: '#F3D89A', leather: '#8B4513',
  frankincense: '#D4B483', jasmine: '#F5F0D3', vetiver: '#556B2F',
}

export default async function BrandPage({ params }: Props) {
  const brand = await getBrand(params.slug)
  if (!brand) notFound()

  const { products, total } = await getBrandProducts(brand.id)

  const countryCode = brand.country ?? null
  const countryFlag = getCountryFlag(countryCode)
  const countryName = getCountryName(countryCode)
  const commonNotes: string[] = brand.common_notes ?? []

  const heroImage = HERO_IMAGES[brand.slug] ?? HERO_IMAGES.default
  const priceRange = products.filter((p: Product) => p.lowest_price).map((p: Product) => p.lowest_price as number)
  const minPriceSymbol = priceRange.length ? getPriceSymbol(Math.min(...priceRange)) : null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    description: brand.description ?? undefined,
    url: brand.website_url ?? undefined,
    foundingDate: brand.founded_year?.toString() ?? undefined,
    areaServed: countryName || undefined,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="bg-cream">

        {/* ── Atmospheric Hero ─────────────────────────────────────────────── */}
        <section className="relative min-h-[70vh] flex items-end overflow-hidden bg-obsidian-950 pt-16">
          <div
            className="absolute inset-0 scale-105"
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/60 to-obsidian-950/20" />

          <div className="relative max-w-7xl mx-auto px-6 pb-16 w-full">
            {brand.logo_url && (
              <div className="mb-6">
                <Image src={brand.logo_url} alt={`${brand.name} logo`} width={80} height={80} className="object-contain" />
              </div>
            )}
            <div className="flex items-start gap-3 mb-2">
              {countryFlag && <span className="text-3xl mt-1">{countryFlag}</span>}
              <div>
                <p className="text-[10px] tracking-widest uppercase text-obsidian-500 mb-1">
                  {countryName}{brand.founded_year ? ` · Est. ${brand.founded_year}` : ''}
                </p>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-cream">{brand.name}</h1>
              </div>
            </div>
            <p className="text-obsidian-400 text-base mt-4">
              {total.toLocaleString()} {total === 1 ? 'fragrance' : 'fragrances'}
              {minPriceSymbol && ` · From ${minPriceSymbol}`}
            </p>
          </div>
        </section>

        {/* ── Brand Story ──────────────────────────────────────────────────── */}
        {brand.description && (
          <section className="py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
                <div>
                  <p className="label-overline text-obsidian-400 mb-3">The House</p>
                  <h2 className="font-serif text-4xl text-obsidian-900 font-light">
                    The Story of {brand.name}
                  </h2>
                  {brand.signature_style && (
                    <div className="mt-8 p-5 border-l-4 border-gold-400">
                      <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">Signature Style</p>
                      <p className="font-serif text-lg text-obsidian-700 font-light italic">&ldquo;{brand.signature_style}&rdquo;</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-base text-obsidian-600 leading-[1.9] whitespace-pre-line">{brand.description}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Common Notes ─────────────────────────────────────────────────── */}
        {commonNotes.length > 0 && (
          <section className="bg-parchment py-16">
            <div className="max-w-7xl mx-auto px-6">
              <p className="label-overline text-obsidian-400 mb-2">Signature Ingredients</p>
              <h2 className="font-serif text-3xl text-obsidian-900 font-light mb-8">Common Notes</h2>
              <div className="flex flex-wrap gap-3">
                {commonNotes.map((note: string) => (
                  <Link
                    key={note}
                    href={`/note/${noteSlug(note)}`}
                    className="group flex items-center gap-2 border border-obsidian-200 hover:border-gold-400 bg-white px-4 py-2.5 transition-all"
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: NOTE_COLORS[note.toLowerCase()] ?? '#8B7355' }}
                    />
                    <span className="text-sm text-obsidian-700 group-hover:text-gold-700 transition-colors">{note}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Fragrances Grid ──────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="label-overline text-obsidian-400 mb-2">{brand.name} Collection</p>
                <h2 className="font-serif text-4xl text-obsidian-900 font-light">All Fragrances</h2>
              </div>
              <p className="text-sm text-obsidian-400 hidden sm:block">{total.toLocaleString()} fragrances</p>
            </div>

            <AdUnit position="before_scroll" className="mb-8" />

            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 4} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-obsidian-100">
                <p className="font-serif text-2xl text-obsidian-400 font-light">No fragrances yet</p>
              </div>
            )}

            {/* End state */}
            <div className="mt-16 border-t border-obsidian-100 pt-16 text-center">
              <p className="font-serif text-3xl text-obsidian-900 font-light mb-3">
                More {brand.name} fragrances coming soon
              </p>
              <p className="text-sm text-obsidian-500 mb-8 max-w-sm mx-auto">
                We track {brand.name}&apos;s full catalog. New arrivals are added weekly.
              </p>
              <EmailCapture source={`brand_${brand.slug}`} placeholder="your@email.com" buttonText="Notify Me" />
            </div>
          </div>
        </section>

        <div className="border-t border-obsidian-100 py-8">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-6">
            <Link href="/brands" className="text-[11px] tracking-widest uppercase text-gold-500 hover:text-gold-600 transition-colors">
              ← All Brands
            </Link>
            {countryCode && (
              <Link
                href={`/country/${countryCode.toLowerCase()}`}
                className="text-[11px] tracking-widest uppercase text-obsidian-400 hover:text-obsidian-700 transition-colors"
              >
                More from {countryName} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
