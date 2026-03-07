/**
 * Hamidi scraper
 * Store: https://www.hamidi.us (Shopify, USD)
 * UAE fragrance and incense house, US store
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'hamidi',
  baseUrl: 'https://www.hamidi.us',
  currency: 'USD',
  defaultBrand: 'Hamidi',
}

async function scrapeHamidi() {
  console.log('▶ Hamidi scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Hamidi: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeHamidi }
