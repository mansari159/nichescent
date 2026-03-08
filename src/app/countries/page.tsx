import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Fragrance Origins — Explore Traditions from 50+ Countries',
  description: 'Discover the fragrance heritage of the Middle East, South Asia, Europe, and beyond. From Emirati oud to French niche perfumery.',
}

const REGION_ORDER = ['Middle East', 'South Asia', 'Europe', 'Southeast Asia', 'North America', 'East Asia']

const COUNTRY_IMAGES: Record<string, string> = {
  'AE': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  'SA': 'https://images.unsplash.com/photo-1586191582056-b3e3c6e2e7d8?w=600&q=80',
  'KW': 'https://images.unsplash.com/photo-1568797629192-789e3a6444c2?w=600&q=80',
  'OM': 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80',
  'QA': 'https://images.unsplash.com/photo-1577948010956-b3f1ad6bd5f6?w=600&q=80',
  'FR': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80',
  'GB': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
  'IN': 'https://images.unsplash.com/photo-1524492412937-b28074a47d70?w=600&q=80',
  'PK': 'https://images.unsplash.com/photo-1588981884086-9d4b0b06b9d0?w=600&q=80',
  'ID': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80'

async function getCountriesWithBrands() {
  const { data: brands } = await supabase
    .from('brands')
    .select('country, region')
    .not('country', 'is', null)

  if (!brands) return []

  // Count brands per country
  const counts: Record<string, { count: number; region: string }> = {}
  brands.forEach(b => {
    const c = b.country as string
    if (!counts[c]) counts[c] = { count: 0, region: b.region ?? 'Other' }
    counts[c].count++
  })

  return Object.entries(counts).map(([code, { count, region }]) => ({ code, count, region }))
}

const CODE_TO_DATA: Record<string, { name: string; flag: string; slug: string }> = {
  AE: { name: 'UAE', flag: '🇦🇪', slug: 'ae' },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦', slug: 'sa' },
  KW: { name: 'Kuwait', flag: '🇰🇼', slug: 'kw' },
  OM: { name: 'Oman', flag: '🇴🇲', slug: 'om' },
  QA: { name: 'Qatar', flag: '🇶🇦', slug: 'qa' },
  BH: { name: 'Bahrain', flag: '🇧🇭', slug: 'bh' },
  EG: { name: 'Egypt', flag: '🇪🇬', slug: 'eg' },
  JO: { name: 'Jordan', flag: '🇯🇴', slug: 'jo' },
  FR: { name: 'France', flag: '🇫🇷', slug: 'fr' },
  GB: { name: 'United Kingdom', flag: '🇬🇧', slug: 'gb' },
  DE: { name: 'Germany', flag: '🇩🇪', slug: 'de' },
  IT: { name: 'Italy', flag: '🇮🇹', slug: 'it' },
  IN: { name: 'India', flag: '🇮🇳', slug: 'in' },
  PK: { name: 'Pakistan', flag: '🇵🇰', slug: 'pk' },
  ID: { name: 'Indonesia', flag: '🇮🇩', slug: 'id' },
  MY: { name: 'Malaysia', flag: '🇲🇾', slug: 'my' },
  US: { name: 'United States', flag: '🇺🇸', slug: 'us' },
  CA: { name: 'Canada', flag: '🇨🇦', slug: 'ca' },
  JP: { name: 'Japan', flag: '🇯🇵', slug: 'jp' },
}

export default async function CountriesPage() {
  const countries = await getCountriesWithBrands()

  // Group by region
  const byRegion: Record<string, typeof countries> = {}
  countries.forEach(c => {
    const region = c.region || 'Other'
    if (!byRegion[region]) byRegion[region] = []
    byRegion[region].push(c)
  })

  const sortedRegions = REGION_ORDER.filter(r => byRegion[r]).concat(
    Object.keys(byRegion).filter(r => !REGION_ORDER.includes(r))
  )

  return (
    <div className="pt-16 bg-cream min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-obsidian-950 py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=60)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950/50 to-obsidian-950" />
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-[10px] tracking-widest uppercase text-obsidian-500 mb-4">Fragrance Heritage</p>
          <h1 className="font-serif text-5xl sm:text-6xl font-light text-cream mb-4">
            Explore Fragrance<br />Traditions Worldwide
          </h1>
          <p className="text-obsidian-400 text-lg max-w-xl">
            From ancient trade routes to modern artisan houses — discover perfumery cultures from {Object.keys(byRegion).length} regions.
          </p>
        </div>
      </section>

      {/* ── Regions ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {sortedRegions.map(region => (
          <section key={region} className="mb-16">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-obsidian-100">
              <h2 className="font-serif text-3xl text-obsidian-900 font-light">{region}</h2>
              <span className="text-xs text-obsidian-400 border border-obsidian-200 px-2 py-1">
                {byRegion[region].length} {byRegion[region].length === 1 ? 'country' : 'countries'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {byRegion[region]
                .sort((a, b) => b.count - a.count)
                .map(country => {
                  const meta = CODE_TO_DATA[country.code]
                  if (!meta) return null
                  return (
                    <Link
                      key={country.code}
                      href={`/country/${meta.slug}`}
                      className="group relative aspect-[3/4] overflow-hidden block"
                    >
                      <Image
                        src={COUNTRY_IMAGES[country.code] ?? FALLBACK_IMAGE}
                        alt={meta.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-obsidian-950/20 to-transparent group-hover:from-obsidian-950/90 transition-all duration-300" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="font-serif text-lg text-cream font-light">{meta.name}</p>
                        <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mt-0.5">
                          {country.count} {country.count === 1 ? 'brand' : 'brands'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </section>
        ))}

        {/* Coming Soon regions */}
        <section>
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-obsidian-100">
            <h2 className="font-serif text-3xl text-obsidian-900 font-light opacity-50">Coming Soon</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 opacity-50">
            {['West Africa', 'Latin America', 'East Africa', 'Central Asia'].map(region => (
              <div key={region} className="border border-dashed border-obsidian-200 p-6 text-center">
                <p className="font-serif text-lg text-obsidian-400 font-light">{region}</p>
                <p className="text-[10px] tracking-widest uppercase text-obsidian-300 mt-1">Coming soon</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
