/**
 * Dumont scraper
 * Store: https://dumontperfumes.com (Shopify, USD)
 * UAE accessible fragrance brand
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'dumont',
  baseUrl: 'https://dumontperfumes.com',
  currency: 'USD',
  defaultBrand: 'Dumont',
}

async function scrapeDumont() {
  console.log('▶ Dumont scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Dumont: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeDumont }
