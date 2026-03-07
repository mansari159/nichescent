/**
 * Fragrance World scraper
 * Store: https://fragranceworld.ae (Shopify, AED)
 * Dubai-based house — budget-to-mid range MENA-inspired collection.
 * Known for: Ameer Al Oud, Bade'e Al Oud, Director's Cut
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'fragrance-world',
  baseUrl: 'https://fragranceworld.ae',
  currency: 'AED',
  defaultBrand: 'Fragrance World',
}

async function scrapeFragranceWorld() {
  console.log('▶ Fragrance World scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: item.raw_brand || CONFIG.defaultBrand }))
  console.log(`✓ Fragrance World: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeFragranceWorld }
