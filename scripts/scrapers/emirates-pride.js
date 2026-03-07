/**
 * Emirates Pride scraper
 * Store: https://emiratespride.com (Shopify, AED)
 * UAE artisan fragrance house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'emirates-pride',
  baseUrl: 'https://emiratespride.com',
  currency: 'AED',
  defaultBrand: 'Emirates Pride',
}

async function scrapeEmiratesPride() {
  console.log('▶ Emirates Pride scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Emirates Pride: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeEmiratesPride }
