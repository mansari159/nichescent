/**
 * The Spirit of Dubai scraper
 * Store: https://thespiritofdubai.com (Shopify, USD)
 * Ultra-luxury Emirati house
 */
const { scrapeShopify } = require('./shopify')

const CONFIG = {
  retailerSlug: 'spirit-of-dubai',
  baseUrl: 'https://thespiritofdubai.com',
  currency: 'USD',
  defaultBrand: 'The Spirit of Dubai',
}

async function scrapeSpiritOfDubai() {
  console.log('▶ The Spirit of Dubai scraper starting...')
  const raw = await scrapeShopify(CONFIG.baseUrl, CONFIG.currency)
  const listings = raw.map(item => ({ ...item, raw_brand: CONFIG.defaultBrand }))
  console.log(`✓ The Spirit of Dubai: ${listings.length} listings ready`)
  return { retailerSlug: CONFIG.retailerSlug, listings }
}

module.exports = { scrapeSpiritOfDubai }
