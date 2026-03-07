/**
 * Abdul Samad Al Qurashi scraper
 * Store: https://sa.abdulsamadalqurashi.com (Shopify, USD)
 * Mecca-based, est. 1852 — one of the oldest fragrance houses in Arabia.
 * Known for: Royal Oud, Dehn Al Oud Maliki, Royal Mukhallat, Black Orchid
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'asa-qurashi',
  baseUrl: 'https://sa.abdulsamadalqurashi.com',
  currency: 'USD',
  defaultBrand: 'Abdul Samad Al Qurashi',
}

async function scrapeAbdulSamadAlQurashi() {
  console.log('▶ Abdul Samad Al Qurashi scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Abdul Samad Al Qurashi: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeAbdulSamadAlQurashi }
