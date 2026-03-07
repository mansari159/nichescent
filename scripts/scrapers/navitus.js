/**
 * Navitus Parfums scraper
 * Store: https://navitusparfums.com (Shopify, USD)
 * UAE niche parfumeur
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'navitus',
  baseUrl: 'https://navitusparfums.com',
  currency: 'USD',
  defaultBrand: 'Navitus Parfums',
}

async function scrapeNavitus() {
  console.log('▶ Navitus Parfums scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Navitus Parfums: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeNavitus }
