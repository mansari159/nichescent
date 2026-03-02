/**
 * Generic Shopify scraper
 * Works with any store that exposes /products.json (all Shopify stores do by default)
 *
 * Usage:
 *   const { scrapeShopify } = require('./shopify')
 *   const listings = await scrapeShopify('https://store.com', 'USD')
 */

const axios = require('axios')

const DELAY_MS = 1500 // be polite — 1.5s between pages
const PAGE_LIMIT = 250 // Shopify max per page

/**
 * Fetch all products from a Shopify store
 * @param {string} baseUrl   e.g. 'https://www.lattafa-usa.com'
 * @param {string} currency  store's native currency code (e.g. 'USD', 'AED')
 * @returns {Promise<Array>} raw product listings
 */
async function scrapeShopify(baseUrl, currency = 'USD') {
  const domain = baseUrl.replace(/\/$/, '')
  let page = 1
  const all = []

  console.log(`  Scraping ${domain} ...`)

  while (true) {
    const url = `${domain}/products.json?limit=${PAGE_LIMIT}&page=${page}`

    let resp
    try {
      resp = await axios.get(url, {
        timeout: 15_000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      })
    } catch (err) {
      console.warn(`  ⚠ Failed to fetch page ${page} from ${domain}: ${err.message}`)
      break
    }

    const products = resp.data?.products ?? []
    if (!products.length) break

    for (const p of products) {
      // Each Shopify product may have multiple variants (sizes)
      for (const variant of p.variants ?? []) {
        const price = parseFloat(variant.price)
        if (!price || price <= 0) continue

        all.push({
          raw_name: p.title,
          raw_brand: extractBrand(p),
          raw_price: price,
          raw_currency: currency,
          raw_description: stripHtml(p.body_html),
          raw_image_url: p.images?.[0]?.src ?? null,
          raw_url: `${domain}/products/${p.handle}`,
          external_id: String(variant.id),
          raw_data: {
            shopify_product_id: p.id,
            shopify_variant_id: variant.id,
            variant_title: variant.title, // e.g. '100ml' or 'Default Title'
            tags: p.tags,
            product_type: p.product_type,
            vendor: p.vendor,
          },
        })
      }
    }

    console.log(`  Page ${page}: fetched ${products.length} products (total: ${all.length})`)

    if (products.length < PAGE_LIMIT) break
    page++
    await sleep(DELAY_MS)
  }

  console.log(`  ✓ ${domain}: ${all.length} variant listings scraped`)
  return all
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractBrand(product) {
  // Shopify "vendor" field is usually the brand name
  if (product.vendor && product.vendor.toLowerCase() !== 'default') {
    return product.vendor
  }
  // Fallback: try to extract from product type or first tag
  return product.product_type || (product.tags?.split(',')[0]?.trim()) || null
}

function stripHtml(html) {
  if (!html) return null
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000) // cap description length
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = { scrapeShopify, stripHtml }
