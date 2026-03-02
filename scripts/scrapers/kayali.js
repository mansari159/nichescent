/**
 * Kayali scraper
 * Huda Kattan's (Huda Beauty) Middle Eastern-inspired fragrance line.
 * Launched 2018 — known for layerable, MENA-influenced modern perfumes.
 * Positioned at $75–$150 per bottle.
 *
 * Primary stores:
 *   - kayaliofficial.com (Shopify, USD) — direct
 *   - sephora.com        — skip (complex/non-Shopify)
 */
const { scrapeShopify } = require('./shopify')

const CONFIGS = [
  {
    retailerSlug: 'kayali-official',
    baseUrl: 'https://kayaliofficial.com',
    currency: 'USD',
    defaultBrand: 'Kayali',
  },
]

async function scrapeKayali() {
  console.log('▶ Kayali scraper starting...')
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

module.exports = { scrapeKayali }
