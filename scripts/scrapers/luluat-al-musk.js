/**
 * Luluat Al Musk — multi-brand retailer scraper
 * Store: https://luluatalmusk.com (Shopify, USD)
 * US-based MENA fragrance retailer — specialises in rare attars, mukhallats, and oud oils.
 * Stocks: Al Haramain, Rasasi, Swiss Arabian, Abdul Samad Al Qurashi, and more.
 *
 * NOTE: Preserves vendor brand attribution — do not override raw_brand.
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'luluat-al-musk',
  baseUrl: 'https://luluatalmusk.com',
  currency: 'USD',
}

async function scrapeLuluatAlMusk() {
  console.log('▶ Luluat Al Musk scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.filter(item => item.raw_brand && item.raw_price > 0)
  console.log(`✓ Luluat Al Musk: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeLuluatAlMusk }
