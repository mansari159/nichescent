import type { Metadata } from 'next'
import Link from 'next/link'
import { VIBE_MAP } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fragrance Vibes — Find Your Scent Character',
  description: 'Discover niche fragrances by scent vibe. Warm & Spicy, Woody & Earthy, Floral & Romantic — find your signature.',
}

const HOW_TO_CHOOSE = [
  {
    step: '01',
    heading: 'Think about mood, not occasion',
    body: 'The best fragrance for you isn\'t about "office" or "date night" — it\'s about how you want to feel. Grounded? Enveloping? Uplifted? Start there.',
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
    body: 'Each vibe is built from specific raw ingredients. If you\'re already drawn to rose, amber, or oud — you already know your direction.',
  },
]

export default function VibesPage() {
  const vibes = Object.entries(VIBE_MAP).map(([slug, v]) => ({ slug, ...v }))

  return (
    <div className="pt-16 bg-cream min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-obsidian-950 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] tracking-widest uppercase text-obsidian-500 mb-4">Scent Discovery</p>
          <h1 className="font-serif text-5xl sm:text-6xl font-light text-cream mb-4">
            Find Your<br />Fragrance Vibe
          </h1>
          <p className="text-obsidian-400 text-lg max-w-xl">
            Six distinct scent families — each with its own character, ingredients, and mood. Find the one that speaks to you.
          </p>
        </div>
      </section>

      {/* ── 6 Vibe Cards (2x3) ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vibes.map(vibe => (
            <Link
              key={vibe.slug}
              href={`/vibe/${vibe.slug}`}
              className="group relative overflow-hidden h-80 flex flex-col justify-end"
            >
              {/* Animated gradient background */}
              <div
                className="absolute inset-0 animate-gradient"
                style={{ background: vibe.css, backgroundSize: '300% 300%' }}
              />
              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />

              {/* Content */}
              <div className="relative p-8">
                {/* Swatch */}
                <div
                  className="w-10 h-10 rounded-full mb-4 ring-2 ring-white/30"
                  style={{ background: `linear-gradient(135deg, ${vibe.colors[0]}, ${vibe.colors[2]})` }}
                />
                <h2
                  className="font-serif text-3xl font-light mb-2"
                  style={{ color: vibe.textColor }}
                >
                  {vibe.name}
                </h2>
                <p
                  className="text-[11px] tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ color: vibe.textColor }}
                >
                  Explore →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How to Choose ────────────────────────────────────────────────── */}
      <section className="bg-parchment py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="label-overline text-obsidian-400 mb-2">Fragrance guidance</p>
          <h2 className="font-serif text-4xl text-obsidian-900 font-light mb-14">How to Choose Your Vibe</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {HOW_TO_CHOOSE.map(item => (
              <div key={item.step} className="flex gap-6">
                <span className="font-serif text-5xl text-obsidian-100 font-light shrink-0 leading-none">{item.step}</span>
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
