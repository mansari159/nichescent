import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import EmailCapture from '@/components/EmailCapture'

export const metadata: Metadata = {
  title: 'About RareTrace — Why We Built This',
  description: 'RareTrace tracks niche and artisan fragrances from 50+ countries that mainstream sites ignore. Our mission, how it works, and where we\'re going.',
}

const HOW_IT_WORKS = [
  {
    n: '01',
    heading: 'We find the brands',
    body: 'Our team and community continuously identifies artisan, indie, and regional fragrance houses — from Gulf heritage brands to French indie perfumers — that mainstream comparison sites never cover.',
  },
  {
    n: '02',
    heading: 'We track the prices',
    body: 'Each retailer is scraped daily. We normalize prices to USD, track availability, and surface the lowest price available for each fragrance across all sources.',
  },
  {
    n: '03',
    heading: 'We enrich the data',
    body: 'Notes, vibe categorization, heritage descriptions, brand storytelling — we invest deeply in making each fragrance and brand page genuinely useful, not just a price table.',
  },
  {
    n: '04',
    heading: 'You discover and save',
    body: 'Browse by vibe, origin, or note. Compare prices across stores. Purchase through our affiliate links — at no extra cost to you — which is how we keep the site free.',
  },
]

const ROADMAP = [
  { status: 'live', label: 'Price comparison across 9 retailers' },
  { status: 'live', label: '2,000+ niche fragrances' },
  { status: 'live', label: 'Browse by vibe, country, note' },
  { status: 'coming', label: 'User reviews and ratings' },
  { status: 'coming', label: 'Fragrance wardrobe / collection tracking' },
  { status: 'coming', label: 'Price drop alerts' },
  { status: 'coming', label: 'Sample discovery sets' },
  { status: 'coming', label: 'iOS & Android app' },
]

export default async function AboutPage() {
  const [{ count: fragCount }, { count: brandCount }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('brands').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="pt-16 bg-cream min-h-screen">

      {/* ── Mission Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-obsidian-950 py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1583753771919-ad6c2c7e21ee?w=1920&q=60)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-obsidian-950" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <p className="text-[10px] tracking-widest uppercase text-obsidian-500 mb-6">Our Mission</p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-cream leading-tight mb-8">
            The fragrance world<br />is bigger than<br />
            <span className="text-gold-400">what you&apos;ve been shown.</span>
          </h1>
          <p className="text-obsidian-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Thousands of extraordinary fragrance houses — from the oud workshops of Kuwait to the attar distilleries of Kannauj — are invisible to most fragrance lovers simply because no platform tracks them. RareTrace fixes that.
          </p>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="bg-obsidian-900 border-y border-obsidian-800">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: `${(fragCount ?? 0).toLocaleString()}+`, label: 'Fragrances Tracked' },
            { value: `${brandCount ?? 0}+`, label: 'Niche Brands' },
            { value: '50+', label: 'Countries' },
            { value: 'Daily', label: 'Price Updates' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="font-serif text-4xl text-cream mb-1">{stat.value}</p>
              <p className="text-[10px] tracking-widest uppercase text-obsidian-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── You're Early ──────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="label-overline text-obsidian-400 mb-3">Early Access</p>
            <h2 className="font-serif text-4xl text-obsidian-900 font-light mb-6">You&apos;re Early.</h2>
            <p className="text-base text-obsidian-600 leading-relaxed mb-6">
              RareTrace is a new platform. We&apos;re growing the catalog daily, improving discovery features, and building toward a comprehensive niche fragrance platform unlike anything that exists.
            </p>
            <p className="text-base text-obsidian-600 leading-relaxed">
              Being early means you help shape what this becomes. Tell us which brands are missing. Request features. Share the fragrances you can&apos;t find anywhere else.
            </p>
          </div>

          <div>
            <p className="label-overline text-obsidian-400 mb-4">Roadmap</p>
            <ul className="space-y-3">
              {ROADMAP.map(item => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    item.status === 'live' ? 'bg-green-500' : 'bg-obsidian-200'
                  }`} />
                  <span className={`text-sm ${item.status === 'live' ? 'text-obsidian-700' : 'text-obsidian-400'}`}>
                    {item.label}
                    {item.status === 'live' && (
                      <span className="ml-2 text-[9px] tracking-widest uppercase text-green-500">Live</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="bg-parchment py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="label-overline text-obsidian-400 mb-2">How it works</p>
          <h2 className="font-serif text-4xl text-obsidian-900 font-light mb-14">Four steps to discovery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(step => (
              <div key={step.n}>
                <p className="font-serif text-5xl text-obsidian-100 font-light mb-4">{step.n}</p>
                <h3 className="font-serif text-xl text-obsidian-900 font-light mb-3">{step.heading}</h3>
                <p className="text-sm text-obsidian-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="label-overline text-obsidian-400 mb-3">Get in touch</p>
            <h2 className="font-serif text-4xl text-obsidian-900 font-light mb-4">Contact</h2>
            <p className="text-base text-obsidian-600 leading-relaxed mb-6">
              Missing a brand? Found a pricing error? Want to suggest a feature? We read every message.
            </p>
            <a
              href="mailto:hello@raretrace.com"
              className="text-sm text-gold-500 hover:text-gold-600 transition-colors border-b border-gold-300 hover:border-gold-500 pb-0.5"
            >
              hello@raretrace.com
            </a>
          </div>
          <div>
            <p className="label-overline text-obsidian-400 mb-3">Stay updated</p>
            <h2 className="font-serif text-3xl text-obsidian-900 font-light mb-4">New fragrances weekly.</h2>
            <p className="text-sm text-obsidian-500 mb-6">50+ new brands added every week. Be first to know.</p>
            <EmailCapture source="about_page" placeholder="your@email.com" buttonText="Notify Me" />
          </div>
        </div>
      </section>
    </div>
  )
}
