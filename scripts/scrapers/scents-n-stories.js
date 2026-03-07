/**
 * Scents N Stories scraper
 * Store: https://scentsnstories.pk (Shopify, PKR)
 * Pakistani dupe/inspired house est. 2018
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'scents-n-stories',
  baseUrl: 'https://scentsnstories.pk',
  currency: 'PKR',
  defaultBrand: 'Scents N Stories',
}

async function scrapeScentsNStories() {
  console.log('▶ Scents N Stories scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ Scents N Stories: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeScentsNStories }
