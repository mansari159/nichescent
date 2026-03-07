/**
 * Louis Cardin scraper
 * Store: https://louiscardin.us (Shopify, GBP)
 * UAE brand with UK store
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'louis-cardin',
  baseUrl: 'https://louiscardin.us',
  currency: 'GBP',
  defaultBrand: 'Louis Cardin',
}

async function scrapeLouisCardin() {
  console.log('▶ Louis Cardin scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Louis Cardin: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeLouisCardin }
