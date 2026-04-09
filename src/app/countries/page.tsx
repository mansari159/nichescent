import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import LuminaSlider, { type SlideData } from '@/components/ui/LuminaSlider'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fragrance Origins — Explore Traditions from 50+ Countries',
  description: 'Discover the fragrance heritage of the Middle East, South Asia, Europe, and beyond. From Emirati oud to French niche perfumery.',
}

const REGION_ORDER = ['Middle East', 'South Asia', 'Europe', 'Southeast Asia', 'North America', 'East Asia']

// ─── Country image map ────────────────────────────────────────────────────────
// High-quality cinematic Unsplash photos sized for full-screen WebGL rendering
const COUNTRY_IMAGES: Record<string, string> = {
  // Middle East
  AE: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=85&fit=crop',   // Dubai skyline
  SA: 'https://images.unsplash.com/photo-1586191582056-b3e3c6e2e7d8?w=1920&q=85&fit=crop',   // Riyadh/Saudi
  KW: 'https://images.unsplash.com/photo-1568797629192-789e3a6444c2?w=1920&q=85&fit=crop',   // Kuwait
  OM: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1920&q=85&fit=crop',   // Oman
  QA: 'https://images.unsplash.com/photo-1577948010956-b3f1ad6bd5f6?w=1920&q=85&fit=crop',   // Qatar
  // Europe
  FR: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&q=85&fit=crop',   // Paris at night
  GB: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=85&fit=crop',   // London
  IT: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1920&q=85&fit=crop',   // Italy
  DE: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=85&fit=crop',   // Germany
  // South Asia
  IN: 'https://images.unsplash.com/photo-1524492412937-b28074a47d70?w=1920&q=85&fit=crop',   // India
  PK: 'https://images.unsplash.com/photo-1588981884086-9d4b0b06b9d0?w=1920&q=85&fit=crop',   // Pakistan
  // East Asia
  JP: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=85&fit=crop',   // Tokyo neon streets
  // Southeast Asia
  ID: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1920&q=85&fit=crop',   // Indonesia/Bali
  MY: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920&q=85&fit=crop',   // Malaysia
  // North America
  US: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1920&q=85&fit=crop',   // New York
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1920&q=85&fit=crop'

// ─── Country descriptions (fragrance heritage copy) ───────────────────────────
const COUNTRY_DESC: Record<string, string> = {
  AE: 'The epicenter of oud and amber perfumery. Dubai has become a global hub for luxury fragrance, blending ancient Bedouin traditions with contemporary niche perfumery.',
  SA: 'The spiritual homeland of oud, bukhoor, and rose attar. Saudi perfumery is steeped in centuries of trade along the incense road.',
  FR: 'Grasse and Paris define the modern fragrance world. France\'s niche houses — Diptyque, Maison Margiela, L\'Artisan Parfumeur — set the standard for artisan perfumery.',
  GB: 'Home to Jo Malone, Penhaligon\'s, and a new generation of avant-garde British perfumers. London\'s fragrance scene is eclectic, literary, and quietly experimental.',
  IN: 'Kannauj produces the world\'s finest attars — steam-distilled botanicals on sandalwood oil. India\'s oud, jasmine, and rose extracts are prized globally.',
  JP: 'Japanese perfumery values restraint, clarity, and negative space. Tokyo houses like Comme des Garçons redefine minimalist luxury through avant-garde, conceptual scent.',
  PK: 'Rich in rose, jasmine, and kewra. Pakistani perfumers carry forward Mughal-era attar traditions with modern interpretations of classic South Asian florals.',
  KW: 'Kuwait\'s perfumers are known for their rich, resinous blends that honour Khaleeji tradition — heavy on oud, ambergris, and bakhoor.',
  OM: 'Oman\'s frankincense trade is among the oldest in the world. Amouage, founded in Muscat, is considered one of the world\'s most prestigious fragrance houses.',
  QA: 'Qatar\'s fragrance culture is deeply rooted in hospitality — perfuming guests and homes is a cornerstone of Qatari social tradition.',
  IT: 'Italy blends the artisan sensibility of Florence with the luxury of Milan. Santa Maria Novella, founded in 1612, is among the world\'s oldest perfumeries.',
  ID: 'Indonesia supplies some of the world\'s finest patchouli, vetiver, and nutmeg. Its tropical raw materials are the backbone of countless classic Western fragrances.',
  US: 'American niche perfumery has exploded over the last two decades — Le Labo, Malin+Goetz, Commodity — bringing a casual-luxury sensibility to artisan scent.',
  DE: 'Germany\'s BIEHL Parfumkunstwerke and 4160 Tuesdays represent a conceptual, intellectual approach to fragrance that challenges every convention.',
  MY: 'Malaysia is one of the region\'s fastest-growing fragrance markets, with a vibrant local industry blending Southeast Asian florals with Middle Eastern oud.',
}

// ─── Featured slides for the hero slider ─────────────────────────────────────
// Ordered for maximum visual variety across transitions
const FEATURED_COUNTRIES: Array<{
  code: string
  name: string
  region: string
  slug: string
  flag: string
}> = [
  { code: 'AE', name: 'UAE', region: 'Middle East', slug: 'ae', flag: '🇦🇪' },
  { code: 'FR', name: 'France', region: 'Europe', slug: 'fr', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', region: 'East Asia', slug: 'jp', flag: '🇯🇵' },
  { code: 'IN', name: 'India', region: 'South Asia', slug: 'in', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe', slug: 'gb', flag: '🇬🇧' },
  { code: 'OM', name: 'Oman', region: 'Middle East', slug: 'om', flag: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', region: 'South Asia', slug: 'pk', flag: '🇵🇰' },
]

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

// ─── Data fetching ─────────────────────────────────────────────────────────────
async function getCountriesWithBrands() {
  const { data: brands } = await supabase
    .from('brands')
    .select('country, region')
    .not('country', 'is', null)

  if (!brands) return []

  const counts: Record<string, { count: number; region: string }> = {}
  brands.forEach(b => {
    const c = b.country as string
    if (!counts[c]) counts[c] = { count: 0, region: b.region ?? 'Other' }
    counts[c].count++
  })

  return Object.entries(counts).map(([code, { count, region }]) => ({ code, count, region }))
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function CountriesPage() {
  const countries = await getCountriesWithBrands()

  // Build a count lookup
  const countByCode = Object.fromEntries(countries.map(c => [c.code, c.count]))

  // Build slider slides from featured countries
  const heroSlides: SlideData[] = FEATURED_COUNTRIES.map(fc => ({
    title: fc.name,
    subtitle: fc.region,
    badge: countByCode[fc.code]
      ? `${countByCode[fc.code]} ${countByCode[fc.code] === 1 ? 'brand' : 'brands'}`
      : undefined,
    description: COUNTRY_DESC[fc.code] ?? `Discover the fragrance heritage of ${fc.name}.`,
    image: COUNTRY_IMAGES[fc.code] ?? FALLBACK_IMAGE,
    href: `/country/${fc.slug}`,
    ctaLabel: `Explore ${fc.name} fragrances →`,
  }))

  // Group all countries by region for the browse grid below
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

      {/* ── Cinematic Slider Hero ──────────────────────────────────────────── */}
      <LuminaSlider
        slides={heroSlides}
        pageLabel="Fragrance Origins"
      />

      {/* ── Section bridge ────────────────────────────────────────────────── */}
      <div className="bg-obsidian-950 py-10 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-obsidian-400 text-sm">
            Browse all {countries.length} fragrance-producing countries
          </p>
          <div className="hidden sm:flex gap-2 text-[10px] tracking-widest uppercase text-obsidian-600">
            {REGION_ORDER.filter(r => byRegion[r]).map(r => (
              <a key={r} href={`#region-${r.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-obsidian-400 transition-colors">
                {r}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Region grids ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {sortedRegions.map(region => (
          <section
            key={region}
            id={`region-${region.toLowerCase().replace(/\s+/g, '-')}`}
            className="mb-16"
          >
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

        {/* Coming Soon */}
        <section>
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-obsidian-100">
            <h2 className="font-serif text-3xl text-obsidian-900 font-light opacity-40">Coming Soon</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 opacity-40">
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
