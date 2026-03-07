/**
 * Riiffs scraper
 * Store: https://www.riiffsperfumes.com (Shopify, USD)
 * UAE accessible oriental house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'riiffs',
  baseUrl: 'https://www.riiffsperfumes.com',
  currency: 'USD',
  defaultBrand: 'Riiffs',
}

async function scrapeRiiffs() {
  console.log('▶ Riiffs scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Riiffs: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeRiiffs }
