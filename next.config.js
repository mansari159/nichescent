/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '**.myshopify.com' },
      { protocol: 'https', hostname: '**.arabianoud.com' },
      { protocol: 'https', hostname: '**.ajmal.com' },
      { protocol: 'https', hostname: '**.lattafa-usa.com' },
    ],
  },
}

module.exports = nextConfig
