/**
 * Oud Store — multi-brand retailer scraper
 * Store: https://oudstore.com (Shopify, USD)
 * Global MENA fragrance retailer — ships worldwide, stocks major houses.
 * Key brands: Amouage, Rasasi, Al Haramain, Ajmal, Swiss Arabian, Lattafa
 *
 * NOTE: Preserves vendor brand attribution — do not override raw_brand.
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'oud-store',
  baseUrl: 'https://oudstore.com',
  currency: 'USD',
}

async function scrapeOudStore() {
  console.log('▶ Oud Store scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.filter(item => item.raw_brand && item.raw_price > 0)
  console.log(`✓ Oud Store: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeOudStore }
