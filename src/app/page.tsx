import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

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

const CATEGORIES = [
  { name: 'Ouds & Oud Blends', slug: 'ouds', emoji: '🌿', desc: 'Deep, rich, and complex' },
  { name: 'Attars & Oils', slug: 'attars', emoji: '💧', desc: 'Traditional, alcohol-free' },
  { name: 'Bakhoor', slug: 'bakhoor', emoji: '🔥', desc: 'Scented incense chips' },
  { name: 'Under $30', slug: 'under-30', emoji: '💰', desc: 'Great value niche scents' },
  { name: 'Under $50', slug: 'under-50', emoji: '⭐', desc: 'Premium quality, fair price' },
  { name: 'Unisex', slug: 'unisex', emoji: '✨', desc: 'For everyone' },
]

const BRANDS = [
  'Arabian Oud', 'Ajmal', 'Lattafa', 'Swiss Arabian',
  'Rasasi', 'Al Haramain', 'Armaf', 'Amouage',
]

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Discover niche fragrances<br />
            <span className="text-gold-500">mainstream sites ignore</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Search across 20+ MENA retailers. Compare prices instantly. Find your next signature scent.
          </p>
          <div className="max-w-xl mx-auto">
            <SearchBar />
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Arabian Oud · Ajmal · Lattafa · Swiss Arabian · Rasasi · Al Haramain · Amouage · and more
          </p>
        </div>
      </section>

      {/* Value props */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: '🔍', title: '20+ MENA Retailers', desc: 'One search across all of them' },
            { icon: '💸', title: 'Compare Prices Instantly', desc: 'Always see the cheapest option' },
            { icon: '🆓', title: 'Completely Free', desc: 'No account needed' },
          ].map(p => (
            <div key={p.title} className="py-2">
              <span className="text-3xl">{p.icon}</span>
              <p className="font-semibold text-gray-900 mt-2">{p.title}</p>
              <p className="text-sm text-gray-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                className="bg-white border border-gray-200 hover:border-gold-400 hover:shadow-sm rounded-xl p-4 text-center transition-all group">
                <span className="text-2xl">{cat.emoji}</span>
                <p className="font-medium text-gray-900 text-sm mt-2 group-hover:text-gold-600">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured products */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Fragrances</h2>
              <Link href="/search" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state — shown when no products scraped yet */}
        {featured.length === 0 && (
          <section className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-4xl mb-4">🕌</p>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Catalog loading...</h2>
            <p className="text-gray-500 mb-6">Run the scrapers to populate the product database.</p>
            <code className="bg-gray-100 text-sm px-4 py-2 rounded font-mono">npm run scrape</code>
          </section>
        )}

        {/* Browse by brand */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Brand</h2>
          <div className="flex flex-wrap gap-3">
            {BRANDS.map(brand => (
              <Link key={brand}
                href={`/search?brand=${encodeURIComponent(brand)}`}
                className="bg-white border border-gray-200 hover:border-gold-400 hover:bg-gold-50 text-gray-700 hover:text-gold-700 text-sm font-medium px-4 py-2 rounded-full transition-all">
                {brand}
              </Link>
            ))}
            <Link href="/search"
              className="bg-navy-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-navy-700 transition-colors">
              All brands →
            </Link>
          </div>
        </section>

        {/* SEO text block */}
        <section className="bg-white rounded-xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            The niche fragrance search engine you&apos;ve been waiting for
          </h2>
          <p className="text-gray-600 leading-relaxed">
            BestFragrancePrices tracks Dior and Chanel. Fragrantica covers reviews. But if you&apos;re looking
            for the best price on a Lattafa Raghba, an Arabian Oud attar, or a rare Ajmal oud blend — those
            sites can&apos;t help you. NicheScent searches across 20+ MENA fragrance retailers so you can
            compare prices in one place and always buy at the best price.
          </p>
        </section>
      </div>
    </div>
  )
}
