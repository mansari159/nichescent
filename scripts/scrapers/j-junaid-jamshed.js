/**
 * J. Junaid Jamshed scraper
 * Store: https://www.j.pk (Shopify, PKR)
 * Pakistan's iconic fashion & fragrance house — founded by pop star Junaid Jamshed.
 * Known for: J. Perfume, Gardenia, Musk al Arabia — affordable oriental EDPs
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'j-junaid-jamshed',
  baseUrl: 'https://www.junaidjamshed.com',
  currency: 'PKR',
  defaultBrand: 'J. Junaid Jamshed',
}

async function scrapeJJunaidJamshed() {
  console.log('▶ J. Junaid Jamshed scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)

  // Filter to fragrance products only (store also sells clothing, food)
  const listings = raw
    .filter(item => {
      const name = (item.raw_name ?? '').toLowerCase()
      const type = (item.raw_data?.product_type ?? '').toLowerCase()
      const tags = (item.raw_data?.tags ?? '').toLowerCase()
      return (
        type.includes('perfume') ||
        type.includes('fragrance') ||
        type.includes('scent') ||
        tags.includes('perfume') ||
        tags.includes('fragrance') ||
        name.includes('perfume') ||
        name.includes('eau de') ||
        name.includes('edp') ||
        name.includes('edt')
      )
    })
    .map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))

  console.log(`✓ J. Junaid Jamshed: ${listings.length} fragrance listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeJJunaidJamshed }
