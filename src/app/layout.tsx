import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'

const SITE_URL = 'https://raretrace.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RareTrace — Find Fragrances Mainstream Sites Don\'t Track',
    template: '%s | RareTrace',
  },
  description: 'Discover and compare niche fragrances from 50+ countries. Artisan, indie, and regional houses tracked daily across every retailer.',
  keywords: ['niche fragrance', 'oud', 'attar', 'Arabian perfume', 'price comparison', 'Gissah', 'Amouage', 'Swiss Arabian'],
  authors: [{ name: 'RareTrace' }],
  creator: 'RareTrace',
  openGraph: {
    type: 'website',
    siteName: 'RareTrace',
    url: SITE_URL,
    title: 'RareTrace — Find Fragrances Mainstream Sites Don\'t Track',
    description: 'Discover niche fragrances from 50+ countries. Artisan and regional houses that mainstream sites ignore.',
    images: [{
      url: `${SITE_URL}/og-default.jpg`,
      width: 1200,
      height: 630,
      alt: 'RareTrace — Niche Fragrance Discovery',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RareTrace — Niche Fragrance Discovery',
    description: 'Find fragrances mainstream sites don\'t track.',
    images: [`${SITE_URL}/og-default.jpg`],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
  alternates: { canonical: SITE_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className="font-sans bg-cream text-obsidian-900 antialiased">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-obsidian-950 text-obsidian-400 border-t border-obsidian-900">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-2">
                <p className="font-serif text-2xl text-cream tracking-widest mb-1">RARETRACE</p>
                <p className="text-xs tracking-widest uppercase text-obsidian-600 mb-4">Niche Fragrance Discovery</p>
                <p className="text-sm leading-relaxed max-w-xs text-obsidian-500">
                  Artisan, indie, and regional fragrance houses from 50+ countries — tracked daily so you always find the best price.
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-obsidian-600 mb-5">Discover</p>
                <ul className="space-y-3 text-sm">
                  {[
                    ['/vibes', 'Browse by Vibe'],
                    ['/countries', 'By Country'],
                    ['/brands', 'All Brands'],
                    ['/search', 'All Fragrances'],
                    ['/note/oud', 'Oud Fragrances'],
                  ].map(([href, label]) => (
                    <li key={href}><a href={href} className="hover:text-cream transition-colors">{label}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-obsidian-600 mb-5">Company</p>
                <ul className="space-y-3 text-sm">
                  {[
                    ['/about', 'About RareTrace'],
                    ['/affiliate-disclosure', 'Affiliate Disclosure'],
                    ['/privacy', 'Privacy Policy'],
                    ['/terms', 'Terms of Service'],
                  ].map(([href, label]) => (
                    <li key={href}><a href={href} className="hover:text-cream transition-colors">{label}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-obsidian-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-obsidian-700">
                &copy; {new Date().getFullYear()} RareTrace. All rights reserved.
              </p>
              <p className="text-xs text-obsidian-700 text-center max-w-sm">
                We earn commissions on purchases made through our links.{' '}
                <a href="/affiliate-disclosure" className="underline hover:text-obsidian-500 transition-colors">Learn more</a>
              </p>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
