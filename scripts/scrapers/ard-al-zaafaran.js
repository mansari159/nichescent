/**
 * Ard Al Zaafaran scraper
 * Store: https://ardalzaafaranshop.com (Shopify, USD)
 * Dubai-based house — high-volume oriental catalog, known for:
 * Dirham, Kashmiri Musk, Oud, Khaltat Al Arabia series
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'ard-al-zaafaran',
  baseUrl: 'https://ardalzaafaranshop.com',
  currency: 'USD',
  defaultBrand: 'Ard Al Zaafaran',
}

async function scrapeArdAlZaafaran() {
  console.log('▶ Ard Al Zaafaran scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Ard Al Zaafaran: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeArdAlZaafaran }
