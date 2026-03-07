/**
 * The Spirit of Dubai scraper
 * Website: https://www.thespiritofdubai.com (NOT Shopify — custom platform)
 * Ultra-luxury Emirati house — Qasr Al Sultan, Wadi, Meydan
 *
 * TODO: thespiritofdubai.com uses a custom platform.
 * May need a Playwright/Puppeteer scraper for dynamic content.
 * This stub returns empty so scrape-all doesn't crash.
 */
async function scrapeSpiritOfDubai() {
  console.log('▶ Spirit of Dubai: custom platform — no direct scraper yet')
  return { retailerSlug: 'spirit-of-dubai', listings: [] }
}

module.exports = { scrapeSpiritOfDubai }
