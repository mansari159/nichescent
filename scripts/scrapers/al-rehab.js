/**
 * Al Rehab scraper
 * Store: https://www.alrehab.com (Shopify, USD)
 * Cairo-based, est. 1978 — Crown Perfumes subsidiary, Egypt's largest fragrance house.
 * Known for: Soft, Choco Musk, Silver, Blue, Blossom — ultra-affordable attars $5-$20
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'al-rehab',
  baseUrl: 'https://www.alrehab.com',
  currency: 'USD',
  defaultBrand: 'Al Rehab',
}

async function scrapeAlRehab() {
  console.log('▶ Al Rehab scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Al Rehab: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAlRehab }
