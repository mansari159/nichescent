/**
 * Al Wataniah scraper
 * Store: https://www.alwataniah.com (Shopify, AED)
 * UAE budget oriental house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'al-wataniah',
  baseUrl: 'https://www.alwataniah.com',
  currency: 'AED',
  defaultBrand: 'Al Wataniah',
}

async function scrapeAlWataniah() {
  console.log('▶ Al Wataniah scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Al Wataniah: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAlWataniah }
