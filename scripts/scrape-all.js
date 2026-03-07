/**
 * Master scraper — runs all retailer scrapers then triggers product matching
 *
 * Usage:
 *   node scripts/scrape-all.js                          # run all scrapers
 *   node scripts/scrape-all.js --retailer arabian-oud   # run one scraper
 *   node scripts/scrape-all.js --dry-run                # scrape but don't save to DB
 *   node scripts/scrape-all.js --group mena             # run a brand group
 *
 * Groups: mena, pakistan, multi, all (default)
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// ── Brand direct stores ────────────────────────────────────────────────────────
const { scrapeLattafa }             = require('./scrapers/lattafa')
const { scrapeAfnan }               = require('./scrapers/afnan')
const { scrapeDukhni }              = require('./scrapers/dukhni')
const { scrapeSwissArabian }        = require('./scrapers/swiss-arabian')
const { scrapeAlHaramain }          = require('./scrapers/al-haramain')
const { scrapeGissah }              = require('./scrapers/gissah')
const { scrapeAssaf }               = require('./scrapers/assaf')
const { scrapeRasasi }              = require('./scrapers/rasasi')
const { scrapeAjmal }               = require('./scrapers/ajmal')
const { scrapeKayali }              = require('./scrapers/kayali')
const { scrapeHindAlOud }           = require('./scrapers/hind-al-oud')
const { scrapeIbraq }               = require('./scrapers/ibraq')

// Week 1 new scrapers
const { scrapeAmouage }             = require('./scrapers/amouage')
const { scrapeMaisonAlhambra }      = require('./scrapers/maison-alhambra')
const { scrapeArmaf }               = require('./scrapers/armaf')
const { scrapeParisCorner }         = require('./scrapers/paris-corner')
const { scrapeFragranceWorld }      = require('./scrapers/fragrance-world')
const { scrapeArdAlZaafaran }       = require('./scrapers/ard-al-zaafaran')

// Week 2 new scrapers
const { scrapeArabianOud }          = require('./scrapers/arabian-oud')
const { scrapeAbdulSamadAlQurashi } = require('./scrapers/abdul-samad-al-qurashi')
const { scrapeNabeel }              = require('./scrapers/nabeel')
const { scrapeSurrati }             = require('./scrapers/surrati')
const { scrapeGulfOrchid }          = require('./scrapers/gulf-orchid')
const { scrapeYasPerfumes }         = require('./scrapers/yas-perfumes')
const { scrapeAlNuaim }             = require('./scrapers/al-nuaim')
const { scrapeAlRehab }             = require('./scrapers/al-rehab')

// Week 3 new scrapers
const { scrapeJJunaidJamshed }      = require('./scrapers/j-junaid-jamshed')
const { scrapeBonanzaSatrangi }     = require('./scrapers/bonanza-satrangi')
const { scrapeElNabil }             = require('./scrapers/el-nabil')

// Multi-brand retailer scrapers
const { scrapeArabiaScents }        = require('./scrapers/arabiascents')
const { scrapeLuluatAlMusk }        = require('./scrapers/luluat-al-musk')
const { scrapeOudStore }            = require('./scrapers/oud-store')
const { scrapeEmiratiScents }       = require('./scrapers/emirati-scents')

// ── Supabase client ────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Scraper registry ───────────────────────────────────────────────────────────
// Scrapers may return: { retailerSlug, listings } OR Array<{ retailerSlug, listings }>
// main() handles both transparently.

const SCRAPERS = {
  // ── UAE brands ───────────────────────────────────────────────────────────────
  'lattafa-usa':     scrapeLattafa,
  'afnan':           scrapeAfnan,
  'dukhni':          scrapeDukhni,
  'swiss-arabian':   scrapeSwissArabian,
  'al-haramain':     scrapeAlHaramain,
  'gissah':          scrapeGissah,
  'assaf':           scrapeAssaf,
  'kayali':          scrapeKayali,           // returns array
  'maison-alhambra': scrapeMaisonAlhambra,
  'armaf':           scrapeArmaf,
  'paris-corner':    scrapeParisCorner,
  'fragrance-world': scrapeFragranceWorld,
  'ard-al-zaafaran': scrapeArdAlZaafaran,
  'gulf-orchid':     scrapeGulfOrchid,
  'yas-perfumes':    scrapeYasPerfumes,
  'nabeel':          scrapeNabeel,

  // ── Oman brands ──────────────────────────────────────────────────────────────
  'amouage':         scrapeAmouage,

  // ── Saudi brands ─────────────────────────────────────────────────────────────
  'rasasi':          scrapeRasasi,
  'ajmal':           scrapeAjmal,
  'ibraq':           scrapeIbraq,            // returns array
  'arabian-oud':     scrapeArabianOud,
  'asa-qurashi':     scrapeAbdulSamadAlQurashi,
  'surrati':         scrapeSurrati,
  'al-nuaim':        scrapeAlNuaim,

  // ── Bahrain brands ───────────────────────────────────────────────────────────
  'hind-al-oud':     scrapeHindAlOud,        // returns array

  // ── Egypt brands ─────────────────────────────────────────────────────────────
  'al-rehab':        scrapeAlRehab,

  // ── Morocco brands ───────────────────────────────────────────────────────────
  'el-nabil':        scrapeElNabil,

  // ── Pakistan brands ──────────────────────────────────────────────────────────
  'j-junaid-jamshed': scrapeJJunaidJamshed,
  'bonanza-satrangi': scrapeBonanzaSatrangi,

  // ── Multi-brand retailers ────────────────────────────────────────────────────
  'arabia-scents':   scrapeArabiaScents,
  'luluat-al-musk':  scrapeLuluatAlMusk,
  'oud-store':       scrapeOudStore,
  'emirati-scents':  scrapeEmiratiScents,
}

// ── Brand groups for --group flag ──────────────────────────────────────────────
const GROUP_KEYS = {
  mena: [
    'lattafa-usa','afnan','dukhni','swiss-arabian','al-haramain','gissah','assaf',
    'kayali','maison-alhambra','armaf','paris-corner','fragrance-world',
    'ard-al-zaafaran','gulf-orchid','yas-perfumes','nabeel',
    'amouage','rasasi','ajmal','ibraq','arabian-oud','asa-qurashi','surrati',
    'al-nuaim','hind-al-oud','al-rehab','el-nabil',
  ],
  pakistan: ['j-junaid-jamshed', 'bonanza-satrangi'],
  multi:    ['arabia-scents', 'luluat-al-musk', 'oud-store', 'emirati-scents'],
}

// ── Argument parsing ───────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run')
const SINGLE  = process.argv.includes('--retailer')
  ? process.argv[process.argv.indexOf('--retailer') + 1]
  : null
const GROUP   = process.argv.includes('--group')
  ? process.argv[process.argv.indexOf('--group') + 1]
  : null

// ── DB helpers ─────────────────────────────────────────────────────────────────

async function saveListings(retailerSlug, listings) {
  const { data: retailer } = await supabase
    .from('retailers')
    .select('id')
    .eq('slug', retailerSlug)
    .single()

  if (!retailer) {
    console.error(`  ✗ Retailer not found in DB: ${retailerSlug}`)
    console.error('  Run supabase/patch-013-retailers-seed.sql first!')
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
      retailer_id:     retailer.id,
      external_id:     l.external_id,
      raw_name:        l.raw_name,
      raw_brand:       l.raw_brand,
      raw_price:       l.raw_price,
      raw_currency:    l.raw_currency,
      raw_description: l.raw_description,
      raw_image_url:   l.raw_image_url,
      raw_url:         l.raw_url,
      raw_data:        l.raw_data,
      match_status:    'pending',
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

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${'═'.repeat(55)}`)
  console.log('  RareTrace Master Scraper')
  console.log(`  ${new Date().toLocaleString()}`)
  if (DRY_RUN) console.log('  ⚠ DRY RUN MODE — no DB writes')
  if (GROUP)   console.log(`  Group: ${GROUP}`)
  if (SINGLE)  console.log(`  Single retailer: ${SINGLE}`)
  console.log(`${'═'.repeat(55)}\n`)

  // Determine which scrapers to run
  let scraperEntries

  if (SINGLE) {
    if (!SCRAPERS[SINGLE]) {
      console.error(`Unknown retailer: ${SINGLE}`)
      console.error(`Available: ${Object.keys(SCRAPERS).join(', ')}`)
      process.exit(1)
    }
    scraperEntries = [[SINGLE, SCRAPERS[SINGLE]]]
  } else if (GROUP) {
    const keys = GROUP_KEYS[GROUP]
    if (!keys) {
      console.error(`Unknown group: ${GROUP}`)
      console.error(`Available groups: ${Object.keys(GROUP_KEYS).join(', ')}, all`)
      process.exit(1)
    }
    scraperEntries = keys.map(k => [k, SCRAPERS[k]]).filter(([, fn]) => fn)
  } else {
    scraperEntries = Object.entries(SCRAPERS)
  }

  let totalSaved = 0

  for (const [slug, scraper] of scraperEntries) {
    console.log(`\n${'─'.repeat(45)}`)
    try {
      const result = await scraper()

      // Handle both single { retailerSlug, listings } and Array<{ retailerSlug, listings }>
      const batches = Array.isArray(result) ? result : [result]

      for (const { retailerSlug, listings } of batches) {
        if (DRY_RUN) {
          console.log(`  [DRY RUN] ${retailerSlug}: ${listings.length} listings`)
          if (listings[0]) {
            console.log('  Sample:', JSON.stringify(listings[0], null, 2))
          }
        } else {
          const saved = await saveListings(retailerSlug, listings)
          console.log(`  💾 Saved ${saved}/${listings.length} listings for ${retailerSlug}`)
          totalSaved += saved
        }
      }
    } catch (err) {
      console.error(`  ✗ Error scraping ${slug}:`, err.message)
    }
  }

  if (!DRY_RUN) {
    console.log(`\n${'═'.repeat(55)}`)
    console.log(`✓ Total saved: ${totalSaved} listings`)
    console.log('\nNext steps:')
    console.log('  1. Match listings → products:')
    console.log('       node scripts/match-products.js')
    console.log('  2. Backfill vibe/note tags:')
    console.log('       node scripts/backfill-vibes.js')
    console.log('       node scripts/backfill-notes.js')
    console.log('  3. Update exchange rates:')
    console.log('       node scripts/update-exchange-rates.js')
  }

  console.log(`${'═'.repeat(55)}\n`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
