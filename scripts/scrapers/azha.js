/**
 * Azha Perfumes scraper
 * Store: https://azhaperfumes.com (Shopify, AED)
 * UAE modern house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'azha-perfumes',
  baseUrl: 'https://azhaperfumes.com',
  currency: 'AED',
  defaultBrand: 'Azha Perfumes',
}

async function scrapeAzha() {
  console.log('▶ Azha Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Azha Perfumes: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAzha }
