/**
 * Dukhni scraper
 * Store: https://dukhni.us (Shopify, USD)
 * Specializes in: Bakhoor, Attar/oils, Oud blends
 */

const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'dukhni',
  baseUrl: 'https://dukhni.us',
  currency: 'USD',
  defaultBrand: 'Dukhni',
}

async function scrapeDukhni() {
  console.log('▶ Dukhni scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)

  const listings = raw.map(item => {
    // Dukhni sells its own brand exclusively
    const fragranceType = inferFragranceType(item.raw_name, item.raw_data?.product_type, item.raw_data?.tags)
    return {
      ...item,
      raw_brand: CONFIG.defaultBrand,
      raw_data: {
        ...item.raw_data,
        inferred_type: fragranceType,
      },
    }
  })

  console.log(`✓ Dukhni: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

/**
 * Infer fragrance type from product name/type/tags
 * Dukhni sells bakhoor, attars, and sprays
 */
function inferFragranceType(name = '', productType = '', tags = '') {
  const text = `${name} ${productType} ${tags}`.toLowerCase()
  if (text.includes('bakhoor') || text.includes('incense')) return 'bakhoor'
  if (text.includes('attar') || text.includes('oil') || text.includes('rollon') || text.includes('roll-on')) return 'attar'
  if (text.includes('edp') || text.includes('eau de parfum')) return 'edp'
  if (text.includes('edt') || text.includes('eau de toilette')) return 'edt'
  return 'edp' // default
}

module.exports = { scrapeDukhni }
