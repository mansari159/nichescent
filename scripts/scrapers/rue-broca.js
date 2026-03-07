/**
 * Rue Broca scraper
 * Store: https://www.ruebrocaparfums.com (Shopify, USD)
 * UAE French-inspired oriental house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'rue-broca',
  baseUrl: 'https://www.ruebrocaparfums.com',
  currency: 'USD',
  defaultBrand: 'Rue Broca',
}

async function scrapeRueBroca() {
  console.log('▶ Rue Broca scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Rue Broca: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeRueBroca }
