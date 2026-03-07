/**
 * Saeed Ghani scraper
 * Store: https://saeedghani.pk (Shopify, PKR)
 * Pakistani heritage house est. 1888, halal-focused
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'saeed-ghani',
  baseUrl: 'https://saeedghani.pk',
  currency: 'PKR',
  defaultBrand: 'Saeed Ghani',
}

async function scrapeSaeedGhani() {
  console.log('▶ Saeed Ghani scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Saeed Ghani: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeSaeedGhani }
