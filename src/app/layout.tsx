import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import AnimatePresenceWrapper from '@/components/AnimatePresenceWrapper'

const SITE_URL = 'https://raretrace.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RareTrace — Niche Fragrance Discovery',
    template: '%s | RareTrace',
  },
  description: 'Discover niche, indie, and Middle Eastern fragrances from 50+ countries. Houses mainstream sites ignore, ranked by community and editorial score.',
  keywords: ['niche fragrance', 'oud', 'attar', 'Arabian perfume', 'indie perfume', 'fragrance discovery', 'Creed', 'Amouage', 'Lattafa', 'clone fragrance'],
  authors: [{ name: 'RareTrace' }],
  creator: 'RareTrace',
  openGraph: {
    type: 'website',
    siteName: 'RareTrace',
    url: SITE_URL,
    title: 'RareTrace — Niche Fragrance Discovery',
    description: 'Discover niche fragrances from 50+ countries. Artisan and regional houses that mainstream sites ignore.',
    images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'RareTrace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RareTrace — Niche Fragrance Discovery',
    description: "Find fragrances mainstream sites don't track.",
    images: [`${SITE_URL}/og-default.jpg`],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
  alternates: { canonical: SITE_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased" style={{ backgroundColor: '#141008', color: '#e0d0b8' }}>
        <Navbar />
        <main className="min-h-screen">
          <AnimatePresenceWrapper>
            {children}
          </AnimatePresenceWrapper>
        </main>

        {/* Footer */}
        <footer style={{ backgroundColor: '#141008', borderTop: '1px solid #3a2a1a' }}>
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-2">
                <p className="font-display text-2xl tracking-widest mb-1" style={{ color: '#f2e8d8' }}>
                  RARETRACE
                </p>
                <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-4" style={{ color: '#8a7060' }}>
                  Niche Fragrance Discovery
                </p>
                <p className="font-body text-sm leading-relaxed max-w-xs" style={{ color: '#8a7060' }}>
                  Artisan, indie, and regional fragrance houses from 50+ countries.
                  Ranked by community score and editorial judgment.
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-widest uppercase mb-5" style={{ color: '#8a7060' }}>Discover</p>
                <ul className="space-y-3">
                  {[
                    ['/discover',  'Discover Feed'],
                    ['/houses',    'Houses'],
                    ['/origins',   'Origins'],
                    ['/clones',    'Clone Finder'],
                    ['/search',    'Search'],
                    ['/note/oud',  'Oud Fragrances'],
                  ].map(([href, label]) => (
                    <li key={href}>
                      <a href={href} className="font-mono text-[10px] tracking-wide transition-colors duration-200"
                        style={{ color: '#8a7060' }}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-widest uppercase mb-5" style={{ color: '#8a7060' }}>Company</p>
                <ul className="space-y-3">
                  {[
                    ['/about',                'About RareTrace'],
                    ['/affiliate-disclosure', 'Affiliate Disclosure'],
                    ['/privacy',              'Privacy Policy'],
                    ['/terms',                'Terms of Service'],
                  ].map(([href, label]) => (
                    <li key={href}>
                      <a href={href} className="font-mono text-[10px] tracking-wide transition-colors duration-200"
                        style={{ color: '#8a7060' }}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ borderTop: '1px solid #3a2a1a' }}>
              <p className="font-mono text-[9px]" style={{ color: '#3a2e22' }}>
                &copy; {new Date().getFullYear()} RareTrace. All rights reserved.
              </p>
              <p className="font-mono text-[9px]" style={{ color: '#3a2e22' }}>
                We may earn commissions from affiliate links.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
