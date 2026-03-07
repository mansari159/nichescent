/**
 * Master scraper — runs all retailer scrapers
 *
 * Usage:
 *   node scripts/scrape-all.js                          # run all
 *   node scripts/scrape-all.js --retailer amouage       # single retailer
 *   node scripts/scrape-all.js --group uae              # run a group
 *   node scripts/scrape-all.js --dry-run                # scrape, no DB writes
 *
 * Groups: uae, saudi, pakistan, other, multi, all (default)
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// ── Existing scrapers ──────────────────────────────────────────────────────────
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

// ── UAE — Heritage / Accessible ───────────────────────────────────────────────
const { scrapeAmouage }             = require('./scrapers/amouage')
const { scrapeMaisonAlhambra }      = require('./scrapers/maison-alhambra')
const { scrapeArmaf }               = require('./scrapers/armaf')
const { scrapeParisCorner }         = require('./scrapers/paris-corner')
const { scrapeFragranceWorld }      = require('./scrapers/fragrance-world')
const { scrapeArdAlZaafaran }       = require('./scrapers/ard-al-zaafaran')
const { scrapeGulfOrchid }          = require('./scrapers/gulf-orchid')
const { scrapeYasPerfumes }         = require('./scrapers/yas-perfumes')
const { scrapeNabeel }              = require('./scrapers/nabeel')
const { scrapeArabiyatPrestige }    = require('./scrapers/arabiyat-prestige')
const { scrapeNaseem }              = require('./scrapers/naseem')
const { scrapeGhawali }             = require('./scrapers/ghawali')
const { scrapeSpiritOfDubai }       = require('./scrapers/spirit-of-dubai')
const { scrapeWidian }              = require('./scrapers/widian')
const { scrapeKhalis }              = require('./scrapers/khalis')
const { scrapeSapil }               = require('./scrapers/sapil')
const { scrapeReefPerfumes }        = require('./scrapers/reef-perfumes')
const { scrapeHamidi }              = require('./scrapers/hamidi')
const { scrapeOrientica }           = require('./scrapers/orientica')
const { scrapeMaisonAsrar }         = require('./scrapers/maison-asrar')
const { scrapeEmiratesPride }       = require('./scrapers/emirates-pride')
const { scrapeAttarCollection }     = require('./scrapers/attar-collection')
const { scrapeNavitus }             = require('./scrapers/navitus')
const { scrapeZimaya }              = require('./scrapers/zimaya')
const { scrapeKhadlaj }             = require('./scrapers/khadlaj')
const { scrapeRiiffs }              = require('./scrapers/riiffs')
const { scrapeRueBroca }            = require('./scrapers/rue-broca')
const { scrapeRayhaan }             = require('./scrapers/rayhaan')
const { scrapeEmper }               = require('./scrapers/emper')
const { scrapeFrenchAvenue }        = require('./scrapers/french-avenue')
const { scrapeLouisCardin }         = require('./scrapers/louis-cardin')
const { scrapeDumont }              = require('./scrapers/dumont')
const { scrapeMyPerfumes }          = require('./scrapers/my-perfumes')
const { scrapeKajal }               = require('./scrapers/kajal')
const { scrapeAzha }                = require('./scrapers/azha')
const { scrapeAlWataniah }          = require('./scrapers/al-wataniah')
const { scrapeSuroori }             = require('./scrapers/suroori')

// ── Saudi Arabia ──────────────────────────────────────────────────────────────
const { scrapeArabianOud }          = require('./scrapers/arabian-oud')
const { scrapeAbdulSamadAlQurashi } = require('./scrapers/abdul-samad-al-qurashi')
const { scrapeSurrati }             = require('./scrapers/surrati')
const { scrapeAlNuaim }             = require('./scrapers/al-nuaim')
const { scrapeAhmadAlMaghribi }     = require('./scrapers/ahmad-al-maghribi')

// ── Egypt / Morocco ───────────────────────────────────────────────────────────
const { scrapeAlRehab }             = require('./scrapers/al-rehab')
const { scrapeElNabil }             = require('./scrapers/el-nabil')

// ── Pakistan ──────────────────────────────────────────────────────────────────
const { scrapeJJunaidJamshed }      = require('./scrapers/j-junaid-jamshed')
const { scrapeBonanzaSatrangi }     = require('./scrapers/bonanza-satrangi')
const { scrapeScentsNStories }      = require('./scrapers/scents-n-stories')
const { scrapeSaeedGhani }          = require('./scrapers/saeed-ghani')
const { scrapeWbHemani }            = require('./scrapers/wb-hemani')
const { scrapeColish }              = require('./scrapers/colish')

// ── Indonesia ─────────────────────────────────────────────────────────────────
const { scrapeVelixir }             = require('./scrapers/velixir')

// ── Multi-brand retailers ─────────────────────────────────────────────────────
const { scrapeArabiaScents }        = require('./scrapers/arabiascents')
const { scrapeLuluatAlMusk }        = require('./scrapers/luluat-al-musk')
const { scrapeOudStore }            = require('./scrapers/oud-store')
const { scrapeEmiratiScents }       = require('./scrapers/emirati-scents')

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Registry ──────────────────────────────────────────────────────────────────
const SCRAPERS = {
  // UAE — established / heritage
  'lattafa-usa':        scrapeLattafa,
  'afnan':              scrapeAfnan,
  'dukhni':             scrapeDukhni,
  'swiss-arabian':      scrapeSwissArabian,
  'al-haramain':        scrapeAlHaramain,
  'gissah':             scrapeGissah,
  'assaf':              scrapeAssaf,
  'rasasi':             scrapeRasasi,
  'ajmal':              scrapeAjmal,
  'kayali':             scrapeKayali,
  'hind-al-oud':        scrapeHindAlOud,
  'ibraq':              scrapeIbraq,
  'nabeel':             scrapeNabeel,
  'arabiyat-prestige':  scrapeArabiyatPrestige,
  'naseem':             scrapeNaseem,
  'ghawali':            scrapeGhawali,
  'spirit-of-dubai':    scrapeSpiritOfDubai,
  'widian':             scrapeWidian,
  'khalis-perfumes':    scrapeKhalis,
  'sapil':              scrapeSapil,
  'reef-perfumes':      scrapeReefPerfumes,
  'hamidi':             scrapeHamidi,
  'orientica':          scrapeOrientica,
  'maison-asrar':       scrapeMaisonAsrar,
  'emirates-pride':     scrapeEmiratesPride,
  'attar-collection':   scrapeAttarCollection,
  'navitus':            scrapeNavitus,
  // UAE — dupe / accessible
  'maison-alhambra':    scrapeMaisonAlhambra,
  'armaf':              scrapeArmaf,
  'paris-corner':       scrapeParisCorner,
  'fragrance-world':    scrapeFragranceWorld,
  'ard-al-zaafaran':    scrapeArdAlZaafaran,
  'gulf-orchid':        scrapeGulfOrchid,
  'yas-perfumes':       scrapeYasPerfumes,
  'zimaya':             scrapeZimaya,
  'khadlaj':            scrapeKhadlaj,
  'riiffs':             scrapeRiiffs,
  'rue-broca':          scrapeRueBroca,
  'rayhaan':            scrapeRayhaan,
  'emper':              scrapeEmper,
  'french-avenue':      scrapeFrenchAvenue,
  'louis-cardin':       scrapeLouisCardin,
  'dumont':             scrapeDumont,
  'my-perfumes':        scrapeMyPerfumes,
  'kajal-perfumes':     scrapeKajal,
  'azha-perfumes':      scrapeAzha,
  'al-wataniah':        scrapeAlWataniah,
  'suroori':            scrapeSuroori,
  // Oman
  'amouage':            scrapeAmouage,
  // Saudi Arabia
  'arabian-oud':        scrapeArabianOud,
  'asa-qurashi':        scrapeAbdulSamadAlQurashi,
  'surrati':            scrapeSurrati,
  'al-nuaim':           scrapeAlNuaim,
  'ahmad-al-maghribi':  scrapeAhmadAlMaghribi,
  // Egypt
  'al-rehab':           scrapeAlRehab,
  // Morocco
  'el-nabil':           scrapeElNabil,
  // Pakistan
  'j-junaid-jamshed':   scrapeJJunaidJamshed,
  'bonanza-satrangi':   scrapeBonanzaSatrangi,
  'scents-n-stories':   scrapeScentsNStories,
  'saeed-ghani':        scrapeSaeedGhani,
  'wb-hemani':          scrapeWbHemani,
  'colish':             scrapeColish,
  // Indonesia
  'velixir':            scrapeVelixir,
  // Multi-brand retailers
  'arabia-scents':      scrapeArabiaScents,
  'luluat-al-musk':     scrapeLuluatAlMusk,
  'oud-store':          scrapeOudStore,
  'emirati-scents':     scrapeEmiratiScents,
}

// ── Groups ────────────────────────────────────────────────────────────────────
const GROUP_KEYS = {
  uae: [
    'lattafa-usa','afnan','dukhni','swiss-arabian','al-haramain','gissah','assaf',
    'rasasi','ajmal','kayali','hind-al-oud','ibraq','nabeel','arabiyat-prestige',
    'naseem','ghawali','spirit-of-dubai','widian','khalis-perfumes','sapil',
    'reef-perfumes','hamidi','orientica','maison-asrar','emirates-pride',
    'attar-collection','navitus','maison-alhambra','armaf','paris-corner',
    'fragrance-world','ard-al-zaafaran','gulf-orchid','yas-perfumes','zimaya',
    'khadlaj','riiffs','rue-broca','rayhaan','emper','french-avenue','louis-cardin',
    'dumont','my-perfumes','kajal-perfumes','azha-perfumes','al-wataniah','suroori',
  ],
  saudi:    ['amouage','arabian-oud','asa-qurashi','surrati','al-nuaim','ahmad-al-maghribi'],
  other:    ['al-rehab','el-nabil'],
  pakistan: ['j-junaid-jamshed','bonanza-satrangi','scents-n-stories','saeed-ghani','wb-hemani','colish'],
  indo:     ['velixir'],
  multi:    ['arabia-scents','luluat-al-musk','oud-store','emirati-scents'],
}

// ── Args ──────────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run')
const SINGLE  = process.argv.includes('--retailer')
  ? process.argv[process.argv.indexOf('--retailer') + 1] : null
const GROUP   = process.argv.includes('--group')
  ? process.argv[process.argv.indexOf('--group') + 1] : null

// ── DB save ───────────────────────────────────────────────────────────────────
async function saveListings(retailerSlug, listings) {
  const { data: retailer } = await supabase
    .from('retailers').select('id').eq('slug', retailerSlug).single()

  if (!retailer) {
    console.error(`  ✗ Retailer not found: ${retailerSlug} — run patch-013 in Supabase first`)
    return 0
  }

  await supabase.from('retailers')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('id', retailer.id)

  const BATCH = 100
  let saved = 0
  for (let i = 0; i < listings.length; i += BATCH) {
    const batch = listings.slice(i, i + BATCH).map(l => ({
      retailer_id: retailer.id, external_id: l.external_id,
      raw_name: l.raw_name, raw_brand: l.raw_brand,
      raw_price: l.raw_price, raw_currency: l.raw_currency,
      raw_description: l.raw_description, raw_image_url: l.raw_image_url,
      raw_url: l.raw_url, raw_data: l.raw_data,
      match_status: 'pending', last_scraped_at: new Date().toISOString(),
    }))
    const { error } = await supabase.from('scraper_listings')
      .upsert(batch, { onConflict: 'retailer_id,external_id', ignoreDuplicates: false })
    if (error) console.error(`  ✗ Batch error:`, error.message)
    else saved += batch.length
  }
  return saved
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(55)}`)
  console.log('  RareTrace Master Scraper')
  console.log(`  ${new Date().toLocaleString()} | ${Object.keys(SCRAPERS).length} scrapers registered`)
  if (DRY_RUN) console.log('  ⚠ DRY RUN — no DB writes')
  if (GROUP)   console.log(`  Group: ${GROUP}`)
  if (SINGLE)  console.log(`  Retailer: ${SINGLE}`)
  console.log(`${'═'.repeat(55)}\n`)

  let scraperEntries
  if (SINGLE) {
    if (!SCRAPERS[SINGLE]) {
      console.error(`Unknown: ${SINGLE}\nAvailable: ${Object.keys(SCRAPERS).join(', ')}`)
      process.exit(1)
    }
    scraperEntries = [[SINGLE, SCRAPERS[SINGLE]]]
  } else if (GROUP) {
    const keys = GROUP_KEYS[GROUP]
    if (!keys) {
      console.error(`Unknown group: ${GROUP}\nAvailable: ${Object.keys(GROUP_KEYS).join(', ')}`)
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
      const batches = Array.isArray(result) ? result : [result]
      for (const { retailerSlug, listings } of batches) {
        if (DRY_RUN) {
          console.log(`  [DRY RUN] ${retailerSlug}: ${listings.length} listings`)
        } else {
          const saved = await saveListings(retailerSlug, listings)
          console.log(`  💾 ${saved}/${listings.length} saved for ${retailerSlug}`)
          totalSaved += saved
        }
      }
    } catch (err) {
      console.error(`  ✗ ${slug}: ${err.message}`)
    }
  }

  if (!DRY_RUN) {
    console.log(`\n${'═'.repeat(55)}`)
    console.log(`✓ Total saved: ${totalSaved} listings`)
    console.log('\nNext: node scripts/match-products.js')
    console.log('      node scripts/backfill-vibes.js')
  }
  console.log(`${'═'.repeat(55)}\n`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
