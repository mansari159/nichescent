/**
 * French Avenue scraper
 * Store: https://www.french-avenue-parfum.com (Shopify, EUR)
 * UAE French-inspired fragrance line
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'french-avenue',
  baseUrl: 'https://www.french-avenue-parfum.com',
  currency: 'EUR',
  defaultBrand: 'French Avenue',
}

async function scrapeFrenchAvenue() {
  console.log('▶ French Avenue scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ French Avenue: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeFrenchAvenue }
