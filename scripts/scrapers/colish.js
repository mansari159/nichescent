/**
 * Colish Perfumes scraper
 * Store: https://www.colishco.com (Shopify, PKR)
 * Rising Pakistani niche brand
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'colish',
  baseUrl: 'https://www.colishco.com',
  currency: 'PKR',
  defaultBrand: 'Colish Perfumes',
}

async function scrapeColish() {
  console.log('▶ Colish Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Colish Perfumes: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeColish }
