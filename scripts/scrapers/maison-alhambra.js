/**
 * Maison Alhambra scraper
 * Store: https://maisonalhambra.com (Shopify, USD)
 * Dubai-based house by the Lattafa Group — inspired-by niche alternative fragrances.
 * Wide catalog covering oud, amber, floral, and woody accords.
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'maison-alhambra',
  baseUrl: 'https://maisonalhambra.com',
  currency: 'USD',
  defaultBrand: 'Maison Alhambra',
}

async function scrapeMaisonAlhambra() {
  console.log('▶ Maison Alhambra scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Maison Alhambra: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeMaisonAlhambra }
