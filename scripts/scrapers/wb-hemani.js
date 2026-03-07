/**
 * WB by Hemani scraper
 * Store: https://www.wbhemani.com (Shopify, PKR)
 * Pakistani halal herb-forward brand est. 2014
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'wb-hemani',
  baseUrl: 'https://www.wbhemani.com',
  currency: 'PKR',
  defaultBrand: 'WB by Hemani',
}

async function scrapeWbHemani() {
  console.log('▶ WB by Hemani scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ WB by Hemani: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeWbHemani }
