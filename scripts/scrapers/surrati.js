/**
 * Surrati scraper
 * Store: https://www.surratiperfume.com (Shopify, USD)
 * Jeddah-based house, est. 1998 — known for attar oils and oud blends.
 * Products: Oud Zahran, Naseem series, Mukhallat collections
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'surrati',
  baseUrl: 'https://www.surratiperfume.com',
  currency: 'USD',
  defaultBrand: 'Surrati',
}

async function scrapeSurrati() {
  console.log('▶ Surrati scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Surrati: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeSurrati }
