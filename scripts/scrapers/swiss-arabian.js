/**
 * Swiss Arabian scraper
 * Store: https://swissarabian.com (Shopify, USD)
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'swiss-arabian',
  baseUrl: 'https://swissarabian.com',
  currency: 'USD',
  defaultBrand: 'Swiss Arabian',
}

async function scrapeSwissArabian() {
  console.log('▶ Swiss Arabian scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: item.raw_brand || CONFIG.defaultBrand }))
  console.log(`✓ Swiss Arabian: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeSwissArabian }
