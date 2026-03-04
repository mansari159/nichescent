import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import {
  getCountryFlag,
  getCountryName,
  getCountryRegion,
  COUNTRY_MAP,
} from '@/lib/countries'
import { getCountryHeroImage, COUNTRY_HERITAGE } from '@/lib/country-images'
import type { Product } from '@/types'

interface Props {
  params: { code: string }
}

const REGION_SLUGS: Record<string, string> = {
  'Middle East':    'middle-east',
  'South Asia':     'south-asia',
  'Southeast Asia': 'southeast-asia',
  'East Asia':      'east-asia',
  'Europe':         'europe',
  'Americas':       'americas',
  'Oceania':        'oceania',
  'Africa':         'africa',
}

export async function generateStaticParams() {
  return Object.keys(COUNTRY_MAP).map(code => ({ code: code.toLowerCase() }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = params.code.toUpperCase()
  const name = getCountryName(code)
  if (!name) return {}
  const flag = getCountryFlag(code)
  return {
    title: `${flag} ${name} Fragrances — Niche Perfumes · RareTrace`,
    description: `Discover niche and artisan fragrances from ${name}. Browse all ${name} perfume houses, compare prices across retailers, and find the best deals.`,
    openGraph: {
      images: [getCountryHeroImage(code)],
    },
  }
}

interface Brand {
  id: string
  name: string
  slug: string
  country: string | null
  products_count: number | null
}

async function getCountryData(code: string): Promise<{ brands: Brand[]; products: Product[] } | null> {
  const { data: brands, error } = await supabase
    .from('brands')
    .select('id, name, slug, country, products_count')
    .eq('country', code)
    .order('products_count', { ascending: false, nullsFirst: false })

  if (error || !brands || brands.length === 0) return null

  const brandIds = brands.map(b => b.id)
  const { data: products } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)')
    .eq('is_active', true)
    .in('brand_id', brandIds)
    .not('lowest_price', 'is', null)
    .order('retailers_count', { ascending: false, nullsFirst: false })
    .limit(12)

  return { brands: brands as Brand[], products: (products ?? []) as Product[] }
}

export default async function CountryPage({ params }: Props) {
  const code = params.code.toUpperCase()
  const name = getCountryName(code)

  if (!name || !COUNTRY_MAP[code]) notFound()

  const data = await getCountryData(code)
  if (!data) {
    // Country is valid but has no brands yet — still show the page
    return (
      <div className="bg-cream min-h-screen">
        <HeroSection code={code} name={name} brands={[]} products={0} />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="font-serif text-3xl text-obsidian-300 font-light mb-3">No brands yet</p>
          <p className="text-sm text-obsidian-400 mb-8">
            We haven't indexed any fragrance houses from {name} yet. Check back soon.
          </p>
          <Link href="/countries" className="btn-gold">All Origins</Link>
        </div>
      </div>
    )
  }

  const { brands, products } = data
  const heritage = COUNTRY_HERITAGE[code]
  const region = getCountryRegion(code)
  const regionSlug = region ? REGION_SLUGS[region] : null
  const totalProducts = brands.reduce((acc, b) => acc + (b.products_count ?? 0), 0)

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Cinematic Hero ─────────────────────────────────────────────────── */}
      <HeroSection code={code} name={name} brands={brands} products={totalProducts} />

      {/* ── Heritage pull-quote ────────────────────────────────────────────── */}
      {heritage && (
        <section className="bg-obsidian-950 border-b border-obsidian-800">
          <div className="max-w-3xl mx-auto px-6 py-10">
            <p className="font-serif text-xl md:text-2xl text-obsidian-200 font-light leading-relaxed italic">
              &ldquo;{heritage}&rdquo;
            </p>
          </div>
        </section>
      )}

      {/* ── Brand grid ─────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="label-overline text-obsidian-400 mb-2">Perfume houses</p>
              <h2 className="font-serif text-3xl text-obsidian-900 font-light">
                {getCountryFlag(code)} Brands from {name}
              </h2>
            </div>
            {regionSlug && (
              <Link
                href={`/search?region=${regionSlug}`}
                className="text-xs tracking-widest uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block"
              >
                All {region} brands →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {brands.map(brand => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="group p-5 bg-white border border-obsidian-100 hover:border-gold-400 transition-all duration-200"
              >
                <p className="font-serif text-lg text-obsidian-900 font-light group-hover:text-obsidian-700 mb-1 leading-snug">
                  {brand.name}
                </p>
                {(brand.products_count ?? 0) > 0 && (
                  <p className="text-xs text-obsidian-400">
                    {brand.products_count} {brand.products_count === 1 ? 'fragrance' : 'fragrances'}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ──────────────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="bg-parchment py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="label-overline text-obsidian-400 mb-2">Top picks</p>
                <h2 className="font-serif text-3xl text-obsidian-900 font-light">Featured Fragrances</h2>
              </div>
              {regionSlug && (
                <Link
                  href={`/search?region=${regionSlug}`}
                  className="text-xs tracking-widest uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block"
                >
                  Browse all →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Explore more countries in region ──────────────────────────────── */}
      {region && (
        <section className="py-12 border-t border-obsidian-100">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <p className="text-sm text-obsidian-500">
              Explore more <span className="font-medium text-obsidian-900">{region}</span> fragrance houses
            </p>
            <div className="flex gap-3">
              <Link
                href="/countries"
                className="text-xs text-obsidian-500 border border-obsidian-200 hover:border-gold-400 hover:text-obsidian-800 px-4 py-2 transition-colors"
              >
                All Origins
              </Link>
              {regionSlug && (
                <Link
                  href={`/search?region=${regionSlug}`}
                  className="text-xs text-cream bg-obsidian-900 hover:bg-obsidian-700 px-4 py-2 transition-colors"
                >
                  Browse {region} →
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}

// ── Hero sub-component ────────────────────────────────────────────────────────

function HeroSection({
  code,
  name,
  brands,
  products,
}: {
  code: string
  name: string
  brands: Brand[]
  products: number
}) {
  const flag = getCountryFlag(code)
  const region = getCountryRegion(code)
  const regionSlug = region ? REGION_SLUGS[region] : null
  const heroImage = getCountryHeroImage(code, region)

  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
      <Image
        src={heroImage}
        alt={`${name} cityscape`}
        fill
        className="object-cover"
        priority
      />
      {/* Cinematic gradient — dark at bottom for text, subtle at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/35 to-obsidian-950/10" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 pb-14 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs text-obsidian-400 uppercase tracking-widest">
          <Link href="/countries" className="hover:text-cream transition-colors">Origins</Link>
          {region && regionSlug && (
            <>
              <span className="text-obsidian-700">/</span>
              <Link href={`/search?region=${regionSlug}`} className="hover:text-cream transition-colors">
                {region}
              </Link>
            </>
          )}
        </div>

        {/* Flag + name */}
        <div className="flex items-end gap-5 mb-3">
          <span className="text-7xl leading-none">{flag}</span>
          <div>
            <h1 className="font-serif text-5xl md:text-6xl text-cream font-light leading-none">
              {name}
            </h1>
            {region && (
              <p className="text-obsidian-400 text-xs uppercase tracking-widest mt-2">{region}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm text-obsidian-400 mt-4">
          {brands.length > 0 && (
            <span>
              <span className="text-cream font-medium">{brands.length}</span>{' '}
              {brands.length === 1 ? 'brand' : 'brands'}
            </span>
          )}
          {products > 0 && (
            <>
              <span className="text-obsidian-700">·</span>
              <span>
                <span className="text-cream font-medium">{products}</span> fragrances tracked
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
