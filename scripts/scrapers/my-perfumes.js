/**
 * My Perfumes scraper
 * Store: https://myperfumes.ae (Shopify, AED)
 * UAE digital-first fragrance brand
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'my-perfumes',
  baseUrl: 'https://myperfumes.ae',
  currency: 'AED',
  defaultBrand: 'My Perfumes',
}

async function scrapeMyPerfumes() {
  console.log('▶ My Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ My Perfumes: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeMyPerfumes }
