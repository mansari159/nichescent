import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'RareTrace privacy policy — how we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-sm text-obsidian-400 mb-10 flex items-center gap-2">
        <Link href="/" className="hover:text-obsidian-600">Home</Link>
        <span>/</span>
        <span className="text-obsidian-700">Privacy Policy</span>
      </nav>

      <p className="text-xs tracking-widest uppercase text-obsidian-400 mb-3">Legal</p>
      <h1 className="font-serif text-5xl font-light text-obsidian-900 mb-8 leading-tight">
        Privacy Policy
      </h1>

      <div className="space-y-6 text-obsidian-600 text-[15px] leading-relaxed">
        <p>
          RareTrace (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your privacy.
          This policy explains what information we collect and how we use it.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Information we collect</h2>
        <p>
          RareTrace does not require you to create an account or provide any personal information to use the site.
          We may collect anonymous usage data such as pages visited, search queries entered, and links clicked
          in order to improve the service. This data is not linked to any personally identifiable information.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Cookies</h2>
        <p>
          We use minimal cookies necessary for the site to function. We do not use tracking cookies or
          sell data to third parties. Clicking affiliate links may result in cookies being set by the
          retailer you visit — those are governed by the retailer&apos;s own privacy policy.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Third-party services</h2>
        <p>
          RareTrace is hosted on Vercel and uses Supabase for its database. Please refer to their respective
          privacy policies for information on how they handle data. We do not share your data with any
          advertising networks.
        </p>

        <h2 className="font-serif text-2xl font-light text-obsidian-900 mt-10 mb-4">Contact</h2>
        <p>
          For any privacy-related questions, please contact us at{' '}
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
