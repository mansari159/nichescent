/**
 * Ajmal Perfumes scraper
 * Store: https://www.ajmalperfume.com (Shopify, USD)
 * UAE house founded 1951 — one of the oldest and most respected in the region
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'ajmal',
  baseUrl: 'https://www.ajmalperfume.com',
  currency: 'USD',
  defaultBrand: 'Ajmal',
}

async function scrapeAjmal() {
  console.log('▶ Ajmal Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Ajmal: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAjmal }
