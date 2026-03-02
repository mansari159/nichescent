/**
 * Ibrahim Al Qurashi / Ibraq scraper
 * One of Saudi Arabia's most prestigious fragrance houses, est. 1968.
 * Known for: Dehn Al Oud, Ghalia, and traditional khaleeji attars.
 *
 * Primary store: https://usaibrahimalqurashi.com (USD, Shopify)
 */
const { scrapeShopify } = require('./shopify')

const CONFIGS = [
  {
    retailerSlug: 'ibraq-usa',
    baseUrl: 'https://usaibrahimalqurashi.com',
    currency: 'USD',
    defaultBrand: 'Ibrahim Al Qurashi',
  },
]

async function scrapeIbraq() {
  console.log('▶ Ibrahim Al Qurashi / Ibraq scraper starting...')
  const results = []

  for (const config of CONFIGS) {
    try {
      console.log(`  Scraping ${config.baseUrl}...`)
      const raw = await scrapeShopify(config.baseUrl, config.currency)
      const listings = raw.map(item => ({
        ...item,
        raw_brand: item.raw_brand || config.defaultBrand,
      }))
      console.log(`  ✓ ${config.retailerSlug}: ${listings.length} listings`)
      results.push({ retailerSlug: config.retailerSlug, listings })
    } catch (err) {
      console.warn(`  ⚠ ${config.retailerSlug} failed: ${err.message}`)
    }
  }

  return results
}

module.exports = { scrapeIbraq }
