/**
 * Sapil scraper
 * Store: https://sapil.com (Shopify, USD)
 * UAE affordable fragrance brand
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'sapil',
  baseUrl: 'https://sapil.com',
  currency: 'USD',
  defaultBrand: 'Sapil',
}

async function scrapeSapil() {
  console.log('▶ Sapil scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Sapil: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeSapil }
