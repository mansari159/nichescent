import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import SearchBar from '@/components/SearchBar'
import type { Product } from '@/types'

// Category cards with Unsplash imagery
const CATEGORIES = [
  {
    name: 'Ouds',
    slug: 'ouds',
    subtitle: 'The essence of the East',
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Attars',
    slug: 'attars',
    subtitle: 'Pure oil concentrates',
    img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bakhoor',
    slug: 'bakhoor',
    subtitle: 'Incense traditions',
    img: 'https://images.unsplash.com/photo-1547887538-047ad8c9c3a5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Under $50',
    slug: 'under-50',
    subtitle: 'Luxury without compromise',
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Unisex',
    slug: 'unisex',
    subtitle: 'Beyond convention',
    img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'New Arrivals',
    slug: 'new-arrivals',
    subtitle: 'Recently catalogued',
    img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  },
]

const BRANDS = [
  'Arabian Oud', 'Ajmal', 'Swiss Arabian', 'Rasasi',
  'Al Haramain', 'Lattafa', 'Afnan', 'Armaf',
  'Al Rehab', 'Amouage', 'Dukhni', 'Nabeel',
]

async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug)')
    .eq('is_active', true)
    .not('lowest_price', 'is', null)
    .order('retailers_count', { ascending: false })
    .limit(8)
  return (data ?? []) as Product[]
}

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <div className="bg-cream">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-obsidian-950">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury fragrance"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 via-obsidian-950/80 to-obsidian-950/40" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <p className="label-overline text-obsidian-500 mb-6">Price Comparison for Rare Fragrances</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream leading-tight mb-6 max-w-2xl">
            Discover the<br />rarest scents<br />at the best price.
          </h1>
          <p className="text-obsidian-400 text-lg mb-10 max-w-md leading-relaxed">
            Track prices across 9 retailers for Arabian Oud, Lattafa, Amouage, and hundreds of niche MENA fragrances.
          </p>

          {/* Search */}
          <div className="max-w-lg">
            <SearchBar />
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-3 mt-8">
            {['Oud Maattar', 'Khamrah', 'Amouage Interlude', 'Rasasi Hawas'].map(q => (
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

      {/* ── Value strip ─────────────────────────────── */}
      <section className="bg-obsidian-900 border-b border-obsidian-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-center md:justify-between gap-6 text-center md:text-left">
          {[
            ['9 Retailers', 'Scraped daily'],
            ['450+ Fragrances', 'From MENA brands'],
            ['Always Free', 'No sign-up required'],
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

      {/* ── Categories ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="label-overline text-obsidian-400 mb-2">Browse by type</p>
            <h2 className="font-serif text-4xl text-obsidian-900 font-light">Collections</h2>
          </div>
          <Link href="/search" className="text-xs tracking-widest2 uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative aspect-[4/3] overflow-hidden bg-obsidian-900"
            >
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <p className="label-overline text-obsidian-500 mb-1">{cat.subtitle}</p>
                <h3 className="font-serif text-2xl text-cream font-light">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured products ───────────────────────── */}
      <section className="bg-parchment py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="label-overline text-obsidian-400 mb-2">Most compared</p>
              <h2 className="font-serif text-4xl text-obsidian-900 font-light">Featured Fragrances</h2>
            </div>
            <Link href="/search" className="text-xs tracking-widest2 uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block">
              View all
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

      {/* ── Brands ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="label-overline text-obsidian-400 mb-2">Houses we cover</p>
            <h2 className="font-serif text-4xl text-obsidian-900 font-light">The Brands</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {BRANDS.map(brand => (
            <Link
              key={brand}
              href={`/search?brand=${encodeURIComponent(brand)}`}
              className="text-sm text-obsidian-600 border border-obsidian-200 hover:border-gold-400 hover:text-obsidian-900 px-4 py-2 transition-colors"
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Editorial strip ─────────────────────────── */}
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
            Niche fragrances deserve a dedicated search engine.
          </h2>
          <p className="text-obsidian-400 leading-relaxed mb-8">
            RareTrace tracks pricing for Arabian Oud, Ajmal, Amouage, and hundreds of MENA-origin houses that mainstream fragrance sites overlook. Compare, track, and find the best price before you buy.
          </p>
          <Link href="/search" className="btn-gold">
            Start Exploring
          </Link>
        </div>
      </section>
    </div>
  )
}
