/**
 * Velixir scraper
 * Store: https://www.velixirparfums.com (Shopify, USD)
 * Indonesian fragrance house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'velixir',
  baseUrl: 'https://www.velixirparfums.com',
  currency: 'USD',
  defaultBrand: 'Velixir',
}

async function scrapeVelixir() {
  console.log('▶ Velixir scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Velixir: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeVelixir }
