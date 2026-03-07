/**
 * Emper scraper
 * Store: https://emperperfumes.com (Shopify, USD)
 * UAE accessible fragrance brand
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'emper',
  baseUrl: 'https://emperperfumes.com',
  currency: 'USD',
  defaultBrand: 'Emper',
}

async function scrapeEmper() {
  console.log('▶ Emper scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Emper: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeEmper }
