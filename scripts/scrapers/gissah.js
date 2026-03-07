/**
 * Gissah Perfumes scraper
 * Website: https://sa.gissah.com (NOT Shopify — custom platform)
 * Kuwaiti niche house — Oud Saffron, Ghalia, White Oud
 *
 * TODO: Gissah uses a custom e-commerce platform, not Shopify.
 * Products are available via multi-brand retailer Arabia Scents.
 * This stub returns empty so scrape-all doesn't crash.
 * Track via: arabiascents.com scraper (brand filter: gissah)
 */
async function scrapeGissah() {
  console.log('▶ Gissah: custom platform — no direct scraper yet, use arabia-scents')
  return { retailerSlug: 'gissah', listings: [] }
}

module.exports = { scrapeGissah }
