/**
 * Khalis Perfumes scraper
 * Store: https://www.khalisperfumes.com (Shopify, USD)
 * UAE budget-premium oriental house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'khalis-perfumes',
  baseUrl: 'https://www.khalisperfumes.com',
  currency: 'USD',
  defaultBrand: 'Khalis Perfumes',
}

async function scrapeKhalis() {
  console.log('▶ Khalis Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Khalis Perfumes: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeKhalis }
