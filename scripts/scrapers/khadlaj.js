/**
 * Khadlaj scraper
 * Store: https://www.khadlaj-perfumes.com (Shopify, AED)
 * UAE affordable oriental house est. 1997
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'khadlaj',
  baseUrl: 'https://www.khadlaj-perfumes.com',
  currency: 'AED',
  defaultBrand: 'Khadlaj',
}

async function scrapeKhadlaj() {
  console.log('▶ Khadlaj scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Khadlaj: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeKhadlaj }
