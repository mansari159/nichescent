/**
 * Orientica scraper
 * Store: https://www.orienticaperfumes.com (Shopify, USD)
 * UAE modern oriental house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'orientica',
  baseUrl: 'https://www.orienticaperfumes.com',
  currency: 'USD',
  defaultBrand: 'Orientica',
}

async function scrapeOrientica() {
  console.log('▶ Orientica scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Orientica: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeOrientica }
