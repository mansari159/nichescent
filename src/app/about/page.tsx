import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About RareTrace',
  description: 'RareTrace is a dedicated price comparison engine for niche MENA fragrances. Learn about our mission to make rare scents accessible.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-sm text-obsidian-400 mb-10 flex items-center gap-2">
        <Link href="/" className="hover:text-obsidian-600">Home</Link>
        <span>/</span>
        <span className="text-obsidian-700">About</span>
      </nav>

      <p className="text-xs tracking-widest uppercase text-obsidian-400 mb-3">Our story</p>
      <h1 className="font-serif text-5xl font-light text-obsidian-900 mb-8 leading-tight">
        About RareTrace
      </h1>

      <div className="prose prose-stone max-w-none space-y-6 text-obsidian-600 text-[15px] leading-relaxed">
        <p>
          RareTrace was built for fragrance enthusiasts who know that the best scents rarely come from mainstream counters.
          MENA fragrance houses — Lattafa, Ajmal, Arabian Oud, Rasasi, Amouage, and dozens of others — produce some of
          the world&apos;s most celebrated and distinctive fragrances, yet they are scattered across a maze of regional
          retailers with prices that vary dramatically.
        </p>

        <p>
          We built RareTrace to solve that. Every day, our scrapers visit 9 retailer stores, collect current pricing,
          and match products across stores so you always know who has the best deal. No sign-ups. No ads. Just prices.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">What we cover</h2>
        <p>
          We currently track fragrances from 9 MENA-origin retailers including Lattafa USA, Afnan, Swiss Arabian,
          Al Haramain, Rasasi, Ajmal, Gissah, Assaf, and Dukhni. We are adding more retailers regularly.
          If you would like to suggest a retailer, reach out to us.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">How prices are updated</h2>
        <p>
          Prices are scraped directly from each retailer&apos;s live store and converted to USD for easy comparison.
          All prices shown are in USD unless the &ldquo;Local&rdquo; toggle is used on a product page.
          Prices may fluctuate and we recommend clicking through to confirm the final price before purchasing.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Contact</h2>
        <p>
          For any questions or to suggest a retailer or fragrance house, please reach out at{' '}
          <a href="mailto:hello@raretrace.com" className="text-gold-600 hover:text-gold-700 underline">
            hello@raretrace.com
          </a>.
        </p>
      </div>
    </div>
  )
}
