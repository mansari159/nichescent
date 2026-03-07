/**
 * Arabiyat Prestige scraper
 * Store: https://arabiyatprestige.shop (Shopify, AED)
 * Dubai oriental fragrance house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'arabiyat-prestige',
  baseUrl: 'https://arabiyatprestige.shop',
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
