/**
 * Reef Perfumes scraper
 * Store: https://reefperfumes.com (Shopify, USD)
 * MENA heritage house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'reef-perfumes',
  baseUrl: 'https://reefperfumes.com',
  currency: 'USD',
  defaultBrand: 'Reef Perfumes',
}

async function scrapeReefPerfumes() {
  console.log('▶ Reef Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Reef Perfumes: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeReefPerfumes }
