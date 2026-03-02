/**
 * Afnan Perfumes scraper
 * Store: https://afnan.com (Shopify, USD)
 */

const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'afnan',
  baseUrl: 'https://afnan.com',
  currency: 'USD',
  defaultBrand: 'Afnan',
}

async function scrapeAfnan() {
  console.log('▶ Afnan Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)

  const listings = raw.map(item => ({
    ...item,
    raw_brand: CONFIG.defaultBrand,
  }))

  console.log(`✓ Afnan: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAfnan }
