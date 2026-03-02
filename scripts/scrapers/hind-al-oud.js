/**
 * Hind Al Oud scraper
 * Bahraini niche house known for their limited-edition oud blends.
 * High-end collectible fragrances, often $150+.
 *
 * NOTE: Hind Al Oud does not have a standalone e-commerce store.
 * They sell through select regional retailers. This scraper targets
 * known stockists. Add new URLs as distribution expands.
 *
 * Known stockists to monitor:
 *   - emaratiscents.com (Shopify, AED)
 *   - arabiascents.com  (Shopify, USD)
 */
const { scrapeShopify } = require('./shopify')

const TARGET_RETAILERS = [
  {
    retailerSlug: 'emirati-scents',
    baseUrl: 'https://emaratiscents.com',
    currency: 'AED',
    brandFilter: 'hind',   // Only pick up products matching this brand keyword
  },
  {
    retailerSlug: 'arabia-scents',
    baseUrl: 'https://arabiascents.com',
    currency: 'USD',
    brandFilter: 'hind',
  },
]

async function scrapeHindAlOud() {
  console.log('▶ Hind Al Oud scraper starting...')
  const results = []

  for (const config of TARGET_RETAILERS) {
    try {
      console.log(`  Scraping ${config.baseUrl} for Hind Al Oud...`)
      const raw = await scrapeShopify(config.baseUrl, config.currency)

      // Filter to only Hind Al Oud products
      const listings = raw
        .filter(item => {
          const name = (item.name ?? '').toLowerCase()
          const brand = (item.raw_brand ?? '').toLowerCase()
          return name.includes(config.brandFilter) || brand.includes(config.brandFilter)
        })
        .map(item => ({
          ...item,
          raw_brand: 'Hind Al Oud',
        }))

      console.log(`  ✓ ${config.retailerSlug}: ${listings.length} Hind Al Oud listings`)
      if (listings.length > 0) {
        results.push({ retailerSlug: config.retailerSlug, listings })
      }
    } catch (err) {
      console.warn(`  ⚠ ${config.retailerSlug} failed: ${err.message}`)
    }
  }

  return results
}

module.exports = { scrapeHindAlOud }
