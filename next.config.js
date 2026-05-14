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
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'usaibrahimalqurashi.com' },
      { protocol: 'https', hostname: '**.usaibrahimalqurashi.com' },
    ],
  },

  async redirects() {
    return [
      { source: '/brands',          destination: '/houses',          permanent: true },
      { source: '/brand/:slug',     destination: '/house/:slug',     permanent: true },
      { source: '/countries',       destination: '/origins',         permanent: true },
      { source: '/country/:code',   destination: '/origin/:code',    permanent: true },
      { source: '/product/:slug',   destination: '/fragrance/:slug', permanent: true },
      { source: '/vibes',           destination: '/discover',        permanent: false },
      { source: '/vibe/:slug',      destination: '/discover',        permanent: false },
    ];
  },
}

module.exports = nextConfig
