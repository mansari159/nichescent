import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'NicheScent — Niche Fragrance Price Comparison',
    template: '%s | NicheScent',
  },
  description: 'Search and compare prices for niche MENA fragrances across 20+ retailers. Find the best deals on Arabian Oud, Lattafa, Ajmal, Amouage, and more.',
  keywords: ['niche fragrance', 'MENA perfume', 'oud price comparison', 'Arabian Oud', 'Lattafa', 'attar'],
  openGraph: {
    type: 'website',
    siteName: 'NicheScent',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-navy-900 text-gray-400 mt-16">
          <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="text-white font-semibold mb-3">NicheScent</p>
              <p className="text-xs leading-relaxed">
                The search engine for niche fragrances that mainstream sites ignore.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Browse</p>
              <ul className="space-y-1.5">
                <li><a href="/category/ouds" className="hover:text-white transition-colors">Ouds</a></li>
                <li><a href="/category/attars" className="hover:text-white transition-colors">Attars</a></li>
                <li><a href="/category/bakhoor" className="hover:text-white transition-colors">Bakhoor</a></li>
                <li><a href="/category/under-50" className="hover:text-white transition-colors">Under $50</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Company</p>
              <ul className="space-y-1.5">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/affiliate-disclosure" className="hover:text-white transition-colors">Affiliate Disclosure</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Legal</p>
              <p className="text-xs leading-relaxed">
                We earn commissions on purchases made through our links. Prices are updated daily but may vary.
              </p>
            </div>
          </div>
          <div className="border-t border-navy-700 py-4 text-center text-xs">
            © {new Date().getFullYear()} NicheScent. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  )
}
