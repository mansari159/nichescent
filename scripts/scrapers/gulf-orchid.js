/**
 * Gulf Orchid scraper
 * Store: https://shop-gulforchid.com (Shopify, AED)
 * Sharjah-based, est. 1989 — incense, oud, and oriental EDPs.
 * Known for: Charlie series, Oud series, bakhoor blends
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'gulf-orchid',
  baseUrl: 'https://shop-gulforchid.com',
  currency: 'AED',
  defaultBrand: 'Gulf Orchid',
}

async function scrapeGulfOrchid() {
  console.log('▶ Gulf Orchid scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Gulf Orchid: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeGulfOrchid }
