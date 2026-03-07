/**
 * Armaf scraper
 * Store: https://www.armafperfumes.com (Shopify, USD)
 * Dubai-based house under Sterling Parfums — premium-affordable EDP line.
 * Known for: Club de Nuit, Venetian Vibes, Bucephalus, Tres Nuit
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'armaf',
  baseUrl: 'https://www.armafperfumes.com',
  currency: 'USD',
  defaultBrand: 'Armaf',
}

async function scrapeArmaf() {
  console.log('▶ Armaf scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Armaf: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeArmaf }
