/**
 * Gissah Perfumes scraper
 * Store: https://gissahuae.com (Shopify, AED)
 * Kuwaiti luxury house founded 2019 — known for bold, artistic bottles
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'gissah',
  baseUrl: 'https://gissahuae.com',
  currency: 'AED',
  defaultBrand: 'Gissah',
}

async function scrapeGissah() {
  console.log('▶ Gissah Perfumes scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: item.raw_brand || CONFIG.defaultBrand }))
  console.log(`✓ Gissah: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeGissah }
