import type { Metadata } from 'next'
import Link from 'next/link'
import { VIBE_MAP } from '@/lib/utils'
import LuminaSlider, { type SlideData } from '@/components/ui/LuminaSlider'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fragrance Vibes — Find Your Scent Character',
  description: 'Discover niche fragrances by scent vibe. Warm & Spicy, Woody & Earthy, Floral & Romantic — find your signature.',
}

// ─── Ingredient images ────────────────────────────────────────────────────────
// Macro / cinematic Unsplash photos of the dominant fragrance ingredient per vibe
const VIBE_IMAGES: Record<string, string> = {
  'warm-spicy':      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920&q=85&fit=crop', // saffron / spices
  'woody-earthy':    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85&fit=crop', // dark forest / cedar
  'floral-romantic': 'https://images.unsplash.com/photo-1490750967868-88df5691cc67?w=1920&q=85&fit=crop', // deep red roses
  'floral-delicate': 'https://images.unsplash.com/photo-1490750967868-88df5691cc67?w=1920&q=85&fit=crop', // soft pink florals
  'smoky-intense':   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85&fit=crop',   // dark oud / smoke
  'sweet-gourmand':  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1920&q=85&fit=crop', // vanilla / tonka
  'fresh-clean':     'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=85&fit=crop', // ocean spray / mint
}

// ─── Vibe descriptions and note lines ─────────────────────────────────────────
const VIBE_DETAIL: Record<string, { notes: string; description: string }> = {
  'warm-spicy': {
    notes: 'Saffron · Amber · Cardamom · Oud · Cinnamon',
    description: 'Enveloping and seductive. Warm & Spicy fragrances draw from ancient spice routes — saffron, amber, and oud layered into scents that feel like a cashmere embrace at dusk.',
  },
  'woody-earthy': {
    notes: 'Cedarwood · Vetiver · Patchouli · Sandalwood · Moss',
    description: 'Grounded and contemplative. These fragrances smell like the forest floor after rain — dark cedar, living vetiver, and earthy patchouli anchoring the spirit to something real.',
  },
  'floral-romantic': {
    notes: 'Rose · Jasmine · Peony · Ylang-Ylang · Iris',
    description: 'Rich and intoxicating florals with depth and drama. Rose absolute, jasmine sambac, and peony come together in fragrances that feel cinematic and unapologetically romantic.',
  },
  'floral-delicate': {
    notes: 'White Rose · Magnolia · Cherry Blossom · Lily · Muguet',
    description: 'Soft, translucent, quietly beautiful. Floral & Delicate fragrances are like morning light through sheer curtains — white flowers and green stems, barely there but unforgettable.',
  },
  'smoky-intense': {
    notes: 'Oud · Incense · Leather · Tobacco · Dark Amber',
    description: 'Commanding and theatrical. Smoky & Intense fragrances are not for the timid — dark oud, frankincense resin, and tobacco leaf create scents that leave a room changed.',
  },
  'sweet-gourmand': {
    notes: 'Vanilla · Tonka · Praline · Benzoin · Caramel',
    description: 'Comforting and deeply satisfying. Sweet & Gourmand fragrances smell like memory itself — warm vanilla pods, tonka bean, and beeswax wrapping you in something like nostalgia.',
  },
  'fresh-clean': {
    notes: 'Sea Salt · Citrus · Bergamot · Green Tea · Mint',
    description: 'Invigorating and honest. Fresh & Clean fragrances distill the feeling of cold water, ocean air, and sun-dried linen into a scent that feels like a deep breath on a clear morning.',
  },
}

// ─── How to Choose ────────────────────────────────────────────────────────────
const HOW_TO_CHOOSE = [
  {
    step: '01',
    heading: 'Think about mood, not occasion',
    body: "The best fragrance for you isn't about 'office' or 'date night' — it's about how you want to feel. Grounded? Enveloping? Uplifted? Start there.",
  },
  {
    step: '02',
    heading: 'Start with what already works',
    body: 'If you love the warmth of a candle, try Warm & Spicy. If you love being in forests, try Woody & Earthy. Your existing aesthetic instincts translate directly.',
  },
  {
    step: '03',
    heading: 'Layer and combine',
    body: 'The most sophisticated fragrance wardrobes mix vibes by time of day and season. A Fresh & Clean for mornings, Smoky & Intense for evenings.',
  },
  {
    step: '04',
    heading: 'Let the notes guide you',
    body: "Each vibe is built from specific raw ingredients. If you're already drawn to rose, amber, or oud — you already know your direction.",
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function VibesPage() {
  const vibes = Object.entries(VIBE_MAP).map(([slug, v]) => ({ slug, ...v }))

  // Build hero slides — ordered for visual variety (light → dark → light...)
  const SLIDE_ORDER = [
    'warm-spicy',
    'fresh-clean',
    'floral-romantic',
    'woody-earthy',
    'floral-delicate',
    'smoky-intense',
    'sweet-gourmand',
  ]

  const heroSlides: SlideData[] = SLIDE_ORDER
    .filter(slug => VIBE_MAP[slug])
    .map(slug => {
      const vibe   = VIBE_MAP[slug]
      const detail = VIBE_DETAIL[slug]
      return {
        title: vibe.name,
        subtitle: detail?.notes ?? '',
        description: detail?.description ?? `Discover fragrances in the ${vibe.name} family.`,
        image: VIBE_IMAGES[slug] ?? 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1920&q=85&fit=crop',
        href: `/vibe/${slug}`,
        ctaLabel: `Explore ${vibe.name} →`,
      }
    })

  return (
    <div className="pt-16 bg-cream min-h-screen">

      {/* ── Cinematic Slider Hero ──────────────────────────────────────────── */}
      <LuminaSlider
        slides={heroSlides}
        pageLabel="Scent Discovery"
      />

      {/* ── Section bridge ────────────────────────────────────────────────── */}
      <div className="bg-obsidian-950 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-obsidian-400 text-sm">
            Six distinct scent families — each with its own character, ingredients, and mood.
          </p>
        </div>
      </div>

      {/* ── Vibe cards grid ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">All vibes</p>
        <h2 className="font-serif text-4xl text-obsidian-900 font-light mb-12">
          Find Your Fragrance Vibe
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vibes.map(vibe => {
            const detail = VIBE_DETAIL[vibe.slug]
            return (
              <Link
                key={vibe.slug}
                href={`/vibe/${vibe.slug}`}
                className="group relative overflow-hidden flex flex-col justify-end"
                style={{ height: 320 }}
              >
                {/* Animated gradient background */}
                <div
                  className="absolute inset-0 animate-gradient"
                  style={{ background: vibe.css, backgroundSize: '300% 300%' }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />

                <div className="relative p-8">
                  <div
                    className="w-9 h-9 rounded-full mb-4 ring-2 ring-white/25"
                    style={{ background: `linear-gradient(135deg, ${vibe.colors[0]}, ${vibe.colors[2]})` }}
                  />
                  <h3
                    className="font-serif text-2xl font-light mb-1"
                    style={{ color: vibe.textColor }}
                  >
                    {vibe.name}
                  </h3>
                  {detail && (
                    <p
                      className="text-[10px] tracking-wider uppercase opacity-60 group-hover:opacity-90 transition-opacity line-clamp-1"
                      style={{ color: vibe.textColor }}
                    >
                      {detail.notes.split(' · ').slice(0, 3).join(' · ')}
                    </p>
                  )}
                  <p
                    className="text-[11px] tracking-widest uppercase mt-3 opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ color: vibe.textColor }}
                  >
                    Explore →
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── How to Choose ─────────────────────────────────────────────────── */}
      <section className="bg-parchment py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="label-overline text-obsidian-400 mb-2">Fragrance guidance</p>
          <h2 className="font-serif text-4xl text-obsidian-900 font-light mb-14">How to Choose Your Vibe</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {HOW_TO_CHOOSE.map(item => (
              <div key={item.step} className="flex gap-6">
                <span className="font-serif text-5xl text-obsidian-100 font-light shrink-0 leading-none">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-serif text-xl text-obsidian-900 font-light mb-2">{item.heading}</h3>
                  <p className="text-sm text-obsidian-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
