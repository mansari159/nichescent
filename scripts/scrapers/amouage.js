/**
 * Amouage scraper
 * Store: https://www.amouage.com (Shopify, USD)
 * Omani luxury house founded 1983 by the Sultan of Oman.
 * Known for: Library Collection, Memoir, Interlude, Reflection — ultra-premium £200+
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'amouage',
  baseUrl: 'https://www.amouage.com',
  currency: 'USD',
  defaultBrand: 'Amouage',
}

async function scrapeAmouage() {
  console.log('▶ Amouage scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Amouage: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAmouage }
