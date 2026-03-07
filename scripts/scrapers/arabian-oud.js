/**
 * Arabian Oud scraper
 * Store: https://www.arabianoud.com (Shopify, USD)
 * Riyadh-based, est. 1982 — world's largest oud retailer with 800+ branches.
 * Known for: Royale Malmason, Musk Maliki, various raw oud oils and attars.
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'arabian-oud',
  baseUrl: 'https://www.arabianoud.com',
  currency: 'USD',
  defaultBrand: 'Arabian Oud',
}

async function scrapeArabianOud() {
  console.log('▶ Arabian Oud scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Arabian Oud: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeArabianOud }
