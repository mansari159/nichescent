/**
 * Rayhaan scraper
 * Store: https://rayhaanperfumes.com (Shopify, USD)
 * UAE fragrance house by Rasasi group
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'rayhaan',
  baseUrl: 'https://rayhaanperfumes.com',
  currency: 'USD',
  defaultBrand: 'Rayhaan',
}

async function scrapeRayhaan() {
  console.log('▶ Rayhaan scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Rayhaan: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeRayhaan }
