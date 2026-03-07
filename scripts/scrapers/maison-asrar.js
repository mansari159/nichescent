/**
 * Maison Asrar scraper
 * Store: https://maisonasrar.com (Shopify, USD)
 * UAE niche house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'maison-asrar',
  baseUrl: 'https://maisonasrar.com',
  currency: 'USD',
  defaultBrand: 'Maison Asrar',
}

async function scrapeMaisonAsrar() {
  console.log('▶ Maison Asrar scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Maison Asrar: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeMaisonAsrar }
