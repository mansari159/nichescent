/**
 * WIDIAN scraper
 * Store: https://ajarabia.com (Shopify, USD)
 * Luxury UAE house, AJ Arabia parent brand
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'widian',
  baseUrl: 'https://ajarabia.com',
  currency: 'USD',
  defaultBrand: 'WIDIAN',
}

async function scrapeWidian() {
  console.log('▶ WIDIAN scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ WIDIAN: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeWidian }
