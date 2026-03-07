/**
 * Naseem scraper
 * Store: https://naseemperfumes.us (Shopify, USD)
 * UAE fragrance brand, US store
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'naseem',
  baseUrl: 'https://naseemperfumes.us',
  currency: 'USD',
  defaultBrand: 'Naseem',
}

async function scrapeNaseem() {
  console.log('▶ Naseem scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Naseem: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeNaseem }
