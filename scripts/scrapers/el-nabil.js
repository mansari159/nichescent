/**
 * El Nabil scraper
 * Store: https://elnabil-parfums.com (Shopify, EUR)
 * Moroccan fragrance house — specialises in concentrated attars and oriental EDPs.
 * Known for: Musc series, Musk Al Arab, Hayat — popular in MENA and Europe
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'el-nabil',
  baseUrl: 'https://www.el-nabil.com',
  currency: 'EUR',
  defaultBrand: 'El Nabil',
}

async function scrapeElNabil() {
  console.log('▶ El Nabil scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ El Nabil: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeElNabil }
