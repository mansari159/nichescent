import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'RareTrace — Niche Fragrance Price Comparison',
    template: '%s | RareTrace',
  },
  description: 'Compare prices for MENA fragrances across 9 retailers. Find the best deals on Gissah, Assaf, Swiss Arabian, Rasasi, Ajmal, and hundreds more.',
  keywords: ['MENA fragrance', 'niche perfume', 'oud price comparison', 'Gissah', 'Assaf', 'Swiss Arabian', 'Rasasi', 'attar', 'Arabian Oud', 'Amouage', 'Reef', 'Lattafa'],
  metadataBase: new URL('https://raretrace.vercel.app'),
  alternates: {
    canonical: 'https://raretrace.vercel.app',
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'RareTrace',
    title: 'RareTrace — Niche Fragrance Price Comparison',
    description: 'Compare prices for MENA fragrances across 9 retailers. Find the best deals on rare Arabian Oud, Attars, Bakhoor and more.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'RareTrace — MENA Fragrance Price Comparison',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RareTrace — Niche Fragrance Price Comparison',
    description: 'Find the best prices on MENA fragrances across 9 retailers.',
    images: ['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&h=630&q=80'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans bg-cream">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-obsidian-900 text-obsidian-300 mt-24">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-2">
                <p className="font-serif text-2xl text-cream tracking-widest2 mb-4">RARETRACE</p>
                <p className="text-sm leading-relaxed max-w-xs text-obsidian-400">
                  The dedicated price comparison engine for MENA fragrances. Gissah, Assaf, Swiss Arabian, Rasasi, and more — compared daily across 9 retailers.
                </p>
              </div>
              <div>
                <p className="text-xs tracking-widest2 uppercase text-obsidian-500 mb-5">Explore</p>
                <ul className="space-y-3 text-sm">
                  <li><a href="/category/ouds" className="hover:text-cream transition-colors">Ouds &amp; Oud Blends</a></li>
                  <li><a href="/category/attars" className="hover:text-cream transition-colors">Attars &amp; Oils</a></li>
                  <li><a href="/countries" className="hover:text-cream transition-colors">Origins</a></li>
                  <li><a href="/notes" className="hover:text-cream transition-colors">Browse by Note</a></li>
                  <li><a href="/brands" className="hover:text-cream transition-colors">All Brands</a></li>
                  <li><a href="/search" className="hover:text-cream transition-colors">All Fragrances</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs tracking-widest2 uppercase text-obsidian-500 mb-5">Company</p>
                <ul className="space-y-3 text-sm">
                  <li><a href="/about" className="hover:text-cream transition-colors">About</a></li>
                  <li><a href="/affiliate-disclosure" className="hover:text-cream transition-colors">Affiliate Disclosure</a></li>
                  <li><a href="/privacy" className="hover:text-cream transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-cream transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-obsidian-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-obsidian-500">
                &copy; {new Date().getFullYear()} RareTrace. All rights reserved.
              </p>
              <p className="text-xs text-obsidian-600 text-center">
                We earn commissions on purchases made through our links. Prices updated daily and may vary.{' '}
                <a href="/affiliate-disclosure" className="underline hover:text-obsidian-400 transition-colors">Learn more</a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
