/**
 * Kajal Perfumes scraper
 * Store: https://kajalperfumes.com (Shopify, USD)
 * UAE luxury niche house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'kajal-perfumes',
  baseUrl: 'https://kajalperfumes.com',
  currency: 'USD',
  defaultBrand: 'Kajal Perfumes',
}

async function scrapeKajal() {
  console.log('▶ Kajal Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Kajal Perfumes: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeKajal }
