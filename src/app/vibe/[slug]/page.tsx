import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdUnit from '@/components/AdUnit'
import InfiniteScrollLoader from '@/components/InfiniteScrollLoader'
import type { Product } from '@/types'
import { VIBE_MAP } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

const VIBE_DESCRIPTIONS: Record<string, { long: string; ingredients: string[]; bestFor: string }> = {
  'warm-spicy': {
    long: 'Warm & Spicy fragrances are the olfactory language of the ancient Silk Road. Saffron harvested from the mountains of Kashmir, cardamom seeds from the spice markets of Kerala, cinnamon bark from Sri Lanka — these are the raw materials that define this category. Rich amber resins and golden musk anchor the composition, while top notes of pepper and clove add vitality. These fragrances envelop like a cashmere shawl on a cold evening, projecting warmth and confidence wherever you go.',
    ingredients: ['Saffron', 'Cardamom', 'Cinnamon', 'Amber', 'Black Pepper', 'Clove', 'Ginger'],
    bestFor: 'Evening wear, cooler weather, formal occasions',
  },
  'woody-earthy': {
    long: 'Woody & Earthy fragrances root you in the natural world — the ancient forests, the peat-rich soils of the Scottish Highlands, the cedar mountains of Lebanon. Oud is the crown jewel of this family: the deeply complex, resinous heartwood of the Aquilaria tree, used in perfumery for over a thousand years. Sandalwood from Mysore, vetiver from Haiti, and cedarwood from Texas create the structural backbone. These are grounding fragrances for those who seek depth and authenticity.',
    ingredients: ['Oud', 'Sandalwood', 'Vetiver', 'Cedar', 'Patchouli', 'Oakmoss', 'Labdanum'],
    bestFor: 'Everyday wear, cooler seasons, introspective moods',
  },
  'floral-romantic': {
    long: 'Floral & Romantic fragrances celebrate the extraordinary artistry locked within flower petals. Taifi rose — considered the finest in the world, harvested in a single season each year from the mountains near Taif, Saudi Arabia — is the undisputed queen of this category. Turkish rose otto, Grasse jasmine absolute, neroli from Tunisia, and orange blossom from Morocco each bring their own irreplaceable beauty. These are fragrances of intimacy, celebration, and extraordinary femininity — worn for first dates, weddings, and quiet moments of joy.',
    ingredients: ['Rose', 'Jasmine', 'Neroli', 'Ylang-Ylang', 'Iris', 'Peony', 'Orange Blossom'],
    bestFor: 'Daytime wear, spring and summer, romantic occasions',
  },
  'smoky-intense': {
    long: 'Smoky & Intense fragrances are for those who refuse to go unnoticed. Drawing from leather workshops in Grasse, tobacco fields in Cuba, incense temples across Asia, and the smoldering embers of Arabian bakhoor — this category pushes fragrance into bold, provocative territory. Birch tar, castoreum, and labdanum create the archetypal leather accord, while tobacco absolute and oud contribute earthy darkness. These fragrances project authority and mystery in equal measure.',
    ingredients: ['Leather', 'Tobacco', 'Incense', 'Oud', 'Smoke', 'Birch Tar', 'Labdanum'],
    bestFor: 'Evening wear, cooler climates, statement dressing',
  },
  'sweet-gourmand': {
    long: 'Sweet & Gourmand fragrances evoke the pleasure of the finest patisseries and confectioneries — but elevated to an art form. Natural vanilla from Madagascar, toffee-like tonka bean from Venezuela, the lactonic warmth of benzoin, and the caramel softness of ambergris create compositions that feel simultaneously luxurious and comforting. This is a category born from the intersection of food and fragrance, pioneered by perfumers who saw no boundary between the two.',
    ingredients: ['Vanilla', 'Tonka Bean', 'Caramel', 'Honey', 'Benzoin', 'Praline', 'Musk'],
    bestFor: 'Autumn and winter wear, cozy occasions, intimate settings',
  },
  'fresh-clean': {
    long: 'Fresh & Clean fragrances capture the purest sensations of nature — the crisp air after rainfall, the salt-tinged breeze of the Mediterranean, the green vitality of bergamot groves in Calabria. Aquatic accords, ozonic notes, and light musks create compositions that feel immediately wearable, transparent, and eternally elegant. Citrus top notes — lemon, bergamot, grapefruit, yuzu — provide instant brightness that evolves into gentle florals or soft woods. These fragrances are the universal language of approachability.',
    ingredients: ['Bergamot', 'Lemon', 'Aquatic', 'Iris', 'White Musk', 'Vetiver', 'Green Tea'],
    bestFor: 'Daytime wear, warm weather, office and everyday use',
  },
}

async function getVibeProducts(slug: string): Promise<{ products: Product[]; total: number }> {
  const { data, count } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug, country)', { count: 'exact' })
    .eq('primary_vibe_slug', slug)
    .eq('is_active', true)
    .not('lowest_price', 'is', null)
    .order('created_at', { ascending: false })
    .range(0, 23)
  return { products: (data ?? []) as Product[], total: count ?? 0 }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vibe = VIBE_MAP[params.slug]
  if (!vibe) return { title: 'Vibe Not Found' }
  const desc = VIBE_DESCRIPTIONS[params.slug]
  return {
    title: `${vibe.name} Fragrances — Discover ${vibe.name} Niche Perfumes`,
    description: desc?.long.slice(0, 160) ?? `Explore the best ${vibe.name} niche fragrances from houses worldwide.`,
  }
}

export default async function VibePage({ params }: Props) {
  const slug = params.slug
  const vibe = VIBE_MAP[slug]
  if (!vibe) notFound()

  const { products, total } = await getVibeProducts(slug)
  const desc = VIBE_DESCRIPTIONS[slug]

  const otherVibes = Object.entries(VIBE_MAP)
    .filter(([s]) => s !== slug)
    .slice(0, 3)
    .map(([s, v]) => ({ slug: s, ...v }))

  return (
    <div className="bg-cream">

      {/* ── Animated Gradient Hero ───────────────────────────────────────── */}
      <section
        className="relative min-h-[70vh] flex items-end overflow-hidden pt-16"
        style={{ background: vibe.css }}
      >
        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 animate-gradient opacity-40"
          style={{ background: `linear-gradient(135deg, ${vibe.colors[0]}, ${vibe.colors[1]}, ${vibe.colors[2]}, ${vibe.colors[0]})` }}
        />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative max-w-7xl mx-auto px-6 pb-20 w-full">
          {/* Gradient swatch */}
          <div
            className="w-12 h-12 rounded-full mb-6 ring-4 ring-white/20"
            style={{ background: `linear-gradient(135deg, ${vibe.colors[0]}, ${vibe.colors[2]})` }}
          />
          <h1
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light leading-tight mb-4"
            style={{ color: vibe.textColor }}
          >
            {vibe.name}
          </h1>
          <p className="text-base opacity-80 max-w-lg mb-6" style={{ color: vibe.textColor }}>
            {total.toLocaleString()} {total === 1 ? 'fragrance' : 'fragrances'} in this family
          </p>
          {desc && (
            <div className="flex flex-wrap gap-2">
              {desc.ingredients.slice(0, 5).map(ing => (
                <span
                  key={ing}
                  className="text-[10px] tracking-widest uppercase px-3 py-1.5 border border-white/30 bg-white/10"
                  style={{ color: vibe.textColor }}
                >
                  {ing}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Scent Character ──────────────────────────────────────────────── */}
      {desc && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
              <div>
                <p className="label-overline text-obsidian-400 mb-3">Scent Character</p>
                <h2 className="font-serif text-4xl text-obsidian-900 font-light mb-6">
                  The World of<br />{vibe.name}
                </h2>

                {/* Gradient bar */}
                <div className="mb-6">
                  <div className="h-2 w-full mb-2" style={{ background: vibe.css }} />
                  <p className="text-xs text-obsidian-400 tracking-widest uppercase">{vibe.name} Spectrum</p>
                </div>

                {/* Best for */}
                <div className="p-4 border border-obsidian-100">
                  <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">Best For</p>
                  <p className="text-sm text-obsidian-600">{desc.bestFor}</p>
                </div>
              </div>
              <div>
                <p className="text-base text-obsidian-600 leading-[1.9]">{desc.long}</p>

                {/* All ingredients */}
                <div className="mt-8">
                  <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-3">Key Ingredients</p>
                  <div className="flex flex-wrap gap-2">
                    {desc.ingredients.map(ing => (
                      <Link
                        key={ing}
                        href={`/note/${ing.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-xs text-obsidian-600 border border-obsidian-200 hover:border-gold-400 hover:text-gold-700 px-3 py-1.5 transition-colors"
                      >
                        {ing}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Fragrance Grid ───────────────────────────────────────────────── */}
      <section className="bg-parchment py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="label-overline text-obsidian-400 mb-2">{vibe.name}</p>
              <h2 className="font-serif text-4xl text-obsidian-900 font-light">
                {vibe.name} Fragrances
              </h2>
            </div>
            <p className="text-sm text-obsidian-400 hidden sm:block">{total.toLocaleString()} total</p>
          </div>

          <AdUnit position="before_scroll" className="mb-8" />

          {products.length === 0 ? (
            <div className="text-center py-20 border border-obsidian-100 bg-white">
              <p className="font-serif text-2xl text-obsidian-400 font-light mb-3">
                No {vibe.name} fragrances yet
              </p>
              <p className="text-sm text-obsidian-400">We&apos;re categorizing fragrances by vibe. Check back soon.</p>
            </div>
          ) : (
            <InfiniteScrollLoader
              initialProducts={products}
              totalCount={total}
              fetchUrl="/api/products"
              extraParams={{ vibe: slug }}
              context={`${vibe.name} fragrances`}
              category="fragrances"
            />
          )}
        </div>
      </section>

      {/* ── Other Vibes ──────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="label-overline text-obsidian-400 mb-6">Explore other vibes</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {otherVibes.map(v => (
              <Link
                key={v.slug}
                href={`/vibe/${v.slug}`}
                className="group relative overflow-hidden border border-obsidian-100 hover:border-transparent transition-all duration-300 h-24 flex items-center px-6"
                style={{ '--hover-bg': v.css } as React.CSSProperties}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: v.css }} />
                <div
                  className="relative w-4 h-4 rounded-full mr-4 shrink-0"
                  style={{ background: `linear-gradient(135deg, ${v.colors[0]}, ${v.colors[2]})` }}
                />
                <span className="relative font-serif text-lg text-obsidian-900 group-hover:text-white transition-colors">
                  {v.name}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/vibes" className="text-[11px] tracking-widest uppercase text-gold-500 hover:text-gold-600 transition-colors">
              All Vibes →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
