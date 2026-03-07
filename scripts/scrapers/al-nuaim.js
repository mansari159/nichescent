/**
 * Al Nuaim scraper
 * Store: https://alnuaim.com (Shopify, USD)
 * Saudi-based budget-friendly oriental house — massive catalog of attars and EDPs.
 * Known for: Musk Malak, Rose Gold, Shams Al Emarat series
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'al-nuaim',
  baseUrl: 'https://alnuaim.com',
  currency: 'USD',
  defaultBrand: 'Al Nuaim',
}

async function scrapeAlNuaim() {
  console.log('▶ Al Nuaim scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Al Nuaim: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAlNuaim }
