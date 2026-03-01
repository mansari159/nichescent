/**
 * Product matcher — links scraper_listings → products
 *
 * Run AFTER scrapers: node scripts/match-products.js
 *
 * Algorithm:
 * 1. For each pending scraper listing, try to find a matching product by name
 * 2. Uses fuzzy string matching (Fuse.js) with a confidence threshold
 * 3. Auto-creates new products for unmatched listings (can disable with --no-create)
 * 4. Updates current_prices for matched products
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const Fuse = require('fuse.js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MATCH_THRESHOLD = 0.35    // Fuse.js score (lower = more similar; 0 = perfect)
const AUTO_CREATE = !process.argv.includes('--no-create')

// ── Fragrance type inference ──────────────────────────────────────────────────

function inferType(text = '') {
  const t = text.toLowerCase()
  if (t.includes('bakhoor') || t.includes('incense')) return 'bakhoor'
  if (t.includes('attar') || t.includes(' oil') || t.includes('rollon')) return 'attar'
  if (t.includes('parfum') && !t.includes('eau')) return 'parfum'
  if (t.includes('edt') || t.includes('eau de toilette')) return 'edt'
  if (t.includes('body mist') || t.includes('body spray')) return 'body-mist'
  return 'edp'
}

function inferGender(text = '') {
  const t = text.toLowerCase()
  if (t.includes(' men') || t.includes(' him') || t.includes(' homme') || t.includes(' pour homme')) return 'men'
  if (t.includes(' women') || t.includes(' her') || t.includes(' femme') || t.includes(' pour femme')) return 'women'
  return 'unisex'
}

function extractSizeML(text = '') {
  const match = text.match(/(\d+)\s*ml/i)
  return match ? parseInt(match[1]) : null
}

function toSlug(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔗 Product Matcher starting...\n')

  // 1. Load all existing products
  const { data: existingProducts } = await supabase
    .from('products')
    .select('id, name, slug, brand_id, brand:brands(name)')

  const fuse = new Fuse(existingProducts ?? [], {
    keys: ['name'],
    threshold: MATCH_THRESHOLD,
    includeScore: true,
  })

  // 2. Load all brands (for brand lookup)
  const { data: brands } = await supabase.from('brands').select('id, name')
  const brandMap = Object.fromEntries((brands ?? []).map(b => [b.name.toLowerCase(), b.id]))

  // 3. Load all retailers
  const { data: retailers } = await supabase.from('retailers').select('id, slug')
  const retailerMap = Object.fromEntries((retailers ?? []).map(r => [r.slug, r.id]))

  // 4. Load pending listings
  const { data: listings } = await supabase
    .from('scraper_listings')
    .select('*')
    .eq('match_status', 'pending')
    .limit(500)

  if (!listings?.length) {
    console.log('No pending listings to match.')
    return
  }

  console.log(`Processing ${listings.length} pending listings...\n`)

  let matched = 0, created = 0, skipped = 0

  for (const listing of listings) {
    const retailerId = retailerMap[listing.retailer_id] ?? listing.retailer_id

    // Try fuzzy match
    const results = fuse.search(listing.raw_name)
    const best = results[0]
    const confidence = best ? 1 - best.score : 0

    let productId = null

    if (best && confidence >= (1 - MATCH_THRESHOLD)) {
      // Matched!
      productId = best.item.id
      matched++
    } else if (AUTO_CREATE) {
      // Create new product
      const slug = toSlug(listing.raw_name)
      const brandId = listing.raw_brand
        ? brandMap[listing.raw_brand.toLowerCase()] ?? null
        : null

      const { data: newProduct, error } = await supabase
        .from('products')
        .upsert({
          name: listing.raw_name,
          slug,
          brand_id: brandId,
          description: listing.raw_description,
          fragrance_type: inferType(`${listing.raw_name} ${listing.raw_data?.product_type ?? ''}`),
          gender: inferGender(listing.raw_name),
          size_ml: extractSizeML(listing.raw_data?.variant_title ?? listing.raw_name),
          image_url: listing.raw_image_url,
          is_active: true,
        }, { onConflict: 'slug', ignoreDuplicates: false })
        .select('id')
        .single()

      if (!error && newProduct) {
        productId = newProduct.id
        // Update Fuse index
        fuse.remove(doc => doc.id === newProduct.id)
        existingProducts.push({ id: newProduct.id, name: listing.raw_name, slug })
        fuse.add({ id: newProduct.id, name: listing.raw_name, slug })
        created++
      } else {
        console.warn(`  ⚠ Could not create product for: ${listing.raw_name}`, error?.message)
        skipped++
        continue
      }
    } else {
      skipped++
      continue
    }

    // Upsert current_prices
    const retailer = retailers?.find(r => r.id === listing.retailer_id || r.slug === listing.retailer_id)
    if (retailer && productId) {
      await supabase.from('current_prices').upsert({
        product_id: productId,
        retailer_id: retailer.id,
        price: listing.raw_price,
        currency: listing.raw_currency,
        price_usd: listing.raw_price, // TODO: convert non-USD using currency.ts
        product_url: listing.raw_url,
        in_stock: true,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'product_id,retailer_id' })
    }

    // Mark listing as matched
    await supabase
      .from('scraper_listings')
      .update({
        match_status: 'matched',
        matched_product_id: productId,
        match_confidence: confidence,
      })
      .eq('id', listing.id)
  }

  // Update lowest_price & retailers_count for affected products
const { error: rpcError } = await supabase.rpc('refresh_product_stats')

if (rpcError) {
  // Usually PGRST202 = function not found
  if (rpcError.code === 'PGRST202') {
    console.log('Note: refresh_product_stats RPC not found yet → skipping refresh')
  } else {
    console.warn('refresh_product_stats failed:', rpcError.message)
  }
}

  console.log(`\n✓ Done!`)
  console.log(`  Matched:  ${matched}`)
  console.log(`  Created:  ${created}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`\nTip: run with --no-create to skip auto-creating new products`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
