/**
 * Paris Corner scraper
 * Store: https://pariscorner.ae (Shopify, AED)
 * Dubai-based fragrance house — known for opulent oriental blends.
 * Covers: Pendora Scents line, Prison Break, Piece d'Empire
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'paris-corner',
  baseUrl: 'https://pariscorner.ae',
  currency: 'AED',
  defaultBrand: 'Paris Corner',
}

async function scrapeParisCorner() {
  console.log('▶ Paris Corner scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: item.raw_brand || CONFIG.defaultBrand }))
  console.log(`✓ Paris Corner: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeParisCorner }
