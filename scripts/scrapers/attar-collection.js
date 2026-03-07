/**
 * Attar Collection scraper
 * Store: https://attarcollection.com (Shopify, USD)
 * UAE luxury attar house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'attar-collection',
  baseUrl: 'https://attarcollection.com',
  currency: 'USD',
  defaultBrand: 'Attar Collection',
}

async function scrapeAttarCollection() {
  console.log('▶ Attar Collection scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Attar Collection: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAttarCollection }
