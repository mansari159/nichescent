/**
 * Yas Perfumes scraper
 * Store: https://yasperfumes.com (Shopify, AED)
 * Abu Dhabi-based luxury house — inspired by UAE heritage.
 * Known for: Nakheel, Musk Sultan, Yas, Hessa collections
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'yas-perfumes',
  baseUrl: 'https://yasperfumes.com',
  currency: 'AED',
  defaultBrand: 'Yas Perfumes',
}

async function scrapeYasPerfumes() {
  console.log('▶ Yas Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Yas Perfumes: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeYasPerfumes }
