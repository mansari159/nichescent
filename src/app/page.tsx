import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'
import AdUnit from '@/components/AdUnit'
import HomepageInfiniteScroll from '@/components/HomepageInfiniteScroll'
import FilterBar from '@/components/FilterBar'
import type { Product } from '@/types'
import { VIBE_MAP } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// ── Data fetching ────────────────────────────────────────────────────────────

async function getInitialProducts(): Promise<{ products: Product[]; total: number }> {
  const { data, count } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)', { count: 'exact' })
    .eq('is_active', true)
    .not('lowest_price', 'is', null)
    .order('created_at', { ascending: false })
    .range(0, 23)
  return { products: (data ?? []) as Product[], total: count ?? 0 }
}

async function getStats(): Promise<{ fragCount: number; brandCount: number; retailerCount: number }> {
  const [{ count: fragCount }, { count: brandCount }, { count: retailerCount }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase.from('retailers').select('*', { count: 'exact', head: true }),
  ])
  return { fragCount: fragCount ?? 0, brandCount: brandCount ?? 0, retailerCount: retailerCount ?? 0 }
}

// ── Static data ──────────────────────────────────────────────────────────────

const HERO_VIBES = ['warm-spicy', 'woody-earthy', 'floral-romantic', 'smoky-intense', 'sweet-gourmand', 'fresh-clean']

const ORIGIN_TILES = [
  {
    region: 'Middle East',
    slug: 'ae',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    description: 'Oud, saffron, amber — the soul of Arabian perfumery',
  },
  {
    region: 'South Asia',
    slug: 'in',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a47d70?w=800&q=80',
    description: '5,000 years of attar tradition from Kannauj',
  },
  {
    region: 'Europe',
    slug: 'fr',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    description: 'Grasse, Paris, and the art of fine perfumery',
  },
  {
    region: 'Southeast Asia',
    slug: 'id',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80',
    description: 'Tropical oud and exotic botanicals',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [{ products, total }, stats] = await Promise.all([
    getInitialProducts(),
    getStats(),
  ])

  const heroVibes = HERO_VIBES.map(slug => ({ slug, ...VIBE_MAP[slug] })).filter(Boolean)

  return (
    <div className="bg-cream">

      {/* ── Cinematic Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-obsidian-950">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1920&q=80"
            alt="Niche fragrance discovery"
            fill
            priority
            className="object-cover opacity-25"
            style={{ objectPosition: 'center 40%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 via-obsidian-950/80 to-obsidian-950/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="max-w-3xl">
            <p className="text-[10px] tracking-widest uppercase text-obsidian-500 mb-6">Niche Fragrance Discovery</p>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-cream leading-[1.1] mb-6">
              Find fragrances<br />mainstream sites<br />
              <span className="text-gold-400">don&apos;t track.</span>
            </h1>
            <p className="text-obsidian-400 text-lg mb-10 max-w-lg leading-relaxed">
              Artisan and regional houses from 50+ countries — tracked daily across every retailer so you always find the best price.
            </p>

            {/* Search bar */}
            <div className="max-w-xl mb-8">
              <SearchBar />
            </div>

            {/* Quick searches */}
            <div className="flex flex-wrap gap-2">
              {['Oud & Rose', 'Attar oils', 'Kuwait house', 'French niche', 'Saffron & amber'].map(q => (
                <Link
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="text-[11px] text-obsidian-500 border border-obsidian-800 hover:border-obsidian-600 hover:text-obsidian-300 px-3 py-1.5 transition-colors"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <section className="bg-obsidian-900 border-b border-obsidian-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-center md:justify-between gap-6 text-center">
          {[
            [`${stats.fragCount.toLocaleString()}+ Fragrances`, 'From niche & artisan houses'],
            [`50+ Countries`, 'Global fragrance discovery'],
            [`${stats.retailerCount} Retailers`, 'Price compared daily'],
          ].map(([title, sub]) => (
            <div key={title} className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-cream">{title}</p>
                <p className="text-[11px] text-obsidian-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Browse by Vibe ────────────────────────────────────────────────── */}
      <section className="bg-obsidian-950 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-obsidian-500 mb-2">Find your signature</p>
              <h2 className="font-serif text-4xl text-cream font-light">I want a fragrance that&apos;s…</h2>
            </div>
            <Link href="/vibes" className="text-[11px] tracking-widest uppercase text-gold-500 hover:text-gold-400 transition-colors hidden sm:block">
              All vibes →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {heroVibes.map(vibe => (
              <Link
                key={vibe.slug}
                href={`/vibe/${vibe.slug}`}
                className="group relative overflow-hidden h-32 flex items-end"
              >
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  style={{ background: vibe.css }}
                />
                {/* Animated gradient overlay */}
                <div
                  className="absolute inset-0 animate-gradient opacity-60"
                  style={{ background: `linear-gradient(135deg, ${vibe.colors[0]}, ${vibe.colors[1]}, ${vibe.colors[2]}, ${vibe.colors[0]})`, backgroundSize: '300% 300%' }}
                />
                <div className="relative p-6 w-full flex items-center justify-between">
                  {/* Gradient swatch */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full ring-2 ring-white/30 shrink-0"
                      style={{ background: `linear-gradient(135deg, ${vibe.colors[0]}, ${vibe.colors[2]})` }}
                    />
                    <h3 className="font-serif text-xl font-light" style={{ color: vibe.textColor }}>
                      {vibe.name}
                    </h3>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: vibe.textColor }}>
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Discover by Origin ────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">Fragrance heritage</p>
              <h2 className="font-serif text-4xl text-obsidian-900 font-light">Discover by Origin</h2>
            </div>
            <Link href="/countries" className="text-[11px] tracking-widest uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block">
              All origins →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ORIGIN_TILES.map(tile => (
              <Link
                key={tile.slug}
                href={`/country/${tile.slug}`}
                className="group relative aspect-[3/4] overflow-hidden block"
              >
                <Image
                  src={tile.image}
                  alt={tile.region}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="font-serif text-lg text-cream font-light">{tile.region}</p>
                  <p className="text-[10px] text-obsidian-400 mt-1 leading-relaxed">{tile.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FilterBar ─────────────────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <FilterBar navigatesToSearch />
      </Suspense>

      {/* ── Ad before catalog ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6">
        <AdUnit position="before_scroll" />
      </div>

      {/* ── All Fragrances (Infinite Scroll) ─────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">Full catalog</p>
              <h2 className="font-serif text-4xl text-obsidian-900 font-light">
                All Fragrances
              </h2>
            </div>
            <p className="text-sm text-obsidian-400 hidden sm:block">{total.toLocaleString()} tracked</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 border border-obsidian-100">
              <p className="font-serif text-2xl text-obsidian-400 font-light mb-3">Catalog loading…</p>
              <p className="text-sm text-obsidian-400">Run the scrapers to populate the catalog.</p>
              <code className="block mt-4 text-xs bg-obsidian-50 text-obsidian-600 px-4 py-2 inline-block">
                npm run scrape &amp;&amp; npm run match
              </code>
            </div>
          ) : (
            /* HomepageInfiniteScroll renders the first 24 server-side products
               and then loads more on scroll via /api/products */
            <HomepageInfiniteScroll initialProducts={products} total={total} />
          )}
        </div>
      </section>

      {/* ── Editorial strip ───────────────────────────────────────────────── */}
      <section
        className="relative py-28 overflow-hidden bg-obsidian-950"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-obsidian-950/80" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <p className="text-[10px] tracking-widest uppercase text-obsidian-500 mb-4">About RareTrace</p>
          <h2 className="font-serif text-4xl md:text-5xl text-cream font-light leading-tight mb-6">
            Niche fragrances deserve a dedicated platform.
          </h2>
          <p className="text-obsidian-400 leading-relaxed mb-8">
            From Gissah in Kuwait to Amouage in Oman — RareTrace tracks artisan and regional brands that mainstream sites ignore, and finds you the best price.
          </p>
          <Link href="/about" className="btn-gold">
            Our Mission →
          </Link>
        </div>
      </section>
    </div>
  )
}
