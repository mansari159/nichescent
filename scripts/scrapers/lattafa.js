/**
 * Lattafa USA scraper
 * Store: https://www.lattafa-usa.com (Shopify, USD)
 *
 * Lattafa brands covered: Lattafa, Ramz, Khamrah, Asad, Oud For Glory, etc.
 */

const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'lattafa-usa',
  baseUrl: 'https://www.lattafa-usa.com',
  currency: 'USD',
  defaultBrand: 'Lattafa',
}

/**
 * Scrape Lattafa USA and return normalized listings
 * @returns {Promise<Array>} listings ready for upsert into scraper_listings
 */
async function scrapeLattafa() {
  console.log('▶ Lattafa USA scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)

  // Normalize: Lattafa USA always sells Lattafa products
  const listings = raw.map(item => ({
    ...item,
    raw_brand: CONFIG.defaultBrand,
    // Lattafa USA product URLs don't need modification
  }))

  console.log(`✓ Lattafa USA: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeLattafa }
