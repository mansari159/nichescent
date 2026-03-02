/**
 * New Brand Onboarding Script
 * Runs scrapers for the three newly added brand configs, saves listings,
 * triggers matching, then auto-assigns vibes to any untagged products.
 *
 * Usage:
 *   node scripts/run-new-brands.js              # full run
 *   node scripts/run-new-brands.js --dry-run    # scrape but don't save
 *   node scripts/run-new-brands.js --skip-vibes # skip vibe backfill step
 *   node scripts/run-new-brands.js --brand kayali  # single brand only
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { scrapeIbraq }     = require('./scrapers/ibraq')
const { scrapeHindAlOud } = require('./scrapers/hind-al-oud')
const { scrapeKayali }    = require('./scrapers/kayali')

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── Config ───────────────────────────────────────────────────────────────────
const NEW_SCRAPERS = {
  ibraq:        { fn: scrapeIbraq,     label: 'Ibrahim Al Qurashi (Ibraq)' },
  'hind-al-oud': { fn: scrapeHindAlOud, label: 'Hind Al Oud'               },
  kayali:       { fn: scrapeKayali,    label: 'Kayali'                     },
}

const DRY_RUN    = process.argv.includes('--dry-run')
const SKIP_VIBES = process.argv.includes('--skip-vibes')
const SINGLE     = process.argv.includes('--brand')
  ? process.argv[process.argv.indexOf('--brand') + 1]
  : null

// ─── Vibe rules (mirrors backfill-vibes.js) ───────────────────────────────────
const VIBE_RULES = [
  {
    slug: 'fresh-clean', emoji: '💧',
    keywords: ['fresh', 'clean', 'aqua', 'marine', 'ocean', 'green', 'citrus',
               'bergamot', 'mint', 'cucumber', 'watery', 'light', 'airy'],
  },
  {
    slug: 'warm-spicy', emoji: '🔥',
    keywords: ['spicy', 'warm', 'pepper', 'cardamom', 'cinnamon', 'ginger',
               'saffron', 'clove', 'nutmeg', 'amber', 'incense', 'oriental',
               'middle eastern', 'arabic', 'khaleeji'],
  },
  {
    slug: 'floral-romantic', emoji: '🌹',
    keywords: ['floral', 'rose', 'jasmine', 'lily', 'peony', 'violet',
               'iris', 'gardenia', 'magnolia', 'ylang', 'romantic', 'feminine', 'bouquet'],
  },
  {
    slug: 'woody-earthy', emoji: '🌿',
    keywords: ['woody', 'wood', 'oud', 'cedar', 'sandalwood', 'vetiver',
               'patchouli', 'earthy', 'forest', 'bark', 'timber', 'resinous', 'bakhoor'],
  },
  {
    slug: 'sweet-gourmand', emoji: '🍯',
    keywords: ['sweet', 'vanilla', 'caramel', 'honey', 'chocolate', 'gourmand',
               'candy', 'sugar', 'dessert', 'praline', 'coconut', 'tonka', 'marshmallow'],
  },
  {
    slug: 'smoky-intense', emoji: '🖤',
    keywords: ['smoky', 'smoke', 'leather', 'dark', 'intense', 'heavy',
               'tobacco', 'tar', 'charcoal', 'burnt', 'campfire', 'deep', 'bold'],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreVibes(text) {
  const lower = text.toLowerCase()
  const scores = {}
  for (const vibe of VIBE_RULES) {
    scores[vibe.slug] = vibe.keywords.filter(kw => lower.includes(kw)).length
  }
  return scores
}

function topVibes(scores, minScore = 1) {
  return Object.entries(scores)
    .filter(([, s]) => s >= minScore)
    .sort(([, a], [, b]) => b - a)
}

// ─── Save listings to DB ──────────────────────────────────────────────────────
async function saveListings(retailerSlug, listings) {
  const { data: retailer } = await supabase
    .from('retailers')
    .select('id')
    .eq('slug', retailerSlug)
    .single()

  if (!retailer) {
    console.warn(`  ⚠ Retailer not found in DB: "${retailerSlug}"`)
    console.warn('    Add it via supabase/schema.sql seed data or the Supabase dashboard.')
    return 0
  }

  await supabase
    .from('retailers')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('id', retailer.id)

  const BATCH = 100
  let saved = 0

  for (let i = 0; i < listings.length; i += BATCH) {
    const batch = listings.slice(i, i + BATCH).map(l => ({
      retailer_id:      retailer.id,
      external_id:      l.external_id,
      raw_name:         l.raw_name,
      raw_brand:        l.raw_brand,
      raw_price:        l.raw_price,
      raw_currency:     l.raw_currency,
      raw_description:  l.raw_description,
      raw_image_url:    l.raw_image_url,
      raw_url:          l.raw_url,
      raw_data:         l.raw_data,
      match_status:     'pending',
      last_scraped_at:  new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('scraper_listings')
      .upsert(batch, { onConflict: 'retailer_id,external_id', ignoreDuplicates: false })

    if (error) console.error(`  ✗ Batch error:`, error.message)
    else saved += batch.length
  }

  return saved
}

// ─── Backfill vibes for untagged products ─────────────────────────────────────
async function backfillVibesForUntagged() {
  console.log('\n  Checking for untagged products to auto-assign vibes...')

  // Check if vibes table exists
  const { data: vibes, error: vibesErr } = await supabase
    .from('vibes')
    .select('id, slug, emoji')

  if (vibesErr) {
    console.warn('  ⚠ Vibes table not found — skipping vibe assignment.')
    console.warn('    Run: psql ... < supabase/patch-007-vibes-notes.sql first.')
    return
  }

  const vibeMap = Object.fromEntries(vibes.map(v => [v.slug, v]))

  // Find products with no primary_vibe_slug
  const { data: untagged, error } = await supabase
    .from('products')
    .select('id, name, description, fragrance_type')
    .is('primary_vibe_slug', null)
    .eq('is_active', true)

  if (error || !untagged?.length) {
    console.log('  ✓ No untagged products found.')
    return
  }

  console.log(`  Found ${untagged.length} untagged product(s). Assigning vibes...`)

  let tagged = 0
  const noMatch = []

  for (const product of untagged) {
    const text = [
      product.name,
      product.description,
      product.fragrance_type,
    ].filter(Boolean).join(' ')

    const scores = scoreVibes(text)
    const ranked = topVibes(scores)

    if (!ranked.length) {
      noMatch.push(product.name)
      continue
    }

    const [primarySlug] = ranked[0]
    const primaryVibe = vibeMap[primarySlug]
    if (!primaryVibe) continue

    // Upsert primary vibe in product_vibes
    await supabase.from('product_vibes').upsert({
      product_id: product.id,
      vibe_id:    primaryVibe.id,
      strength:   'primary',
    }, { onConflict: 'product_id,vibe_id' })

    // Optionally assign secondary vibe
    if (ranked.length > 1) {
      const [secondarySlug] = ranked[1]
      const secondaryVibe = vibeMap[secondarySlug]
      if (secondaryVibe && secondaryVibe.id !== primaryVibe.id) {
        await supabase.from('product_vibes').upsert({
          product_id: product.id,
          vibe_id:    secondaryVibe.id,
          strength:   'secondary',
        }, { onConflict: 'product_id,vibe_id' })
      }
    }

    // Update denormalized columns
    await supabase
      .from('products')
      .update({
        primary_vibe_slug:  primarySlug,
        primary_vibe_emoji: primaryVibe.emoji,
      })
      .eq('id', product.id)

    tagged++
  }

  console.log(`  ✓ Auto-assigned vibes to ${tagged} product(s)`)
  if (noMatch.length) {
    console.log(`  ℹ ${noMatch.length} product(s) had no keyword match (may need manual review):`)
    noMatch.slice(0, 10).forEach(name => console.log(`    - ${name}`))
    if (noMatch.length > 10) console.log(`    ... and ${noMatch.length - 10} more`)
  }
}

// ─── Report ───────────────────────────────────────────────────────────────────
function printReport(results) {
  console.log(`\n${'═'.repeat(52)}`)
  console.log('  NEW BRAND ONBOARDING — SUMMARY')
  console.log(`${'═'.repeat(52)}`)

  let grandTotal = 0
  for (const { label, scraped, saved, skipped } of results) {
    const status = saved > 0 ? '✓' : skipped ? '⏭' : '✗'
    console.log(`\n  ${status} ${label}`)
    console.log(`    Scraped: ${scraped}  |  Saved: ${saved}`)
  }

  console.log(`\n  Grand total listings saved: ${results.reduce((s, r) => s + r.saved, 0)}`)
  console.log(`${'═'.repeat(52)}\n`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(52)}`)
  console.log('  RareTrace — New Brand Onboarding')
  console.log(`  ${new Date().toLocaleString()}`)
  if (DRY_RUN)    console.log('  ⚠ DRY RUN — no DB writes')
  if (SKIP_VIBES) console.log('  ⚠ SKIP_VIBES — skipping vibe backfill')
  if (SINGLE)     console.log(`  Running single brand: ${SINGLE}`)
  console.log(`${'═'.repeat(52)}\n`)

  if (SINGLE && !NEW_SCRAPERS[SINGLE]) {
    console.error(`Unknown brand key: "${SINGLE}"`)
    console.error(`Available: ${Object.keys(NEW_SCRAPERS).join(', ')}`)
    process.exit(1)
  }

  const scrapers = SINGLE
    ? [[SINGLE, NEW_SCRAPERS[SINGLE]]]
    : Object.entries(NEW_SCRAPERS)

  const results = []

  for (const [key, { fn, label }] of scrapers) {
    console.log(`${'─'.repeat(52)}`)
    console.log(`▶ ${label}`)

    try {
      const scraperResults = await fn()
      // scrapers can return array of { retailerSlug, listings } or single object
      const batches = Array.isArray(scraperResults) ? scraperResults : [scraperResults]

      let totalScraped = 0
      let totalSaved   = 0

      for (const { retailerSlug, listings } of batches) {
        totalScraped += listings.length

        if (DRY_RUN) {
          console.log(`  [DRY RUN] ${retailerSlug}: ${listings.length} listings`)
          if (listings[0]) console.log('  Sample:', JSON.stringify(listings[0], null, 2))
          totalSaved += listings.length // count as "would save"
        } else {
          const saved = await saveListings(retailerSlug, listings)
          console.log(`  💾 ${retailerSlug}: ${saved}/${listings.length} saved`)
          totalSaved += saved
        }
      }

      results.push({ label, scraped: totalScraped, saved: totalSaved, skipped: false })
    } catch (err) {
      console.error(`  ✗ Error scraping ${key}:`, err.message)
      results.push({ label, scraped: 0, saved: 0, skipped: false, error: err.message })
    }
  }

  // ─── Auto-assign vibes to newly added products ─────────────────────────────
  if (!DRY_RUN && !SKIP_VIBES) {
    await backfillVibesForUntagged()
  }

  printReport(results)

  if (!DRY_RUN) {
    console.log('Next steps:')
    console.log('  1. Run the product matcher to link new listings → products:')
    console.log('       node scripts/match-products.js')
    console.log('  2. If patch-007 has been applied, run full note backfill:')
    console.log('       node scripts/backfill-notes.js')
    console.log('  3. Check the Supabase dashboard for any listings still in "pending" match_status.')
    console.log()
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
