import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { getCountryFlag, getCountryName, getCountryRegion } from '@/lib/countries'
import { getCountryHeroImage } from '@/lib/country-images'

export const metadata: Metadata = {
  title: 'Fragrance Origins — Niche Perfumes by Country · RareTrace',
  description:
    'Explore niche fragrances from 50+ countries. From Middle Eastern oud houses to French artisan perfumers, discover the world's finest fragrance traditions.',
}

const REGION_ORDER = [
  'Middle East',
  'South Asia',
  'Southeast Asia',
  'East Asia',
  'Europe',
  'Americas',
  'Oceania',
  'Africa',
]

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

interface CountryCard {
  code: string
  name: string
  flag: string
  brandCount: number
  image: string
  region: string
}

async function getCountriesData(): Promise<{
  byRegion: Record<string, CountryCard[]>
  totalCountries: number
  totalBrands: number
}> {
  const { data } = await supabase
    .from('brands')
    .select('country')
    .not('country', 'is', null)

  if (!data) return { byRegion: {}, totalCountries: 0, totalBrands: 0 }

  // Tally brand counts per country code
  const counts: Record<string, number> = {}
  for (const row of data) {
    if (row.country) {
      const code = row.country.toUpperCase()
      counts[code] = (counts[code] ?? 0) + 1
    }
  }

  const byRegion: Record<string, CountryCard[]> = {}

  for (const [code, brandCount] of Object.entries(counts)) {
    const name = getCountryName(code)
    if (!name) continue
    const region = getCountryRegion(code) || 'Other'
    if (!byRegion[region]) byRegion[region] = []
    byRegion[region].push({
      code,
      name,
      flag: getCountryFlag(code),
      brandCount,
      image: getCountryHeroImage(code, region),
      region,
    })
  }

  // Sort each region by brand count descending
  for (const r of Object.keys(byRegion)) {
    byRegion[r].sort((a, b) => b.brandCount - a.brandCount)
  }

  const totalCountries = Object.keys(counts).length
  const totalBrands = Object.values(counts).reduce((a, b) => a + b, 0)

  return { byRegion, totalCountries, totalBrands }
}

export default async function CountriesPage() {
  const { byRegion, totalCountries, totalBrands } = await getCountriesData()
  const activeRegions = REGION_ORDER.filter(r => byRegion[r]?.length > 0)

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-obsidian-950 border-b border-obsidian-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/"
            className="text-xs text-obsidian-500 hover:text-obsidian-300 uppercase tracking-widest transition-colors mb-6 block"
          >
            ← Home
          </Link>
          <p className="label-overline text-obsidian-500 mb-4">Fragrance heritage</p>
          <h1 className="font-serif text-5xl md:text-6xl text-cream font-light mb-4 leading-tight">
            Discover by Origin
          </h1>
          <p className="text-obsidian-400 text-lg max-w-xl leading-relaxed">
            Niche and artisan houses from {totalCountries} countries — every perfumery tradition on earth, tracked daily.
          </p>
          <div className="flex gap-8 mt-8">
            <div>
              <p className="text-2xl font-serif text-cream font-light">{totalCountries}</p>
              <p className="text-xs text-obsidian-500 uppercase tracking-widest mt-0.5">Countries</p>
            </div>
            <div className="w-px bg-obsidian-800" />
            <div>
              <p className="text-2xl font-serif text-cream font-light">{totalBrands}</p>
              <p className="text-xs text-obsidian-500 uppercase tracking-widest mt-0.5">Brands</p>
            </div>
            <div className="w-px bg-obsidian-800" />
            <div>
              <p className="text-2xl font-serif text-cream font-light">{activeRegions.length}</p>
              <p className="text-xs text-obsidian-500 uppercase tracking-widest mt-0.5">Regions</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Region jump links ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-obsidian-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-5 overflow-x-auto scrollbar-hide">
          {activeRegions.map(r => (
            <a
              key={r}
              href={`#${REGION_SLUGS[r]}`}
              className="text-xs text-obsidian-500 hover:text-obsidian-900 whitespace-nowrap transition-colors uppercase tracking-widest"
            >
              {r}
            </a>
          ))}
        </div>
      </div>

      {/* ── Countries by region ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        {activeRegions.map(region => (
          <section key={region} id={REGION_SLUGS[region]}>

            {/* Region header */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="label-overline text-obsidian-400 mb-2">{byRegion[region].length} countries</p>
                <h2 className="font-serif text-3xl text-obsidian-900 font-light">{region}</h2>
              </div>
              <Link
                href={`/search?region=${REGION_SLUGS[region]}`}
                className="text-xs tracking-widest uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block"
              >
                Browse all →
              </Link>
            </div>

            {/* Country cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {byRegion[region].map(country => (
                <Link
                  key={country.code}
                  href={`/country/${country.code.toLowerCase()}`}
                  className="group relative overflow-hidden aspect-[4/3] block"
                >
                  {/* Cinematic background */}
                  <Image
                    src={country.image}
                    alt={`${country.name} cityscape`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/20 to-transparent group-hover:from-obsidian-950/80 transition-all duration-300" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-2xl block mb-1">{country.flag}</span>
                    <p className="font-serif text-base text-cream font-light leading-tight">
                      {country.name}
                    </p>
                    <p className="text-[10px] text-obsidian-400 mt-1 tracking-widest uppercase">
                      {country.brandCount} {country.brandCount === 1 ? 'brand' : 'brands'}
                    </p>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-xs text-white/60 bg-obsidian-900/60 px-2 py-1">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

    </div>
  )
}
