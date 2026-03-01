/**
 * Master scraper — runs all retailer scrapers then triggers product matching
 *
 * Usage:
 *   node scripts/scrape-all.js              # run all scrapers
 *   node scripts/scrape-all.js --retailer lattafa-usa  # run one scraper
 *   node scripts/scrape-all.js --dry-run    # scrape but don't save to DB
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { scrapeLattafa }      = require('./scrapers/lattafa')
const { scrapeAfnan }        = require('./scrapers/afnan')
const { scrapeDukhni }       = require('./scrapers/dukhni')
const { scrapeSwissArabian } = require('./scrapers/swiss-arabian')
const { scrapeAlHaramain }   = require('./scrapers/al-haramain')
const { scrapeGissah }       = require('./scrapers/gissah')
const { scrapeAssaf }        = require('./scrapers/assaf')
const { scrapeRasasi }       = require('./scrapers/rasasi')
const { scrapeAjmal }        = require('./scrapers/ajmal')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SCRAPERS = {
  'lattafa-usa':   scrapeLattafa,
  'afnan':         scrapeAfnan,
  'dukhni':        scrapeDukhni,
  'swiss-arabian': scrapeSwissArabian,
  'al-haramain':   scrapeAlHaramain,
  'gissah':        scrapeGissah,
  'assaf':         scrapeAssaf,
  'rasasi':        scrapeRasasi,
  'ajmal':         scrapeAjmal,
}

const DRY_RUN = process.argv.includes('--dry-run')
const SINGLE = process.argv.includes('--retailer')
  ? process.argv[process.argv.indexOf('--retailer') + 1]
  : null

async function saveListings(retailerSlug, listings) {
  // Get retailer ID
  const { data: retailer } = await supabase
    .from('retailers')
    .select('id')
    .eq('slug', retailerSlug)
    .single()

  if (!retailer) {
    console.error(`  ✗ Retailer not found in DB: ${retailerSlug}`)
    console.error('  Make sure you ran the schema.sql seed data first!')
    return 0
  }

  // Update last_scraped_at
  await supabase
    .from('retailers')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('id', retailer.id)

  // Upsert listings in batches of 100
  const BATCH = 100
  let saved = 0

  for (let i = 0; i < listings.length; i += BATCH) {
    const batch = listings.slice(i, i + BATCH).map(l => ({
      retailer_id: retailer.id,
      external_id: l.external_id,
      raw_name: l.raw_name,
      raw_brand: l.raw_brand,
      raw_price: l.raw_price,
      raw_currency: l.raw_currency,
      raw_description: l.raw_description,
      raw_image_url: l.raw_image_url,
      raw_url: l.raw_url,
      raw_data: l.raw_data,
      match_status: 'pending',
      last_scraped_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('scraper_listings')
      .upsert(batch, { onConflict: 'retailer_id,external_id', ignoreDuplicates: false })

    if (error) {
      console.error(`  ✗ Batch save error:`, error.message)
    } else {
      saved += batch.length
    }
  }

  return saved
}

async function main() {
  console.log(`\n${'═'.repeat(50)}`)
  console.log('  RareTrace Scraper')
  console.log(`  ${new Date().toLocaleString()}`)
  if (DRY_RUN) console.log('  DRY RUN MODE — no DB writes')
  console.log(`${'═'.repeat(50)}\n`)

  const scrapers = SINGLE
    ? [[SINGLE, SCRAPERS[SINGLE]]]
    : Object.entries(SCRAPERS)

  if (SINGLE && !SCRAPERS[SINGLE]) {
    console.error(`Unknown retailer: ${SINGLE}`)
    console.error(`Available: ${Object.keys(SCRAPERS).join(', ')}`)
    process.exit(1)
  }

  let totalSaved = 0

  for (const [slug, scraper] of scrapers) {
    console.log(`\n${'─'.repeat(40)}`)
    try {
      const { retailerSlug, listings } = await scraper()

      if (DRY_RUN) {
        console.log(`  [DRY RUN] Would save ${listings.length} listings for ${retailerSlug}`)
        if (listings.length > 0) {
          console.log('  Sample:', JSON.stringify(listings[0], null, 2))
        }
      } else {
        const saved = await saveListings(retailerSlug, listings)
        console.log(`  💾 Saved ${saved}/${listings.length} listings for ${retailerSlug}`)
        totalSaved += saved
      }
    } catch (err) {
      console.error(`  ✗ Error scraping ${slug}:`, err.message)
    }
  }

  if (!DRY_RUN) {
    console.log(`\n${'═'.repeat(50)}`)
    console.log(`✓ Total saved: ${totalSaved} listings`)
    console.log('\nNext step: run product matcher to link listings → products')
    console.log('  node scripts/match-products.js')
  }

  console.log(`${'═'.repeat(50)}\n`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
