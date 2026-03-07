/**
 * Ahmad Al Maghribi scraper
 * Store: https://www.ahmed-perfume.com (Shopify, USD)
 * Saudi niche house est. 2016
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'ahmad-al-maghribi',
  baseUrl: 'https://www.ahmed-perfume.com',
  currency: 'USD',
  defaultBrand: 'Ahmad Al Maghribi',
}

async function scrapeAhmadAlMaghribi() {
  console.log('▶ Ahmad Al Maghribi scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Ahmad Al Maghribi: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAhmadAlMaghribi }
