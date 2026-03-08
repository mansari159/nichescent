import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const SITE_URL = 'https://raretrace.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/vibes`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/countries`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/brands`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Vibe pages
  const vibePages: MetadataRoute.Sitemap = [
    'warm-spicy', 'woody-earthy', 'floral-romantic', 'smoky-intense', 'sweet-gourmand', 'fresh-clean',
  ].map(slug => ({
    url: `${SITE_URL}/vibe/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Country pages
  const countryPages: MetadataRoute.Sitemap = [
    'ae', 'sa', 'kw', 'om', 'qa', 'fr', 'in',
  ].map(slug => ({
    url: `${SITE_URL}/country/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic: brand pages
  let brandPages: MetadataRoute.Sitemap = []
  try {
    const { data: brands } = await supabase.from('brands').select('slug, updated_at').order('name')
    brandPages = (brands ?? []).map(b => ({
      url: `${SITE_URL}/brand/${b.slug}`,
      lastModified: b.updated_at ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch { /* skip on build */ }

  // Dynamic: fragrance pages
  let fragPages: MetadataRoute.Sitemap = []
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    fragPages = (products ?? []).map(p => ({
      url: `${SITE_URL}/fragrance/${p.slug}`,
      lastModified: p.updated_at ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  } catch { /* skip on build */ }

  return [...staticPages, ...vibePages, ...countryPages, ...brandPages, ...fragPages]
}
