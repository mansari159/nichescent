/**
 * Arabiyat Prestige scraper
 * Store: https://thearabiyat.com (Shopify, AED)
 * Dubai oriental fragrance house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'arabiyat-prestige',
  baseUrl: 'https://thearabiyat.com',
  currency: 'AED',
  defaultBrand: 'Arabiyat Prestige',
}

async function scrapeArabiyatPrestige() {
  console.log('▶ Arabiyat Prestige scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Arabiyat Prestige: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeArabiyatPrestige }
