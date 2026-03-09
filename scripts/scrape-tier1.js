/**
 * Tier 1 Brand Bulk Scraper — targets 1,000+ fragrances
 * ───────────────────────────────────────────────────────
 * Runs all high-volume scraper brands in sequence,
 * saves listings, runs the matcher, then backfills vibes.
 *
 * Tier 1 targets (by volume):
 *   Lattafa       150+    already has scraper
 *   Ajmal         100+    already has scraper
 *   Rasasi         80+    already has scraper
 *   Swiss Arabian  70+    already has scraper
 *   Gissah         97     already has scraper
 *   Al Haramain    80+    already has scraper
 *   Armaf          80+    already has scraper
 *   Afnan          60+    already has scraper
 *   Khadlaj        60+    already has scraper
 *   Maison Alhambra 60+   already has scraper
 *   Ard Al Zaafaran 50+   already has scraper
 *   Paris Corner   50+    already has scraper
 *   Fragrance World 40+   already has scraper
 *   Riiffs         40+    already has scraper
 *   Amouage        30+    already has scraper
 *   + 40 more brands      already have scrapers
 *
 * Usage:
 *   node scripts/scrape-tier1.js               # full scrape + match + vibes
 *   node scripts/scrape-tier1.js --scrape-only # scrape but skip match step
 *   node scripts/scrape-tier1.js --dry-run     # scrape, print counts, no writes
 *   node scripts/scrape-tier1.js --brand lattafa  # single brand only
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { execSync } = require('child_process')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DRY_RUN     = process.argv.includes('--dry-run')
const SCRAPE_ONLY = process.argv.includes('--scrape-only')
const SINGLE      = process.argv.includes('--brand')
  ? process.argv[process.argv.indexOf('--brand') + 1]
  : null

// ─── Scraper imports ──────────────────────────────────────────────────────────
const { scrapeLattafa }           = require('./scrapers/lattafa')
const { scrapeAjmal }             = require('./scrapers/ajmal')
const { scrapeRasasi }            = require('./scrapers/rasasi')
const { scrapeSwissArabian }      = require('./scrapers/swiss-arabian')
const { scrapeGissah }            = require('./scrapers/gissah')
const { scrapeAlHaramain }        = require('./scrapers/al-haramain')
const { scrapeArmaf }             = require('./scrapers/armaf')
const { scrapeAfnan }             = require('./scrapers/afnan')
const { scrapeKhadlaj }           = require('./scrapers/khadlaj')
const { scrapeMaisonAlhambra }    = require('./scrapers/maison-alhambra')
const { scrapeArdAlZaafaran }     = require('./scrapers/ard-al-zaafaran')
const { scrapeParisCorner }       = require('./scrapers/paris-corner')
const { scrapeFragranceWorld }    = require('./scrapers/fragrance-world')
const { scrapeRiiffs }            = require('./scrapers/riiffs')
const { scrapeAmouage }           = require('./scrapers/amouage')
const { scrapeKayali }            = require('./scrapers/kayali')
const { scrapeArabianOud }        = require('./scrapers/arabian-oud')
const { scrapeAbdulSamadAlQurashi } = require('./scrapers/abdul-samad-al-qurashi')
const { scrapeSurrati }           = require('./scrapers/surrati')
const { scrapeAlNuaim }           = require('./scrapers/al-nuaim')
const { scrapeAhmadAlMaghribi }   = require('./scrapers/ahmad-al-maghribi')
const { scrapeAlRehab }           = require('./scrapers/al-rehab')
const { scrapeElNabil }           = require('./scrapers/el-nabil')
const { scrapeNabeel }            = require('./scrapers/nabeel')
const { scrapeArabiyatPrestige }  = require('./scrapers/arabiyat-prestige')
const { scrapeGulfOrchid }        = require('./scrapers/gulf-orchid')
const { scrapeYasPerfumes }       = require('./scrapers/yas-perfumes')
const { scrapeNaseem }            = require('./scrapers/naseem')
const { scrapeGhawali }           = require('./scrapers/ghawali')
const { scrapeSpiritOfDubai }     = require('./scrapers/spirit-of-dubai')
const { scrapeWidian }            = require('./scrapers/widian')
const { scrapeKhalis }            = require('./scrapers/khalis')
const { scrapeSapil }             = require('./scrapers/sapil')
const { scrapeReefPerfumes }      = require('./scrapers/reef-perfumes')
const { scrapeHamidi }            = require('./scrapers/hamidi')
const { scrapeOrientica }         = require('./scrapers/orientica')
const { scrapeMaisonAsrar }       = require('./scrapers/maison-asrar')
const { scrapeAttarCollection }   = require('./scrapers/attar-collection')
const { scrapeNavitus }           = require('./scrapers/navitus')
const { scrapeZimaya }            = require('./scrapers/zimaya')
const { scrapeRueBroca }          = require('./scrapers/rue-broca')
const { scrapeRayhaan }           = require('./scrapers/rayhaan')
const { scrapeEmper }             = require('./scrapers/emper')
const { scrapeFrenchAvenue }      = require('./scrapers/french-avenue')
const { scrapeLouisCardin }       = require('./scrapers/louis-cardin')
const { scrapeDumont }            = require('./scrapers/dumont')
const { scrapeMyPerfumes }        = require('./scrapers/my-perfumes')
const { scrapeKajal }             = require('./scrapers/kajal')
const { scrapeAzha }              = require('./scrapers/azha')
const { scrapeAlWataniah }        = require('./scrapers/al-wataniah')
const { scrapeSuroori }           = require('./scrapers/suroori')
const { scrapeAssaf }             = require('./scrapers/assaf')
const { scrapeHindAlOud }         = require('./scrapers/hind-al-oud')
const { scrapeIbraq }             = require('./scrapers/ibraq')
const { scrapeDukhni }            = require('./scrapers/dukhni')
const { scrapeEmiratesPride }     = require('./scrapers/emirates-pride')

// ─── Tier 1 scraper registry (highest volume first) ──────────────────────────
const SCRAPERS = [
  // ── Volume leaders (50+ products each) ──
  { key: 'lattafa',          fn: scrapeLattafa,          label: 'Lattafa',            tier: 1 },
  { key: 'gissah',           fn: scrapeGissah,           label: 'Gissah',             tier: 1 },
  { key: 'ajmal',            fn: scrapeAjmal,            label: 'Ajmal',              tier: 1 },
  { key: 'rasasi',           fn: scrapeRasasi,           label: 'Rasasi',             tier: 1 },
  { key: 'swiss-arabian',    fn: scrapeSwissArabian,     label: 'Swiss Arabian',      tier: 1 },
  { key: 'al-haramain',      fn: scrapeAlHaramain,       label: 'Al Haramain',        tier: 1 },
  { key: 'armaf',            fn: scrapeArmaf,            label: 'Armaf',              tier: 1 },
  { key: 'afnan',            fn: scrapeAfnan,            label: 'Afnan',              tier: 1 },
  { key: 'khadlaj',          fn: scrapeKhadlaj,          label: 'Khadlaj',            tier: 1 },
  { key: 'maison-alhambra',  fn: scrapeMaisonAlhambra,  label: 'Maison Alhambra',    tier: 1 },
  { key: 'ard-al-zaafaran',  fn: scrapeArdAlZaafaran,   label: 'Ard Al Zaafaran',    tier: 1 },
  { key: 'paris-corner',     fn: scrapeParisCorner,      label: 'Paris Corner',       tier: 1 },
  { key: 'fragrance-world',  fn: scrapeFragranceWorld,   label: 'Fragrance World',    tier: 1 },
  { key: 'riiffs',           fn: scrapeRiiffs,           label: 'Riiffs',             tier: 1 },

  // ── Tier 2 (20–50 products) ──
  { key: 'amouage',          fn: scrapeAmouage,          label: 'Amouage',            tier: 2 },
  { key: 'kayali',           fn: scrapeKayali,           label: 'Kayali',             tier: 2 },
  { key: 'arabian-oud',      fn: scrapeArabianOud,       label: 'Arabian Oud',        tier: 2 },
  { key: 'nabeel',           fn: scrapeNabeel,           label: 'Nabeel',             tier: 2 },
  { key: 'arabiyat-prestige',fn: scrapeArabiyatPrestige, label: 'Arabiyat Prestige',  tier: 2 },
  { key: 'gulf-orchid',      fn: scrapeGulfOrchid,       label: 'Gulf Orchid',        tier: 2 },
  { key: 'yas-perfumes',     fn: scrapeYasPerfumes,      label: 'Yas Perfumes',       tier: 2 },
  { key: 'orientica',        fn: scrapeOrientica,        label: 'Orientica',          tier: 2 },
  { key: 'zimaya',           fn: scrapeZimaya,           label: 'Zimaya',             tier: 2 },
  { key: 'al-rehab',         fn: scrapeAlRehab,          label: 'Al Rehab',           tier: 2 },
  { key: 'el-nabil',         fn: scrapeElNabil,          label: 'El Nabil',           tier: 2 },
  { key: 'abdul-samad-al-qurashi', fn: scrapeAbdulSamadAlQurashi, label: 'Abdul Samad Al Qurashi', tier: 2 },
  { key: 'assaf',            fn: scrapeAssaf,            label: 'Assaf',              tier: 2 },
  { key: 'rue-broca',        fn: scrapeRueBroca,         label: 'Rue Broca',          tier: 2 },
  { key: 'attar-collection', fn: scrapeAttarCollection,  label: 'Attar Collection',   tier: 2 },

  // ── Tier 3 (10–20 products) ──
  { key: 'surrati',          fn: scrapeSurrati,          label: 'Surrati',            tier: 3 },
  { key: 'al-nuaim',         fn: scrapeAlNuaim,          label: 'Al Nuaim',           tier: 3 },
  { key: 'ahmad-al-maghribi',fn: scrapeAhmadAlMaghribi,  label: 'Ahmad Al Maghribi',  tier: 3 },
  { key: 'naseem',           fn: scrapeNaseem,           label: 'Naseem',             tier: 3 },
  { key: 'ghawali',          fn: scrapeGhawali,          label: 'Ghawali',            tier: 3 },
  { key: 'spirit-of-dubai',  fn: scrapeSpiritOfDubai,   label: 'Spirit of Dubai',    tier: 3 },
  { key: 'widian',           fn: scrapeWidian,           label: 'Widian',             tier: 3 },
  { key: 'khalis',           fn: scrapeKhalis,           label: 'Khalis',             tier: 3 },
  { key: 'sapil',            fn: scrapeSapil,            label: 'Sapil',              tier: 3 },
  { key: 'reef-perfumes',    fn: scrapeReefPerfumes,     label: 'Reef Perfumes',      tier: 3 },
  { key: 'hamidi',           fn: scrapeHamidi,           label: 'Hamidi',             tier: 3 },
  { key: 'maison-asrar',     fn: scrapeMaisonAsrar,      label: 'Maison Asrar',       tier: 3 },
  { key: 'navitus',          fn: scrapeNavitus,          label: 'Navitus',            tier: 3 },
  { key: 'rayhaan',          fn: scrapeRayhaan,          label: 'Rayhaan',            tier: 3 },
  { key: 'emper',            fn: scrapeEmper,            label: 'Emper',              tier: 3 },
  { key: 'french-avenue',    fn: scrapeFrenchAvenue,     label: 'French Avenue',      tier: 3 },
  { key: 'louis-cardin',     fn: scrapeLouisCardin,      label: 'Louis Cardin',       tier: 3 },
  { key: 'dumont',           fn: scrapeDumont,           label: 'Dumont',             tier: 3 },
  { key: 'my-perfumes',      fn: scrapeMyPerfumes,       label: 'My Perfumes',        tier: 3 },
  { key: 'kajal',            fn: scrapeKajal,            label: 'Kajal',              tier: 3 },
  { key: 'azha',             fn: scrapeAzha,             label: 'Azha',               tier: 3 },
  { key: 'al-wataniah',      fn: scrapeAlWataniah,       label: 'Al Wataniah',        tier: 3 },
  { key: 'suroori',          fn: scrapeSuroori,          label: 'Suroori',            tier: 3 },
  { key: 'hind-al-oud',      fn: scrapeHindAlOud,        label: 'Hind Al Oud',        tier: 3 },
  { key: 'ibraq',            fn: scrapeIbraq,            label: 'Ibraq',              tier: 3 },
  { key: 'dukhni',           fn: scrapeDukhni,           label: 'Dukhni',             tier: 3 },
  { key: 'emirates-pride',   fn: scrapeEmiratesPride,    label: 'Emirates Pride',     tier: 3 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Retailer UUID cache — avoids a lookup on every batch
const retailerCache = {}

async function getRetailerId(slug) {
  if (retailerCache[slug]) return retailerCache[slug]
  const { data } = await supabase.from('retailers').select('id').eq('slug', slug).single()
  if (data?.id) retailerCache[slug] = data.id
  return data?.id ?? null
}

async function saveListings(retailerSlug, listings) {
  if (!listings?.length) return 0

  const retailerId = await getRetailerId(retailerSlug)
  if (!retailerId) {
    console.error(`    ✗ Retailer not found in DB: "${retailerSlug}" — add it to retailers table first`)
    return 0
  }

  // Update last_scraped_at timestamp on retailer
  await supabase.from('retailers')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('id', retailerId)

  const BATCH = 100
  let saved = 0

  for (let i = 0; i < listings.length; i += BATCH) {
    const batch = listings.slice(i, i + BATCH).map(l => ({
      retailer_id:     retailerId,
      external_id:     l.external_id ?? null,
      raw_name:        l.raw_name,
      raw_brand:       l.raw_brand ?? '',
      raw_price:       l.raw_price,
      raw_currency:    l.raw_currency ?? 'USD',
      raw_description: l.raw_description ?? null,
      raw_image_url:   l.raw_image_url ?? null,
      raw_url:         l.raw_url,
      raw_data:        l.raw_data ?? l,
      match_status:    'pending',
      last_scraped_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('scraper_listings')
      .upsert(batch, { onConflict: 'retailer_id,external_id', ignoreDuplicates: false })

    if (error) {
      console.error(`    ✗ DB batch error for ${retailerSlug}: ${error.message}`)
    } else {
      saved += batch.length
    }
  }

  return saved
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌸 RareTrace — Tier 1 Bulk Scraper')
  console.log('═══════════════════════════════════════════')
  if (DRY_RUN) console.log('🔍 DRY RUN — no DB writes\n')

  const targets = SINGLE
    ? SCRAPERS.filter(s => s.key === SINGLE)
    : SCRAPERS

  if (SINGLE && targets.length === 0) {
    console.error(`Unknown brand: "${SINGLE}". Available: ${SCRAPERS.map(s => s.key).join(', ')}`)
    process.exit(1)
  }

  let totalListings = 0
  const results = []

  for (const { key, fn, label, tier } of targets) {
    process.stdout.write(`  ▶ [T${tier}] ${label.padEnd(30)} `)

    try {
      const result = await fn()

      // Scrapers return either { retailerSlug, listings } or an array of those
      const batches = Array.isArray(result) ? result : [result]
      const totalCount = batches.reduce((sum, b) => sum + (b?.listings?.length ?? 0), 0)

      if (!totalCount) {
        console.log('⊘ 0 listings')
        results.push({ label, count: 0, status: 'empty' })
        continue
      }

      if (DRY_RUN) {
        console.log(`✓ ${totalCount} listings (dry run)`)
        totalListings += totalCount
        results.push({ label, count: totalCount, status: 'ok' })
        continue
      }

      let saved = 0
      for (const { retailerSlug, listings } of batches) {
        if (!listings?.length) continue
        saved += await saveListings(retailerSlug, listings)
        await sleep(300)
      }
      console.log(`✓ ${saved} listings saved`)
      totalListings += saved
      results.push({ label, count: saved, status: 'ok' })

      // Small delay to avoid hammering Supabase
      await sleep(300)

    } catch (err) {
      console.log(`✗ ERROR: ${err.message?.slice(0, 60)}`)
      results.push({ label, count: 0, status: 'error', err: err.message })
    }
  }

  console.log('\n═══════════════════════════════════════════')
  console.log(`📦 Total listings scraped: ${totalListings}`)

  if (results.filter(r => r.status === 'error').length > 0) {
    console.log('\n⚠️  Errors:')
    results.filter(r => r.status === 'error').forEach(r =>
      console.log(`   ${r.label}: ${r.err?.slice(0, 80)}`)
    )
  }

  if (DRY_RUN || SCRAPE_ONLY) {
    console.log('\n(Skipping match + vibe steps)')
    return
  }

  // ── Step 2: Run matcher ────────────────────────────────────────────────────
  console.log('\n⚙️  Running product matcher...')
  try {
    execSync('node scripts/match-products.js', { stdio: 'inherit' })
  } catch (e) {
    console.error('Matcher failed — run manually: node scripts/match-products.js')
  }

  // ── Step 3: Backfill vibes ─────────────────────────────────────────────────
  console.log('\n🎨 Backfilling vibes...')
  try {
    execSync('node scripts/backfill-vibes.js', { stdio: 'inherit' })
  } catch (e) {
    console.error('Vibe backfill failed — run manually: node scripts/backfill-vibes.js')
  }

  // ── Step 4: Backfill notes ─────────────────────────────────────────────────
  console.log('\n📋 Backfilling notes...')
  try {
    execSync('node scripts/backfill-notes.js', { stdio: 'inherit' })
  } catch (e) {
    console.error('Notes backfill failed — run manually: node scripts/backfill-notes.js')
  }

  // ── Step 5: Update brand logos ────────────────────────────────────────────
  console.log('\n🖼  Updating brand logos...')
  try {
    execSync('node scripts/update-brand-logos.js', { stdio: 'inherit' })
  } catch (e) {
    console.error('Logo update failed — run manually: node scripts/update-brand-logos.js')
  }

  console.log('\n✅ Full pipeline complete!')
  console.log('   Check Supabase: https://app.supabase.com → Table Editor → products')
}

main().catch(err => { console.error(err); process.exit(1) })
