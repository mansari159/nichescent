import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdUnit from '@/components/AdUnit'
import InfiniteScrollLoader from '@/components/InfiniteScrollLoader'
import type { Product } from '@/types'
import { getCountryFlag } from '@/lib/countries'

interface Props { params: { slug: string } }

// Map country codes/slugs to country data
const COUNTRY_DATA: Record<string, {
  name: string; code: string; region: string; flag: string
  heroImage: string; heroVideo?: string
  heritage: string
}> = {
  'ae': {
    name: 'United Arab Emirates', code: 'AE', region: 'Middle East', flag: '🇦🇪',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80',
    heritage: 'The United Arab Emirates sits at the crossroads of ancient trade routes, where the perfume culture has evolved over millennia. Oud — harvested from the heartwood of Aquilaria trees — has been the cornerstone of Emirati fragrance identity for centuries, burned as incense to welcome guests and layered into personal scent rituals. The UAE is home to some of the world\'s most innovative fragrance houses, blending traditional Arabic oudh, rose, and musk compositions with contemporary western perfumery techniques. Dubai and Abu Dhabi have become global fragrance capitals, attracting master perfumers who push the boundaries of olfactory art while honoring the region\'s deep aromatic heritage.',
  },
  'sa': {
    name: 'Saudi Arabia', code: 'SA', region: 'Middle East', flag: '🇸🇦',
    heroImage: 'https://images.unsplash.com/photo-1586191582056-b3e3c6e2e7d8?auto=format&fit=crop&w=1920&q=80',
    heritage: 'Saudi Arabia holds one of the most storied fragrance traditions on earth. The Kingdom\'s affinity for oud, incense, and bakhoor stretches back to ancient trade along the Frankincense Route. Saudi fragrance culture is deeply ceremonial — attar oils are worn daily, bakhoor chips are burned to purify and welcome, and gifting perfume carries profound social and spiritual meaning. Riyadh and Jeddah are home to legendary perfume souks where master distillers craft attars and blends passed down through generations. Contemporary Saudi perfumers are now pioneering a new chapter, fusing centuries-old traditions with cutting-edge extraction and blending techniques to create fragrances recognized worldwide.',
  },
  'kw': {
    name: 'Kuwait', code: 'KW', region: 'Middle East', flag: '🇰🇼',
    heroImage: 'https://images.unsplash.com/photo-1568797629192-789e3a6444c2?auto=format&fit=crop&w=1920&q=80',
    heritage: 'Kuwait punches far above its geographic size in the fragrance world. Home to Gissah — one of the most sought-after niche houses in the Gulf — Kuwait has cultivated a sophisticated olfactory culture shaped by its pearl-diving heritage, trade connections, and rich Bedouin traditions. Kuwaiti fragrance favors opulent saffron accords, deep oud bases, and bold amber compositions that command attention. The country\'s proximity to the sea has also introduced aquatic and breezy elements rarely found in neighboring Gulf fragrances, giving Kuwaiti perfumery a distinct coastal identity that collectors worldwide seek out.',
  },
  'fr': {
    name: 'France', code: 'FR', region: 'Europe', flag: '🇫🇷',
    heroImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1920&q=80',
    heritage: 'France is the undisputed birthplace of modern perfumery. The town of Grasse in the French Riviera has been the world\'s perfume capital since the 17th century, its unique microclimate producing some of the finest jasmine, rose, and lavender in existence. French perfumery established the fundamental structures — top, heart, and base notes — that define fragrance construction globally. The grande maisons of Paris elevated perfume to a luxury art form. Today, a new generation of independent French perfumers — les créateurs — work outside the mainstream to create intensely personal, avant-garde compositions that challenge convention while honoring France\'s exquisite olfactory heritage.',
  },
  'in': {
    name: 'India', code: 'IN', region: 'South Asia', flag: '🇮🇳',
    heroImage: 'https://images.unsplash.com/photo-1524492412937-b28074a47d70?auto=format&fit=crop&w=1920&q=80',
    heritage: 'India is the ancient homeland of attar — pure perfume oils steam-distilled into a sandalwood base using copper degs unchanged in design for 5,000 years. The city of Kannauj in Uttar Pradesh remains the spiritual and commercial heart of this tradition, its lanes perfumed with the smoke of distillation from hundreds of family-run ittarkhanas. Indian fragrance is an entire sensory language: rose, jasmine, vetiver, saffron, and earthy mitti (the scent of the first rain on dry earth) each carry deep cultural and spiritual meaning. Contemporary Indian perfumers are now exporting this extraordinary heritage to the world, reimagining ancient formulas through a modern lens.',
  },
  'om': {
    name: 'Oman', code: 'OM', region: 'Middle East', flag: '🇴🇲',
    heroImage: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1920&q=80',
    heritage: 'Oman is home to Amouage — regarded by many as the most luxurious perfume brand on earth — and holds one of the oldest fragrance traditions in the Arabian Peninsula. The Dhofar region produces some of the world\'s finest frankincense, burned since antiquity in temples and traded across continents. Omani perfumery is characterized by extraordinary quality — rare oud from Southeast Asia, Taifi rose, and Indian sandalwood blended with native frankincense to create fragrances of unparalleled complexity and longevity.',
  },
}

async function getCountryProducts(code: string): Promise<{ products: Product[]; total: number }> {
  // Join through brands to filter by country
  const { data: brands } = await supabase.from('brands').select('id').eq('country', code.toUpperCase())
  if (!brands?.length) return { products: [], total: 0 }
  const brandIds = brands.map(b => b.id)

  const { data, count } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)', { count: 'exact' })
    .in('brand_id', brandIds)
    .eq('is_active', true)
    .not('lowest_price', 'is', null)
    .order('created_at', { ascending: false })
    .range(0, 23)

  return { products: (data ?? []) as Product[], total: count ?? 0 }
}

async function getCountryBrands(code: string) {
  const { data } = await supabase
    .from('brands')
    .select('*')
    .eq('country', code.toUpperCase())
    .order('products_count', { ascending: false })
    .limit(8)
  return data ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug.toLowerCase()
  const country = COUNTRY_DATA[slug]
  if (!country) return { title: 'Country Not Found' }
  return {
    title: `${country.name} Fragrances — Niche Houses & Heritage Brands`,
    description: `Discover niche fragrances from ${country.name}. ${country.heritage.slice(0, 150)}…`,
    openGraph: { images: [{ url: country.heroImage, width: 1920, height: 1080, alt: country.name }] },
  }
}

export default async function CountryPage({ params }: Props) {
  const slug = params.slug.toLowerCase()
  const country = COUNTRY_DATA[slug]
  if (!country) notFound()

  const [{ products, total }, brands] = await Promise.all([
    getCountryProducts(country.code),
    getCountryBrands(country.code),
  ])

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${country.name} Fragrance Heritage`,
    description: country.heritage.slice(0, 200),
    about: { '@type': 'Place', name: country.name },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="bg-cream">

        {/* ── Cinematic Hero ──────────────────────────────────────────────── */}
        <section className="relative min-h-[80vh] flex items-end overflow-hidden bg-obsidian-950">
          {/* Parallax background image */}
          <div
            className="absolute inset-0 scale-110"
            style={{ backgroundImage: `url(${country.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundAttachment: 'fixed' }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-obsidian-950/10" />

          <div className="relative max-w-7xl mx-auto px-6 pb-20 pt-32 w-full">
            <span className="text-6xl block mb-4">{country.flag}</span>
            <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">{country.region}</p>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-cream leading-tight mb-4">
              {country.name}
            </h1>
            <p className="text-obsidian-400 text-lg max-w-xl">
              {brands.length} fragrance {brands.length === 1 ? 'house' : 'houses'} · {total.toLocaleString()} {total === 1 ? 'fragrance' : 'fragrances'}
            </p>
          </div>
        </section>

        {/* ── Animated stats ──────────────────────────────────────────────── */}
        <section className="bg-obsidian-900 border-y border-obsidian-800">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-3 gap-8 text-center">
            {[
              { value: brands.length, label: 'Fragrance Houses' },
              { value: total, label: 'Fragrances' },
              { value: country.region, label: 'Region', isText: true },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-serif text-3xl sm:text-4xl text-cream mb-1">
                  {stat.isText ? stat.value : stat.value.toLocaleString()}
                  {!stat.isText && '+'}
                </p>
                <p className="text-[10px] tracking-widest uppercase text-obsidian-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Heritage section ──────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
              <div>
                <p className="label-overline text-obsidian-400 mb-3">Fragrance Heritage</p>
                <h2 className="font-serif text-4xl text-obsidian-900 font-light leading-tight">
                  The Art of<br />{country.name}<br />Perfumery
                </h2>
              </div>
              <div>
                <p className="text-base text-obsidian-600 leading-[1.9]">{country.heritage}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Brands ────────────────────────────────────────────────────────── */}
        {brands.length > 0 && (
          <section className="bg-parchment py-24">
            <div className="max-w-7xl mx-auto px-6">
              <p className="label-overline text-obsidian-400 mb-2">Fragrance Houses</p>
              <h2 className="font-serif text-4xl text-obsidian-900 font-light mb-10">
                {country.name} Perfumers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {brands.map((brand: { id: string; name: string; slug: string; description: string | null; products_count: number }) => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.slug}`}
                    className="group bg-white border border-obsidian-100 hover:border-gold-300 transition-colors p-6 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-serif text-xl text-obsidian-900 font-light group-hover:text-gold-600 transition-colors">
                        {brand.name}
                      </p>
                      <span className="text-[10px] tracking-widest uppercase text-obsidian-400">
                        {brand.products_count} items
                      </span>
                    </div>
                    {brand.description && (
                      <p className="text-xs text-obsidian-500 line-clamp-3 leading-relaxed">
                        {brand.description.slice(0, 120)}…
                      </p>
                    )}
                    <span className="text-[10px] tracking-widest uppercase text-gold-500 group-hover:text-gold-700 transition-colors mt-auto">
                      View Collection →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Fragrances ────────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="label-overline text-obsidian-400 mb-2">From {country.name}</p>
                <h2 className="font-serif text-4xl text-obsidian-900 font-light">
                  {country.name} Fragrances
                </h2>
              </div>
              <p className="text-sm text-obsidian-400 hidden sm:block">{total.toLocaleString()} total</p>
            </div>

            <div className="mb-8">
              <AdUnit position="before_scroll" />
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 border border-obsidian-100">
                <p className="font-serif text-2xl text-obsidian-400 font-light mb-3">
                  No fragrances yet from {country.name}
                </p>
                <p className="text-sm text-obsidian-400">We&apos;re adding brands from this region soon.</p>
              </div>
            ) : (
              <InfiniteScrollLoader
                initialProducts={products}
                totalCount={total}
                fetchUrl="/api/products"
                extraParams={{ country: country.code.toLowerCase() }}
                context={`${country.name} fragrances`}
                category="fragrances"
              />
            )}
          </div>
        </section>

        {/* Back to countries */}
        <div className="border-t border-obsidian-100 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <Link href="/countries" className="text-[11px] tracking-widest uppercase text-gold-500 hover:text-gold-600 transition-colors">
              ← All Origins
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
