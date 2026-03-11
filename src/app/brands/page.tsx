import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getCountryFlag, getCountryName } from '@/lib/countries'
import { getBrandLogoUrl } from '@/lib/utils'
import BrandLogoImage from '@/components/BrandLogoImage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'All Fragrance Brands — Artisan & Niche Houses',
  description: 'Browse all niche and artisan fragrance brands tracked by RareTrace. Alphabetical listing with country, founding year, and fragrance count.',
}

async function getBrands() {
  const { data } = await supabase
    .from('brands')
    .select('id, name, slug, country, logo_url, products_count, website_url')
    .order('name', { ascending: true })
  return data ?? []
}

export default async function BrandsPage() {
  const brands = await getBrands()

  // Group alphabetically
  const alphabetical: Record<string, typeof brands> = {}
  brands.forEach(b => {
    const letter = b.name.charAt(0).toUpperCase()
    const key = /[A-Z]/.test(letter) ? letter : '#'
    if (!alphabetical[key]) alphabetical[key] = []
    alphabetical[key].push(b)
  })

  const letters = Object.keys(alphabetical).sort((a, b) => {
    if (a === '#') return 1
    if (b === '#') return -1
    return a.localeCompare(b)
  })

  // Featured (most products first)
  const featured = [...brands]
    .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0))
    .slice(0, 6)

  return (
    <div className="pt-16 bg-cream min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-obsidian-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] tracking-widest uppercase text-obsidian-500 mb-4">Fragrance Houses</p>
          <h1 className="font-serif text-5xl sm:text-6xl font-light text-cream mb-4">All Brands</h1>
          <p className="text-obsidian-400 text-lg">{brands.length} fragrance houses tracked</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* ── Featured ──────────────────────────────────────────────────── */}
        {featured.length > 0 && (
          <section className="mb-16">
            <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">Most popular</p>
            <h2 className="font-serif text-3xl text-obsidian-900 font-light mb-8">Featured Houses</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featured.map(brand => {
                const logoUrl = getBrandLogoUrl(brand)
                return (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.slug}`}
                    className="group bg-white border border-obsidian-100 hover:border-gold-300 hover:shadow-sm transition-all p-5 flex flex-col items-center text-center"
                  >
                    <div className="w-14 h-14 flex items-center justify-center mb-3 bg-obsidian-50 rounded-sm overflow-hidden">
                      {logoUrl ? (
                        <BrandLogoImage src={logoUrl} name={brand.name} size={40} />
                      ) : (
                        <span className="font-serif text-xl text-obsidian-400">{brand.name.charAt(0)}</span>
                      )}
                    </div>
                    <p className="font-serif text-sm text-obsidian-900 group-hover:text-gold-600 transition-colors leading-snug">
                      {brand.name}
                    </p>
                    <p className="text-[10px] text-obsidian-400 mt-1">
                      {brand.country ? `${getCountryFlag(brand.country)} ` : ''}
                      {brand.products_count ?? 0} items
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Alphabet quick-nav ────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-1 mb-10 py-4 border-y border-obsidian-100">
          {letters.map(l => (
            <a
              key={l}
              href={`#letter-${l}`}
              className="w-8 h-8 flex items-center justify-center text-xs text-obsidian-500 hover:text-obsidian-900 hover:bg-obsidian-100 transition-colors"
            >
              {l}
            </a>
          ))}
        </div>

        {/* ── Alphabetical sections ─────────────────────────────────────── */}
        {letters.map(letter => (
          <section key={letter} id={`letter-${letter}`} className="mb-12">
            <h3 className="font-serif text-4xl text-obsidian-200 font-light mb-4">{letter}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {alphabetical[letter].map(brand => {
                const logoUrl = getBrandLogoUrl(brand)
                return (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.slug}`}
                    className="group flex items-center justify-between p-4 bg-white border border-obsidian-100 hover:border-gold-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Logo or initial */}
                      <div className="w-9 h-9 bg-obsidian-50 flex items-center justify-center shrink-0 overflow-hidden">
                        {logoUrl ? (
                          <BrandLogoImage src={logoUrl} name={brand.name} size={28} />
                        ) : (
                          <span className="font-serif text-sm text-obsidian-400">{brand.name.charAt(0)}</span>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-obsidian-900 group-hover:text-gold-600 transition-colors font-medium leading-snug">
                          {brand.name}
                        </p>
                        <p className="text-[10px] text-obsidian-400 mt-0.5">
                          {brand.country
                            ? `${getCountryFlag(brand.country)} ${getCountryName(brand.country)} · `
                            : ''}
                          {brand.products_count ?? 0} fragrances
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-obsidian-300 group-hover:text-gold-500 transition-colors tracking-widest uppercase shrink-0 ml-2">
                      View →
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}

        {/* Coming soon */}
        <section className="border-t border-obsidian-100 pt-12 text-center">
          <p className="font-serif text-3xl text-obsidian-900 font-light mb-3">More brands coming soon</p>
          <p className="text-sm text-obsidian-500">We add 50+ new houses every week.</p>
        </section>
      </div>
    </div>
  )
}
