import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE_URL = 'https://raretrace.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/notes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/category/ouds`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/category/attars`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/category/bakhoor`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/category/under-50`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/affiliate-disclosure`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
  ]

  // Vibe pages
  const vibePages: MetadataRoute.Sitemap = [
    'woody-earthy', 'warm-spicy', 'floral-romantic',
    'smoky-intense', 'sweet-gourmand', 'fresh-clean',
  ].map(slug => ({
    url: `${BASE_URL}/vibe/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic product pages
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
  } catch { /* if DB unavailable, skip */ }

  // Dynamic brand pages
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
      priority: 0.5,
    }))
  } catch { /* if DB unavailable, skip */ }

  return [...staticPages, ...vibePages, ...productPages, ...brandPages]
}
