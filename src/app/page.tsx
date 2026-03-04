import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import SearchBar from '@/components/SearchBar'
import type { Product } from '@/types'

// ── Static data ──────────────────────────────────────────────────────────────

const VIBES = [
  {
    name: 'Woody & Earthy',
    emoji: '🌿',
    slug: 'woody-earthy',
    description: 'Oud, sandalwood, cedar — grounded and ancient',
    gradient: 'from-stone-900 to-stone-700',
    accent: 'border-stone-600',
  },
  {
    name: 'Warm & Spicy',
    emoji: '🔥',
    slug: 'warm-spicy',
    description: 'Saffron, cardamom, amber — enveloping and rich',
    gradient: 'from-amber-950 to-orange-800',
    accent: 'border-amber-700',
  },
  {
    name: 'Floral & Romantic',
    emoji: '🌹',
    slug: 'floral-romantic',
    description: 'Rose, jasmine, neroli — delicate and intoxicating',
    gradient: 'from-rose-950 to-pink-800',
    accent: 'border-rose-700',
  },
  {
    name: 'Smoky & Intense',
    emoji: '🖤',
    slug: 'smoky-intense',
    description: 'Leather, tobacco, incense — bold and mysterious',
    gradient: 'from-gray-950 to-gray-800',
    accent: 'border-gray-600',
  },
  {
    name: 'Sweet & Gourmand',
    emoji: '🍯',
    slug: 'sweet-gourmand',
    description: 'Vanilla, honey, tonka — warm and indulgent',
    gradient: 'from-amber-900 to-yellow-800',
    accent: 'border-amber-600',
  },
  {
    name: 'Fresh & Clean',
    emoji: '💧',
    slug: 'fresh-clean',
    description: 'Citrus, aquatic, herbs — crisp and invigorating',
    gradient: 'from-sky-950 to-blue-800',
    accent: 'border-sky-600',
  },
]

const REGIONS = [
  {
    name: 'Middle East',
    emoji: '🕌',
    description: 'Saudi Arabia, UAE, Kuwait, Oman & beyond',
    count: '200+ fragrances',
    slug: 'middle-east',
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    textColor: 'text-amber-800',
  },
  {
    name: 'South Asia',
    emoji: '🪷',
    description: 'India, Pakistan & the subcontinent',
    count: 'Attars & spices',
    slug: 'south-asia',
    color: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    textColor: 'text-rose-800',
  },
  {
    name: 'Europe',
    emoji: '🏛️',
    description: 'France, Italy, UK & European niche',
    count: 'Artisan perfumers',
    slug: 'europe',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    textColor: 'text-blue-800',
  },
  {
    name: 'Southeast Asia',
    emoji: '🌴',
    description: 'Indonesia, Malaysia & beyond',
    count: 'Oud & tropicals',
    slug: 'southeast-asia',
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    textColor: 'text-green-800',
  },
]

const FEATURED_BRANDS = [
  'Gissah', 'Assaf', 'Swiss Arabian', 'Rasasi',
  'Ajmal', 'Dukhni', 'Amouage', 'Al Haramain',
]

async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)')
    .eq('is_active', true)
    .not('lowest_price', 'is', null)
    .order('retailers_count', { ascending: false })
    .limit(8)
  return (data ?? []) as Product[]
}

async function getNewArrivals(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)')
    .eq('is_active', true)
    .not('lowest_price', 'is', null)
    .order('created_at', { ascending: false })
    .limit(4)
  return (data ?? []) as Product[]
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
  ])

  return (
    <div className="bg-cream">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-obsidian-950">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1920&q=80"
            alt="Global niche fragrance discovery"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 via-obsidian-950/85 to-obsidian-950/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <p className="label-overline text-obsidian-500 mb-6">Global Niche Fragrance Discovery</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream leading-tight mb-4 max-w-3xl">
            Discover niche<br />fragrances from<br />50+ countries.
          </h1>
          <p className="text-obsidian-400 text-lg mb-10 max-w-lg leading-relaxed">
            Artisan, indie, and regional houses that mainstream sites ignore — tracked daily across every retailer so you always get the best price.
          </p>

          <div className="max-w-lg">
            <SearchBar />
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            {['Gissah Saffron', 'Aventus dupe', 'Kuwait oud', 'French indie'].map(q => (
              <a
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="text-xs text-obsidian-500 border border-obsidian-800 hover:border-obsidian-600 hover:text-obsidian-300 px-3 py-1.5 transition-colors"
              >
                {q}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <section className="bg-obsidian-900 border-b border-obsidian-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-center md:justify-between gap-6 text-center md:text-left">
          {[
            ['2,000+ Fragrances', 'From niche & artisan houses'],
            ['50+ Countries', 'Global fragrance discovery'],
            ['9 Retailers', 'Scraped and compared daily'],
          ].map(([title, sub]) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-px h-6 bg-obsidian-700 hidden md:block" />
              <div>
                <p className="text-sm font-medium text-cream">{title}</p>
                <p className="text-xs text-obsidian-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Browse by Vibe — large visual cards ─────────────────────────── */}
      <section className="bg-obsidian-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-widest2 uppercase text-obsidian-500 mb-2">Find your signature</p>
              <h2 className="font-serif text-4xl text-cream font-light">Browse by Vibe</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VIBES.map(vibe => (
              <Link
                key={vibe.slug}
                href={`/vibe/${vibe.slug}`}
                className={`group relative overflow-hidden border ${vibe.accent} hover:border-gold-500 transition-all duration-300`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${vibe.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative p-7 flex items-start gap-4">
                  <span className="text-4xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {vibe.emoji}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-cream font-light mb-1 leading-snug">
                      {vibe.name}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {vibe.description}
                    </p>
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="relative px-7 pb-5 flex items-center justify-between">
                  <span className="text-[10px] tracking-widest uppercase text-white/40 group-hover:text-gold-400 transition-colors">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Discover by Origin ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="label-overline text-obsidian-400 mb-2">Fragrance heritage</p>
              <h2 className="font-serif text-4xl text-obsidian-900 font-light">Discover by Origin</h2>
            </div>
            <Link href="/countries" className="text-xs tracking-widest2 uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block">
              All origins →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {REGIONS.map(region => (
              <Link
                key={region.name}
                href={`/search?region=${region.slug}`}
                className={`group p-6 border-2 transition-all duration-200 ${region.color}`}
              >
                <span className="text-3xl block mb-3">{region.emoji}</span>
                <h3 className={`font-serif text-lg font-light mb-1 ${region.textColor}`}>{region.name}</h3>
                <p className="text-xs text-obsidian-500 mb-2">{region.description}</p>
                <p className="text-[10px] tracking-widest uppercase text-obsidian-400">{region.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Fragrances ──────────────────────────────────────────── */}
      <section className="bg-parchment py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="label-overline text-obsidian-400 mb-2">Most compared</p>
              <h2 className="font-serif text-4xl text-obsidian-900 font-light">Trending Now</h2>
            </div>
            <Link href="/search" className="text-xs tracking-widest2 uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block">
              View all →
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 border border-obsidian-100 bg-white">
              <p className="font-serif text-2xl text-obsidian-400 font-light mb-3">No fragrances yet</p>
              <p className="text-sm text-obsidian-400">Run the scrapers to populate the catalog.</p>
              <code className="block mt-4 text-xs bg-obsidian-50 text-obsidian-600 px-4 py-2 inline-block">npm run scrape &amp;&amp; npm run match</code>
            </div>
          )}
        </div>
      </section>

      {/* ── New Arrivals ─────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="label-overline text-obsidian-400 mb-2">Recently added</p>
                <h2 className="font-serif text-4xl text-obsidian-900 font-light">New Arrivals</h2>
              </div>
              <Link href="/search?sort=newest" className="text-xs tracking-widest2 uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Brands ──────────────────────────────────────────────── */}
      <section className="bg-obsidian-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-widest2 uppercase text-obsidian-400 mb-2">Houses we cover</p>
              <h2 className="font-serif text-4xl text-obsidian-900 font-light">Featured Brands</h2>
            </div>
            <Link href="/brands" className="text-xs tracking-widest2 uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block">
              All brands →
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {FEATURED_BRANDS.map(brand => (
              <Link
                key={brand}
                href={`/brand/${brand.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm text-obsidian-600 border border-obsidian-200 hover:border-gold-400 hover:text-obsidian-900 px-5 py-2.5 transition-colors bg-white"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by Note ───────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="label-overline text-obsidian-400 mb-2">Ingredient-first discovery</p>
              <h2 className="font-serif text-4xl text-obsidian-900 font-light">Browse by Note</h2>
            </div>
            <Link href="/notes" className="text-xs tracking-widest2 uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block">
              All notes →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Oud', slug: 'oud' },
              { name: 'Rose', slug: 'rose' },
              { name: 'Saffron', slug: 'saffron' },
              { name: 'Amber', slug: 'amber' },
              { name: 'Sandalwood', slug: 'sandalwood' },
              { name: 'Musk', slug: 'musk' },
              { name: 'Vanilla', slug: 'vanilla' },
              { name: 'Leather', slug: 'leather' },
              { name: 'Tobacco', slug: 'tobacco' },
              { name: 'Incense', slug: 'incense' },
              { name: 'Cardamom', slug: 'cardamom' },
              { name: 'Bergamot', slug: 'bergamot' },
            ].map(note => (
              <Link
                key={note.slug}
                href={`/note/${note.slug}`}
                className="text-sm text-obsidian-600 border border-obsidian-200 hover:border-gold-400 hover:text-gold-700 px-4 py-2 transition-colors"
              >
                {note.name}
              </Link>
            ))}
            <Link
              href="/notes"
              className="text-sm text-gold-500 border border-gold-200 hover:border-gold-400 px-4 py-2 transition-colors"
            >
              + 18 more
            </Link>
          </div>
        </div>
      </section>

      {/* ── Editorial strip ──────────────────────────────────────────────── */}
      <section
        className="relative py-28 overflow-hidden bg-obsidian-950"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-obsidian-950/75" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <p className="label-overline text-obsidian-500 mb-4">About RareTrace</p>
          <h2 className="font-serif text-4xl md:text-5xl text-cream font-light leading-tight mb-6">
            Niche fragrances deserve a dedicated platform.
          </h2>
          <p className="text-obsidian-400 leading-relaxed mb-8">
            From Gissah in Kuwait to Amouage in Oman, from French indie houses to Australian botanical perfumers — RareTrace tracks artisan and regional brands that mainstream sites ignore, and finds you the best price.
          </p>
          <Link href="/search" className="btn-gold">
            Start Exploring
          </Link>
        </div>
      </section>
    </div>
  )
}
