import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'RareTrace affiliate disclosure — how we earn commissions and how it affects our recommendations.',
}

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-sm text-obsidian-400 mb-10 flex items-center gap-2">
        <Link href="/" className="hover:text-obsidian-600">Home</Link>
        <span>/</span>
        <span className="text-obsidian-700">Affiliate Disclosure</span>
      </nav>

      <p className="text-xs tracking-widest uppercase text-obsidian-400 mb-3">Transparency</p>
      <h1 className="font-serif text-5xl font-light text-obsidian-900 mb-8 leading-tight">
        Affiliate Disclosure
      </h1>

      <div className="space-y-6 text-obsidian-600 text-[15px] leading-relaxed">
        <p>
          RareTrace participates in affiliate marketing programs. This means that when you click a &ldquo;Buy Now&rdquo;
          link on our site and make a purchase, we may earn a small commission from the retailer at no additional cost to you.
        </p>

        <p>
          These commissions help us keep RareTrace free, maintain our daily price scraping infrastructure,
          and continue expanding the catalog of fragrances and retailers we cover.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Our commitment</h2>
        <p>
          Affiliate relationships do not influence the prices we display or the order in which retailers appear.
          We always sort by price — lowest first — so you see the best deal regardless of which retailer
          it comes from. We do not receive payment to feature specific retailers or to adjust pricing data.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Price accuracy</h2>
        <p>
          Prices displayed on RareTrace are collected automatically from each retailer&apos;s website.
          While we update prices daily, they may change between our last update and your visit.
          Always verify the final price on the retailer&apos;s checkout page before purchasing.
        </p>

        <p className="text-sm text-obsidian-400 mt-10 border-t border-obsidian-100 pt-6">
          Last updated: March 2026
        </p>
      </div>
    </div>
  )
}
