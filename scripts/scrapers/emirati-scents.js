/**
 * Emirati Scents — multi-brand retailer scraper
 * Store: https://emaratiscents.com (Shopify, AED)
 * UAE-based specialty retailer — local niche and artisan brands.
 * Stocks: Hind Al Oud, Assaf, local Emirati houses
 *
 * NOTE: Preserves vendor brand attribution — do not override raw_brand.
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'emirati-scents',
  baseUrl: 'https://emaratiscents.com',
  currency: 'AED',
}

async function scrapeEmiratiScents() {
  console.log('▶ Emirati Scents scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.filter(item => item.raw_brand && item.raw_price > 0)
  console.log(`✓ Emirati Scents: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeEmiratiScents }
