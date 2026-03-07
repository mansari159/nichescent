/**
 * Nabeel Perfumes scraper
 * Website: https://www.nabeel.com (NOT Shopify — custom platform)
 * UAE house est. 1969 — Ghalia Oudh, Bakhoor, Attar blends
 *
 * TODO: nabeel.com uses a custom platform, not Shopify.
 * Available via multi-brand retailers (Arabia Scents, Luluat Al Musk).
 * This stub returns empty so scrape-all doesn't crash.
 */
async function scrapeNabeel() {
  console.log('▶ Nabeel: custom platform — no direct scraper yet, use multi-brand retailers')
  return { retailerSlug: 'nabeel', listings: [] }
}

module.exports = { scrapeNabeel }
