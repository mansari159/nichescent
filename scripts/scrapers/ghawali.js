/**
 * Ghawali scraper
 * Store: https://ae.ghawali.com (Shopify, AED)
 * Emirati niche house est. 2016
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'ghawali',
  baseUrl: 'https://ae.ghawali.com',
  currency: 'AED',
  defaultBrand: 'Ghawali',
}

async function scrapeGhawali() {
  console.log('▶ Ghawali scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Ghawali: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeGhawali }
