import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE_URL = 'https://raretrace.vercel.app'

const VIBE_SLUGS = [
  'woody-earthy', 'warm-spicy', 'floral-romantic',
  'smoky-intense', 'sweet-gourmand', 'fresh-clean',
]

// All 30 note slugs (matches patch-007 seed data)
const NOTE_SLUGS = [
  'oud', 'sandalwood', 'cedarwood', 'vetiver', 'patchouli',
  'benzoin', 'labdanum', 'incense', 'amber', 'saffron',
  'cardamom', 'cinnamon', 'pink-pepper', 'rose', 'jasmine',
  'orange-blossom', 'ylang-ylang', 'neroli', 'vanilla', 'tonka-bean',
  'caramel', 'honey', 'musk', 'leather', 'tobacco',
  'smoke', 'bergamot', 'grapefruit', 'lavender', 'aquatic',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static pages ────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/search`,                  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/brands`,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/notes`,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/category/ouds`,           lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/category/attars`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/category/bakhoor`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/category/under-50`,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/about`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/affiliate-disclosure`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE_URL}/privacy`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE_URL}/terms`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
  ]

  // ── Vibe pages ──────────────────────────────────────────────────────────
  const vibePages: MetadataRoute.Sitemap = VIBE_SLUGS.map(slug => ({
    url: `${BASE_URL}/vibe/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // ── Note pages ──────────────────────────────────────────────────────────
  const notePages: MetadataRoute.Sitemap = NOTE_SLUGS.map(slug => ({
    url: `${BASE_URL}/note/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // ── Dynamic product pages ───────────────────────────────────────────────
  let productPages: MetadataRoute.Sitemap = []
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null)

    productPages = (products ?? []).map(p => ({
      url: `${BASE_URL}/product/${p.slug}`,
      lastModified: new Date(p.updated_at ?? new Date()),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))
  } catch { /* DB unavailable */ }

  // ── Dynamic brand pages ─────────────────────────────────────────────────
  let brandPages: MetadataRoute.Sitemap = []
  try {
    const { data: brands } = await supabase
      .from('brands')
      .select('slug')
      .not('slug', 'is', null)

    brandPages = (brands ?? []).map(b => ({
      url: `${BASE_URL}/brand/${b.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch { /* DB unavailable */ }

  // ── Dynamic dupe pages (ready for Batch 3) ──────────────────────────────
  let dupePages: MetadataRoute.Sitemap = []
  try {
    const { data: dupes } = await supabase
      .from('dupes')
      .select('slug')
      .not('slug', 'is', null)

    dupePages = (dupes ?? []).map(d => ({
      url: `${BASE_URL}/dupe/${d.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8, // high priority — SEO traffic driver
    }))
  } catch { /* dupes table not created yet */ }

  // ── Country pages (ready for Batch 2) ──────────────────────────────────
  let countryPages: MetadataRoute.Sitemap = []
  try {
    const { data: countries } = await supabase
      .from('countries')
      .select('code')

    countryPages = (countries ?? []).map(c => ({
      url: `${BASE_URL}/country/${c.code.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch { /* countries table not created yet */ }

  return [
    ...staticPages,
    ...vibePages,
    ...notePages,
    ...productPages,
    ...brandPages,
    ...dupePages,
    ...countryPages,
  ]
}
