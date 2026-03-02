import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'RareTrace terms of service — the rules governing use of our fragrance price comparison platform.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-sm text-obsidian-400 mb-10 flex items-center gap-2">
        <Link href="/" className="hover:text-obsidian-600">Home</Link>
        <span>/</span>
        <span className="text-obsidian-700">Terms of Service</span>
      </nav>

      <p className="text-xs tracking-widest uppercase text-obsidian-400 mb-3">Legal</p>
      <h1 className="font-serif text-5xl font-light text-obsidian-900 mb-8 leading-tight">
        Terms of Service
      </h1>

      <div className="space-y-6 text-obsidian-600 text-[15px] leading-relaxed">
        <p>
          By using RareTrace, you agree to these terms. Please read them carefully.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Use of the service</h2>
        <p>
          RareTrace provides a price comparison service for informational purposes only. Prices displayed
          are sourced automatically from third-party retailers and may not always reflect the current
          price at the time of purchase. We make no guarantees regarding price accuracy or product availability.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Intellectual property</h2>
        <p>
          The RareTrace brand, design, and original content are our intellectual property. Product names,
          images, and descriptions belong to their respective brands and retailers. We use this information
          purely for price comparison purposes under fair use principles.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Limitation of liability</h2>
        <p>
          RareTrace is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any
          damages arising from your use of the service, including but not limited to losses arising from
          price discrepancies, product availability, or purchases made through affiliate links.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Changes to these terms</h2>
        <p>
          We may update these terms periodically. Continued use of RareTrace after changes constitutes
          acceptance of the new terms.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Contact</h2>
        <p>
          Questions about these terms? Email us at{' '}
          <a href="mailto:hello@raretrace.com" className="text-gold-600 hover:text-gold-700 underline">
            hello@raretrace.com
          </a>.
        </p>

        <p className="text-sm text-obsidian-400 mt-10 border-t border-obsidian-100 pt-6">
          Last updated: March 2026
        </p>
      </div>
    </div>
  )
}
