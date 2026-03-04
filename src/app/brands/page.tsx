import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Brand } from '@/types'

export const metadata: Metadata = {
  title: 'All Brands — MENA Fragrance Houses',
  description: 'Explore all MENA fragrance brands tracked by RareTrace. Compare prices for Lattafa, Ajmal, Swiss Arabian, Rasasi, Gissah, Assaf, and more.',
}

const regionLabels: Record<string, string> = {
  MENA: 'Middle East & North Africa',
  European: 'European',
  American: 'American',
  Asian: 'Asian',
}

async function getBrands(): Promise<Array<Brand & { products_count: number }>> {
  const { data } = await supabase
    .from('brands')
    .select(`
      *,
      products_count:products(count)
    `)
    .order('name', { ascending: true })

  return (data ?? [])
    .map(b => ({
      ...b,
      products_count: b.products_count?.[0]?.count ?? 0,
    }))
    .filter(b => b.products_count > 0) as Array<Brand & { products_count: number }>
}

export default async function BrandsPage() {
  const brands = await getBrands()

  // Group by first letter
  const grouped: Record<string, typeof brands> = {}
  for (const brand of brands) {
    const letter = brand.name.charAt(0).toUpperCase()
    if (!grouped[letter]) grouped[letter] = []
    grouped[letter].push(brand)
  }

  const letters = Object.keys(grouped).sort()

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <nav className="text-sm text-obsidian-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-obsidian-600">Home</Link>
        <span>/</span>
        <span className="text-obsidian-700">All Brands</span>
      </nav>

      <div className="mb-10">
        <p className="text-xs tracking-widest2 uppercase text-obsidian-400 mb-2">Houses we cover</p>
        <h1 className="font-serif text-5xl text-obsidian-900 font-light">All Brands</h1>
        <p className="text-obsidian-500 mt-3 text-sm">
          {brands.length} fragrance houses with active listings — prices compared daily.
        </p>
      </div>

      {/* Alphabet quick-jump */}
      <div className="flex flex-wrap gap-1.5 mb-10">
        {letters.map(l => (
          <a key={l} href={`#letter-${l}`}
            className="text-xs border border-obsidian-200 text-obsidian-500 hover:border-gold-400 hover:text-obsidian-900 w-7 h-7 flex items-center justify-center transition-colors">
            {l}
          </a>
        ))}
      </div>

      {/* Brand grid by letter */}
      <div className="space-y-12">
        {letters.map(letter => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="font-serif text-2xl text-obsidian-400 font-light mb-5 border-b border-obsidian-100 pb-2">
              {letter}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {grouped[letter].map(brand => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  className="group bg-white border border-obsidian-100 hover:border-gold-300 p-4 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {brand.logo_url ? (
                      <img src={brand.logo_url} alt={brand.name} className="h-7 w-auto object-contain" />
                    ) : (
                      <div className="w-7 h-7 bg-obsidian-100 flex items-center justify-center text-obsidian-500 text-xs font-bold shrink-0">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="font-serif text-base text-obsidian-900 font-light group-hover:text-obsidian-700 leading-tight">
                      {brand.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-obsidian-400">
                      {brand.products_count > 0 ? `${brand.products_count} fragrances` : 'No listings'}
                    </span>
                    {brand.country && (
                      <span className="text-[10px] text-obsidian-300">{brand.country}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="text-center py-20 border border-obsidian-100 bg-white">
          <p className="font-serif text-2xl text-obsidian-400 font-light mb-3">No brands yet</p>
          <p className="text-sm text-obsidian-400">Run the scrapers to populate the catalog.</p>
        </div>
      )}
    </div>
  )
}
