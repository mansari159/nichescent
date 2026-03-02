/**
 * Assaf Perfumes scraper
 * Store: https://assaf.ae (Shopify, AED)
 * Emirati brand — Najd desert heritage, created with French perfumers
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'assaf',
  baseUrl: 'https://assaf.ae',
  currency: 'AED',
  defaultBrand: 'Assaf',
}

async function scrapeAssaf() {
  console.log('▶ Assaf Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Assaf: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAssaf }
