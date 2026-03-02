import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

interface Props { params: { slug: string } }

const VIBE_META: Record<string, {
  name: string; emoji: string; description: string; keywords: string[]
}> = {
  'woody-earthy': {
    name: 'Woody & Earthy',
    emoji: '🌿',
    description: 'Fragrances rooted in oud, sandalwood, cedarwood, and vetiver — grounded, masculine, and deeply oriental.',
    keywords: ['oud fragrance', 'sandalwood perfume', 'woody MENA fragrance'],
  },
  'warm-spicy': {
    name: 'Warm & Spicy',
    emoji: '🔥',
    description: 'Rich saffron, cardamom, cinnamon, and amber — the signature warmth of Arabian perfumery.',
    keywords: ['saffron perfume', 'warm spicy fragrance', 'amber oriental'],
  },
  'floral-romantic': {
    name: 'Floral & Romantic',
    emoji: '🌹',
    description: 'Rose, jasmine, orange blossom, and neroli — delicate, feminine, and breathtakingly beautiful.',
    keywords: ['rose perfume', 'jasmine fragrance', 'floral oriental'],
  },
  'smoky-intense': {
    name: 'Smoky & Intense',
    emoji: '🖤',
    description: 'Leather, tobacco, incense, and smoke — bold, dark, and mysterious fragrances for the confident.',
    keywords: ['leather fragrance', 'smoky perfume', 'intense oriental'],
  },
  'sweet-gourmand': {
    name: 'Sweet & Gourmand',
    emoji: '🍯',
    description: 'Vanilla, honey, tonka, and caramel — indulgent, cozy, and irresistibly warm.',
    keywords: ['vanilla perfume', 'sweet fragrance', 'gourmand oriental'],
  },
  'fresh-clean': {
    name: 'Fresh & Clean',
    emoji: '💧',
    description: 'Bright citrus, aquatic accords, and clean musks — uplifting and effortlessly modern.',
    keywords: ['fresh fragrance', 'citrus perfume', 'aquatic MENA'],
  },
}

async function getVibeProducts(slug: string): Promise<Product[]> {
  try {
    // Try via product_vibes table (post-migration)
    const { data: vibe } = await supabase
      .from('vibes')
      .select('id')
      .eq('slug', slug)
      .single()

    if (vibe) {
      const { data: pvRows } = await supabase
        .from('product_vibes')
        .select('product_id')
        .eq('vibe_id', vibe.id)
        .eq('strength', 'primary')

      const productIds = (pvRows ?? []).map(r => r.product_id)
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('*, brand:brands(name, slug)')
          .in('id', productIds)
          .eq('is_active', true)
          .not('lowest_price', 'is', null)
          .order('retailers_count', { ascending: false })
          .limit(48)
        return (products ?? []) as Product[]
      }
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: keyword-based search against denormalized column
  const { data: products } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug)')
    .eq('is_active', true)
    .eq('primary_vibe_slug', slug)
    .not('lowest_price', 'is', null)
    .order('retailers_count', { ascending: false })
    .limit(48)

  return (products ?? []) as Product[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = VIBE_META[params.slug]
  if (!meta) return { title: 'Vibe Not Found' }
  return {
    title: `${meta.emoji} ${meta.name} Fragrances — MENA Perfumes`,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: `${meta.name} MENA Fragrances | RareTrace`,
      description: meta.description,
    },
  }
}

export default async function VibePage({ params }: Props) {
  const meta = VIBE_META[params.slug]
  if (!meta) notFound()

  const products = await getVibeProducts(params.slug)

  // All other vibes for the sidebar
  const otherVibes = Object.entries(VIBE_META)
    .filter(([slug]) => slug !== params.slug)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-obsidian-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-obsidian-600">Home</Link>
        <span>/</span>
        <span className="text-obsidian-700">Vibes</span>
        <span>/</span>
        <span className="text-obsidian-700">{meta.name}</span>
      </nav>

      <div className="flex gap-10">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Hero header */}
          <div className="bg-obsidian-900 text-cream p-8 mb-8">
            <span className="text-5xl block mb-4">{meta.emoji}</span>
            <p className="text-xs tracking-widest2 uppercase text-obsidian-500 mb-2">Vibe</p>
            <h1 className="font-serif text-4xl font-light mb-3">{meta.name}</h1>
            <p className="text-obsidian-400 leading-relaxed max-w-md text-sm">{meta.description}</p>
            {products.length > 0 && (
              <p className="text-xs text-obsidian-500 mt-4">{products.length} fragrances</p>
            )}
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 border border-obsidian-100 bg-white">
              <p className="font-serif text-2xl text-obsidian-400 font-light mb-3">No fragrances tagged yet</p>
              <p className="text-sm text-obsidian-400 mb-4">
                Run <code className="bg-obsidian-50 px-2 py-0.5 text-xs">node scripts/backfill-vibes.js</code> to tag your catalog.
              </p>
              <Link href="/search" className="text-xs tracking-widest uppercase border border-obsidian-300 text-obsidian-600 px-6 py-3 hover:border-gold-400 hover:text-obsidian-900 transition-colors inline-block">
                Browse all fragrances
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar: Other vibes */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-4">
            <p className="text-xs tracking-widest2 uppercase text-obsidian-400 mb-4">Other Vibes</p>
            <div className="space-y-2">
              {otherVibes.map(([slug, v]) => (
                <Link
                  key={slug}
                  href={`/vibe/${slug}`}
                  className="flex items-center gap-3 px-3 py-2.5 border border-obsidian-100 hover:border-gold-300 bg-white transition-colors text-sm"
                >
                  <span>{v.emoji}</span>
                  <span className="text-xs text-obsidian-600">{v.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
