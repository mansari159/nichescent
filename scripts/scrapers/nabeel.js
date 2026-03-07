/**
 * Nabeel Perfumes scraper
 * Store: https://www.nabeel.com (Shopify, AED)
 * Dubai-based house — wide oriental catalog, Ghalia Oudh series, rose attars.
 * Also sells via arabiascents.com
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'nabeel',
  baseUrl: 'https://www.nabeel.com',
  currency: 'AED',
  defaultBrand: 'Nabeel',
}

async function scrapeNabeel() {
  console.log('▶ Nabeel Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Nabeel: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeNabeel }
