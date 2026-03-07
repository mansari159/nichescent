/**
 * Suroori scraper
 * Store: https://suroorfragrances.com (Shopify, USD)
 * UAE fragrance brand
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'suroori',
  baseUrl: 'https://suroorfragrances.com',
  currency: 'USD',
  defaultBrand: 'Suroori',
}

async function scrapeSuroori() {
  console.log('▶ Suroori scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Suroori: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeSuroori }
