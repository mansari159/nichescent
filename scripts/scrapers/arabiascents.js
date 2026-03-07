/**
 * Arabia Scents — multi-brand retailer scraper
 * Store: https://arabiascents.com (Shopify, USD)
 * US-based MENA fragrance retailer stocking 50+ brands.
 * Key brands stocked: Hind Al Oud, Reef International, Al Haramain, Nabeel,
 * Swiss Arabian, Rasasi, Ajmal, Amouage, Arabian Oud, and many more.
 *
 * NOTE: This scraper does NOT override raw_brand — it preserves the Shopify
 * vendor field so each product is attributed to its correct brand.
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'arabia-scents',
  baseUrl: 'https://arabiascents.com',
  currency: 'USD',
}

async function scrapeArabiaScents() {
  console.log('▶ Arabia Scents scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)

  // Keep vendor-attributed brand for each product — this is a multi-brand store
  const listings = raw.filter(item => item.raw_brand && item.raw_price > 0)

  console.log(`✓ Arabia Scents: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeArabiaScents }
