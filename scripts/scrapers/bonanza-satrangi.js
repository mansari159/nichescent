/**
 * Bonanza Satrangi scraper
 * Store: https://www.bonanzasatrangi.com (Shopify, PKR)
 * Pakistani fashion retailer with an in-house fragrance line.
 * Known for: Satrangi Perfume collection, accessible price points
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'bonanza-satrangi',
  baseUrl: 'https://www.bonanzasatrangi.com',
  currency: 'PKR',
  defaultBrand: 'Bonanza Satrangi',
}

async function scrapeBonanzaSatrangi() {
  console.log('▶ Bonanza Satrangi scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)

  // Filter to fragrance products only
  const listings = raw
    .filter(item => {
      const type = (item.raw_data?.product_type ?? '').toLowerCase()
      const tags = (item.raw_data?.tags ?? '').toLowerCase()
      const name = (item.raw_name ?? '').toLowerCase()
      return (
        type.includes('perfume') ||
        type.includes('fragrance') ||
        tags.includes('perfume') ||
        tags.includes('fragrance') ||
        name.includes('perfume') ||
        name.includes('eau de') ||
        name.includes('attar')
      )
    })
    .map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))

  console.log(`✓ Bonanza Satrangi: ${listings.length} fragrance listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeBonanzaSatrangi }
