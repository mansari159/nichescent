/**
 * Zimaya scraper
 * Store: https://zimayaperfumes.com (Shopify, USD)
 * UAE house under Ard Al Zaafaran group
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'zimaya',
  baseUrl: 'https://zimayaperfumes.com',
  currency: 'USD',
  defaultBrand: 'Zimaya',
}

async function scrapeZimaya() {
  console.log('▶ Zimaya scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Zimaya: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeZimaya }
