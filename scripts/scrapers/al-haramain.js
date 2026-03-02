/**
 * Al Haramain Perfumes US scraper
 * Store: https://www.alharamainperfumes.com (Shopify, USD)
 * Founded 1970 — one of the most iconic Saudi fragrance houses
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'al-haramain',
  baseUrl: 'https://www.alharamainperfumes.com',
  currency: 'USD',
  defaultBrand: 'Al Haramain',
}

async function scrapeAlHaramain() {
  console.log('▶ Al Haramain Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Al Haramain: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAlHaramain }
