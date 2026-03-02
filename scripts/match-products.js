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

// ── Currency conversion ───────────────────────────────────────────────────────

const RATES_TO_USD = {
  USD: 1,
  AED: 0.2723,  // 1 AED = ~$0.27
  SAR: 0.2667,  // 1 SAR = ~$0.27
  KWD: 3.2500,  // 1 KWD = ~$3.25
  BHD: 2.6525,
  OMR: 2.5974,
  QAR: 0.2747,
  GBP: 1.2700,
  EUR: 1.0850,
  INR: 0.0119,
}

function toUSD(price, currency = 'USD') {
  const rate = RATES_TO_USD[currency.toUpperCase()] ?? 1
  return Math.round(price * rate * 100) / 100
}

// ── Non-fragrance filter ──────────────────────────────────────────────────────

const NON_FRAGRANCE_KEYWORDS = [
  // Home / wax
  'candle', 'reed diffuser', 'wax melt', 'room spray', 'car freshener',
  'carpet freshener', 'fabric spray', 'laundry',
  // Body / skincare
  'body lotion', 'body cream', 'body wash', 'shower gel', 'hand cream',
  'hand wash', 'hand sanitizer', 'sanitizer',
  'lip balm', 'face cream', 'face wash', 'face scrub', 'moisturizer', 'serum',
  'hair oil', 'hair perfume', 'shampoo', 'conditioner', 'hair mask', 'hair serum',
  'body butter', 'body scrub', 'body gel', 'bath gel', 'bath salt',
  'foot cream', 'eye cream', 'toner', 'cleanser',
  // Deodorants — very common in MENA brands but are not fragrances
  'deodorant', ' deo ', 'deo spray', 'deo stick', 'antiperspirant',
  'deo roll', 'roll on deo',
  // Talc / powder
  'talcum', 'talc', 'body powder', 'perfumed talc', 'perfumed powder',
  // Sets & bundles
  'gift set', 'gift box', 'gift bag', 'sample set', 'discovery set',
  ' set |', '| set', 'sublime set', 'luxury set', 'collection set',
  'travel set', 'mini set', 'coffret',
  // Accessories / hardware
  'handbag', 'wallet', 'keychain', 'accessory', 'accessories',
  'bottle stopper', 'funnel', 'atomizer refill', 'empty bottle',
  'oil burner', 'bakhoor burner', 'incense burner', 'diffuser burner',
  'burner with', 'with burner', 'with free oil',
  'incense stick', 'incense cone', 'charcoal',
  // Fashion / merch
  't-shirt', 'mug', 'notebook', 'sunglasses', 'eyewear', 'glasses',
  // Soap
  'soap bar', 'bar soap', 'liquid soap',
  // Air fresheners (distinct from personal fragrance)
  'air freshener', 'air freshner', 'freshener spray',
  // Tissues / paper
  'tissue', 'facial tissue', 'wet wipe', 'wipe',
  // Refills (ambiguous but usually non-primary product)
  'refill pack', 'refill bottle',
]

function isFragrance(name = '', productType = '', tags = '') {
  const text = `${name} ${productType} ${tags}`.toLowerCase()
  for (const kw of NON_FRAGRANCE_KEYWORDS) {
    if (text.includes(kw)) return false
  }
  return true
}

// ── Fragrance type inference ──────────────────────────────────────────────────

function inferType(text = '') {
  const t = text.toLowerCase()
  if (t.includes('bakhoor') || t.includes('incense') || t.includes('bukhoor')) return 'bakhoor'
  if (t.includes('attar') || t.includes(' oil') || t.includes('rollon') || t.includes('roll-on') || t.includes('dahn al')) return 'attar'
  if ((t.includes('parfum') || t.includes('perfume')) && !t.includes('eau')) return 'parfum'
  if (t.includes('edt') || t.includes('eau de toilette')) return 'edt'
  if (t.includes('body mist') || t.includes('body spray') || t.includes('body lotion')) return 'body-mist'
  if (t.includes('edp') || t.includes('eau de parfum')) return 'edp'
  return 'edp'
}

// ── Gender inference (comprehensive MENA fragrance signals) ──────────────────

function inferGender(name = '', productType = '', tags = '', description = '') {
  const text = `${name} ${productType} ${tags} ${description}`.toLowerCase()

  // Strong MALE signals
  const maleSignals = [
    'for men', 'pour homme', 'pour him', " men's", ' men ',
    ' him ', ' his ', ' homme', ' masculin',
    'tobacco', 'leather', 'smoky', 'woody', 'vetiver',
    'oud for men', 'black oud', 'intense oud',
    'sport', 'aqua ', 'blu ', 'king', 'sultan', 'sheikh',
    'asad', // Arabic for lion — Lattafa Asad is mens
    'hawas', 'egzotika', 'club de nuit homme',
  ]

  // Strong FEMALE signals
  const femaleSignals = [
    'for women', 'pour femme', 'pour elle', " women's", ' women ',
    ' her ', ' hers ', ' femme', ' féminin',
    'floral', 'rose', 'jasmine', 'gardenia', 'lily', 'violet',
    'peony', 'magnolia', 'cherry blossom', 'fruity', 'frutal',
    'pink', 'bloom', 'blush', 'soft powder', 'powder',
    'lady', 'belle', 'femme fatale', 'princess', 'queen',
    'flora', 'florale', 'blossom', 'petals', 'sweet',
    'vanilla musk', 'candy', 'cotton',
    'khamrah' // Lattafa Khamrah — it's actually unisex but tagged women often
  ]

  // Explicit unisex signals — only EXPLICIT gender-neutral language, NOT scent notes
  const unisexSignals = [
    'unisex', 'for all', 'everyone', 'gender neutral', 'gender free',
    'him & her', 'her & him', 'men & women', 'women & men',
    'men and women', 'women and men',
  ]

  let maleScore = 0
  let femaleScore = 0
  let unisexScore = 0

  for (const sig of maleSignals)   if (text.includes(sig)) maleScore++
  for (const sig of femaleSignals) if (text.includes(sig)) femaleScore++
  for (const sig of unisexSignals) if (text.includes(sig)) unisexScore++

  // Decisive wins
  if (maleScore > femaleScore && maleScore >= 1) return 'men'
  if (femaleScore > maleScore && femaleScore >= 1) return 'women'
  if (unisexScore >= 2 || (maleScore === femaleScore && maleScore === 0)) return 'unisex'
  if (unisexScore >= 1 && maleScore === 0 && femaleScore === 0) return 'unisex'

  // Tiebreaker — MENA fragrances lean unisex by default
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
    .select('id, name, slug, brand_id')

  // Build per-brand Fuse indexes so matching never crosses brand boundaries
  // brandFuseMap: brandId (string) -> Fuse instance scoped to that brand only
  const brandFuseMap = new Map()
  for (const p of existingProducts ?? []) {
    const key = p.brand_id ?? '__unknown__'
    if (!brandFuseMap.has(key)) {
      brandFuseMap.set(key, new Fuse([], {
        keys: ['name'],
        threshold: MATCH_THRESHOLD,
        includeScore: true,
      }))
    }
    brandFuseMap.get(key).add(p)
  }

  // 2. Load all brands (for brand lookup)
  const { data: brands } = await supabase.from('brands').select('id, name')
  const brandMap = Object.fromEntries((brands ?? []).map(b => [b.name.toLowerCase(), b.id]))

  // 3. Load all retailers
  const { data: retailers } = await supabase.from('retailers').select('id, slug, base_currency')

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
const newProductIds = []

  for (const listing of listings) {
    // Skip non-fragrance products
    if (!isFragrance(listing.raw_name, listing.raw_data?.product_type, listing.raw_data?.tags)) {
      await supabase.from('scraper_listings').update({ match_status: 'rejected' }).eq('id', listing.id)
      skipped++
      continue
    }

    // Resolve brand for this listing
    const brandId = listing.raw_brand
      ? brandMap[listing.raw_brand.toLowerCase()] ?? null
      : null

    // Brand-scoped fuzzy match — NEVER match across brands
    const scopedFuse = brandFuseMap.get(brandId ?? '__unknown__')
    const results = scopedFuse ? scopedFuse.search(listing.raw_name) : []
    const best = results[0]
    const confidence = best ? 1 - (best.score ?? 1) : 0

    let productId = null

    if (best && confidence >= (1 - MATCH_THRESHOLD)) {
      // Matched within same brand
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
          gender: inferGender(
            listing.raw_name,
            listing.raw_data?.product_type ?? '',
            listing.raw_data?.tags ?? '',
            listing.raw_description ?? ''
          ),
          size_ml: extractSizeML(listing.raw_data?.variant_title ?? listing.raw_name),
          image_url: listing.raw_image_url,
          is_active: true,
        }, { onConflict: 'slug', ignoreDuplicates: false })
        .select('id')
        .single()

      if (!error && newProduct) {
        productId = newProduct.id
        newProductIds.push(newProduct.id)
        // Add new product to the brand-scoped Fuse index
        const newEntry = { id: newProduct.id, name: listing.raw_name, slug, brand_id: brandId }
        const fuseKey = brandId ?? '__unknown__'
        if (!brandFuseMap.has(fuseKey)) {
          brandFuseMap.set(fuseKey, new Fuse([], { keys: ['name'], threshold: MATCH_THRESHOLD, includeScore: true }))
        }
        brandFuseMap.get(fuseKey).add(newEntry)
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
    const retailer = retailers?.find(r => r.id === listing.retailer_id)
    if (retailer && productId) {
      const currency = listing.raw_currency || retailer.base_currency || 'USD'
      await supabase.from('current_prices').upsert({
        product_id: productId,
        retailer_id: retailer.id,
        price: listing.raw_price,
        currency,
        price_usd: toUSD(listing.raw_price, currency),
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

  // ── Auto-tag vibes for newly created products ────────────────────────────────
  if (newProductIds.length > 0) {
    console.log(`\n🌿 Tagging vibes for ${newProductIds.length} new product(s)...`)

    const VIBE_RULES = [
      { slug: 'woody-earthy',     keywords: ['oud','agarwood','sandalwood','cedar','vetiver','patchouli','wood','earthy','bakhoor','dehn','kalimat','incense'] },
      { slug: 'warm-spicy',       keywords: ['saffron','amber','cardamom','cinnamon','spic','oriental','warm','pepper','clove','nutmeg','shaghaf','khaltat'] },
      { slug: 'floral-romantic',  keywords: ['rose','jasmine','floral','flower','neroli','tuberose','orange blossom','peony','ylang','romantic','feminine','women'] },
      { slug: 'sweet-gourmand',   keywords: ['vanilla','tonka','caramel','honey','sweet','gourmand','candy','sugar','praline','chocolate','musk'] },
      { slug: 'smoky-intense',    keywords: ['leather','tobacco','smoke','intense','dark','noir','oud intense','extreme','black','midnight','tar','labdanum'] },
      { slug: 'fresh-clean',      keywords: ['citrus','bergamot','lemon','lime','aquatic','fresh','clean','grapefruit','marine','green','mint','lavender'] },
    ]

    function scoreProduct(product) {
      const text = [
        product.name ?? '',
        product.description ?? '',
        ...(product.notes_top ?? []),
        ...(product.notes_mid ?? []),
        ...(product.notes_base ?? []),
        ...(product.category_tags ?? []),
      ].join(' ').toLowerCase()

      return VIBE_RULES
        .map(rule => ({ slug: rule.slug, score: rule.keywords.filter(kw => text.includes(kw)).length }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
    }

    const { data: vibes } = await supabase.from('vibes').select('id, slug, emoji')
    const vibeMap = Object.fromEntries((vibes ?? []).map(v => [v.slug, v]))

    const { data: newProds } = await supabase
      .from('products')
      .select('id, name, description, notes_top, notes_mid, notes_base, category_tags')
      .in('id', newProductIds)

    let vibeTagged = 0
    for (const product of newProds ?? []) {
      const scored = scoreProduct(product)
      if (scored.length === 0) continue

      const rows = []
      const primaryVibe = vibeMap[scored[0].slug]
      if (primaryVibe) rows.push({ product_id: product.id, vibe_id: primaryVibe.id, strength: 'primary' })
      if (scored.length > 1) {
        const secondaryVibe = vibeMap[scored[1].slug]
        if (secondaryVibe) rows.push({ product_id: product.id, vibe_id: secondaryVibe.id, strength: 'secondary' })
      }

      if (rows.length > 0) {
        await supabase.from('product_vibes').upsert(rows, { onConflict: 'product_id,vibe_id' })
        if (primaryVibe) {
          await supabase.from('products').update({
            primary_vibe_slug: scored[0].slug,
            primary_vibe_emoji: primaryVibe.emoji,
          }).eq('id', product.id)
        }
        vibeTagged++
      }
    }

    console.log(`  ✓ Vibes tagged: ${vibeTagged}/${newProductIds.length}`)
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
