/**
 * Rasasi Perfumes scraper
 * Store: https://rasasi.com (Shopify, USD)
 * Dubai-based house since 1979 — wide range from attars to modern EDP
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'rasasi',
  baseUrl: 'https://rasasi.com',
  currency: 'USD',
  defaultBrand: 'Rasasi',
}

async function scrapeRasasi() {
  console.log('▶ Rasasi scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: item.raw_brand || CONFIG.defaultBrand }))
  console.log(`✓ Rasasi: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeRasasi }
