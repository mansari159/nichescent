/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '**.myshopify.com' },
      { protocol: 'https', hostname: '**.arabianoud.com' },
      { protocol: 'https', hostname: '**.ajmal.com' },
      { protocol: 'https', hostname: '**.lattafa-usa.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // New brand scrapers (Phase 1 additions)
      { protocol: 'https', hostname: 'usaibrahimalqurashi.com' },
      { protocol: 'https', hostname: '**.usaibrahimalqurashi.com' },
      { protocol: 'https', hostname: 'emaratiscents.com' },
      { protocol: 'https', hostname: '**.emaratiscents.com' },
      { protocol: 'https', hostname: 'arabiascents.com' },
      { protocol: 'https', hostname: '**.arabiascents.com' },
      { protocol: 'https', hostname: 'kayaliofficial.com' },
      { protocol: 'https', hostname: '**.kayaliofficial.com' },
    ],
  },
}

module.exports = nextConfig
