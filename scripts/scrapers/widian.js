/**
 * WIDIAN scraper
 * Website: https://www.widian.com (NOT Shopify — custom platform)
 * Abu Dhabi luxury house, AJ Arabia parent brand — Collection I, II, III
 *
 * TODO: widian.com uses a custom platform, not Shopify.
 * This stub returns empty so scrape-all doesn't crash.
 */
async function scrapeWidian() {
  console.log('▶ WIDIAN: custom platform — no direct scraper yet')
  return { retailerSlug: 'widian', listings: [] }
}

module.exports = { scrapeWidian }
