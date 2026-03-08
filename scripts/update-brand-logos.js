/**
 * Brand Logo Updater
 * ─────────────────
 * 1. Fetches all brands from Supabase
 * 2. Uses a known-good CDN/official logo map for major brands
 * 3. Falls back to Clearbit Logo API (logo.clearbit.com) using brand website domain
 * 4. Updates brands.logo_url and brands.hero_image_url in the DB
 *
 * Usage:
 *   node scripts/update-brand-logos.js                  # update all missing
 *   node scripts/update-brand-logos.js --force          # overwrite all logos
 *   node scripts/update-brand-logos.js --dry-run        # preview only, no writes
 *   node scripts/update-brand-logos.js --brand lattafa  # single brand
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const FORCE   = process.argv.includes('--force')
const DRY_RUN = process.argv.includes('--dry-run')
const SINGLE  = process.argv.includes('--brand')
  ? process.argv[process.argv.indexOf('--brand') + 1]
  : null

// ─── Known logo map ───────────────────────────────────────────────────────────
// Official / CDN-hosted logos for top brands.
// logo: direct image URL (PNG/SVG preferred)
// hero: wide hero image for brand page header (Unsplash or official)
// domain: used as Clearbit fallback
const KNOWN_BRANDS = {
  'lattafa': {
    logo: 'https://lattafaperfumes.com/cdn/shop/files/Lattafa-Logo_200x.png',
    domain: 'lattafaperfumes.com',
    hero: 'https://images.unsplash.com/photo-1583753771919-ad6c2c7e21ee?auto=format&fit=crop&w=1920&q=80',
  },
  'ajmal': {
    logo: 'https://www.ajmalperfume.com/media/logo/stores/1/logo_1.png',
    domain: 'ajmalperfume.com',
    hero: 'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=1920&q=80',
  },
  'rasasi': {
    logo: 'https://rasasi.com/pub/media/logo/stores/1/rasasi-logo.png',
    domain: 'rasasi.com',
    hero: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1920&q=80',
  },
  'swiss-arabian': {
    logo: 'https://swissarabian.com/cdn/shop/files/Logo-SA-01.png',
    domain: 'swissarabian.com',
    hero: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1920&q=80',
  },
  'gissah': {
    logo: 'https://gissah.com/cdn/shop/files/Gissah_logo.png',
    domain: 'gissah.com',
    hero: 'https://images.unsplash.com/photo-1604076985493-b02f153a8fe5?auto=format&fit=crop&w=1920&q=80',
  },
  'amouage': {
    logo: 'https://www.amouage.com/on/demandware.static/Sites-Amouage-Site/-/default/dw34f0c47a/images/logo.svg',
    domain: 'amouage.com',
    hero: 'https://images.unsplash.com/photo-1590156562745-5d3cd28cd52c?auto=format&fit=crop&w=1920&q=80',
  },
  'al-haramain': {
    logo: 'https://alharamain.com/pub/media/logo/stores/1/al_haramain_logo.png',
    domain: 'alharamain.com',
    hero: 'https://images.unsplash.com/photo-1604076985493-b02f153a8fe5?auto=format&fit=crop&w=1920&q=80',
  },
  'kayali': {
    logo: 'https://www.kayali.com/cdn/shop/files/Kayali_logo.png',
    domain: 'kayali.com',
    hero: 'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=1920&q=80',
  },
  'armaf': {
    logo: 'https://armaf.com/wp-content/uploads/2020/01/armaf-logo.png',
    domain: 'armaf.com',
    hero: 'https://images.unsplash.com/photo-1583753771919-ad6c2c7e21ee?auto=format&fit=crop&w=1920&q=80',
  },
  'maison-alhambra': {
    logo: 'https://maisonalhambra.com/cdn/shop/files/logo.png',
    domain: 'maisonalhambra.com',
    hero: 'https://images.unsplash.com/photo-1566977776052-6e61e35bf9be?auto=format&fit=crop&w=1920&q=80',
  },
  'arabian-oud': {
    logo: 'https://arabianoud.com/media/logo/stores/1/ao-logo.png',
    domain: 'arabianoud.com',
    hero: 'https://images.unsplash.com/photo-1604076985493-b02f153a8fe5?auto=format&fit=crop&w=1920&q=80',
  },
  'spirit-of-dubai': {
    logo: 'https://www.spiritofdubai.com/wp-content/uploads/2020/05/logo.png',
    domain: 'spiritofdubai.com',
    hero: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80',
  },
  'afnan': {
    logo: 'https://afnanperfumes.com/cdn/shop/files/Afnan_logo.png',
    domain: 'afnanperfumes.com',
    hero: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1920&q=80',
  },
  'khadlaj': {
    logo: 'https://khadlaj.com/cdn/shop/files/khadlaj-logo.png',
    domain: 'khadlaj.com',
    hero: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1920&q=80',
  },
  'ard-al-zaafaran': {
    logo: 'https://ardalzaafaran.com/cdn/shop/files/logo.png',
    domain: 'ardalzaafaran.com',
    hero: 'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=1920&q=80',
  },
  'attar-collection': {
    logo: 'https://logo.clearbit.com/attarcollection.com',
    domain: 'attarcollection.com',
    hero: 'https://images.unsplash.com/photo-1590156562745-5d3cd28cd52c?auto=format&fit=crop&w=1920&q=80',
  },
  'widian': {
    logo: 'https://logo.clearbit.com/widian.com',
    domain: 'widian.com',
    hero: 'https://images.unsplash.com/photo-1604076985493-b02f153a8fe5?auto=format&fit=crop&w=1920&q=80',
  },
  'zimaya': {
    logo: 'https://logo.clearbit.com/zimayaperfumes.com',
    domain: 'zimayaperfumes.com',
    hero: 'https://images.unsplash.com/photo-1566977776052-6e61e35bf9be?auto=format&fit=crop&w=1920&q=80',
  },
  'orientica': {
    logo: 'https://logo.clearbit.com/orientica.com',
    domain: 'orientica.com',
    hero: 'https://images.unsplash.com/photo-1583753771919-ad6c2c7e21ee?auto=format&fit=crop&w=1920&q=80',
  },
  'fragrance-world': {
    logo: 'https://logo.clearbit.com/fragranceworld.com',
    domain: 'fragranceworld.com',
    hero: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1920&q=80',
  },
  'paris-corner': {
    logo: 'https://logo.clearbit.com/pariscornerperfumes.com',
    domain: 'pariscornerperfumes.com',
    hero: 'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=1920&q=80',
  },
  'nabeel': {
    logo: 'https://logo.clearbit.com/nabeelperfumes.com',
    domain: 'nabeelperfumes.com',
    hero: 'https://images.unsplash.com/photo-1604076985493-b02f153a8fe5?auto=format&fit=crop&w=1920&q=80',
  },
  'assaf': {
    logo: 'https://assafperfumes.com/cdn/shop/files/assaf-logo.png',
    domain: 'assafperfumes.com',
    hero: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1920&q=80',
  },
  'al-rehab': {
    logo: 'https://logo.clearbit.com/alrehab.net',
    domain: 'alrehab.net',
    hero: 'https://images.unsplash.com/photo-1590156562745-5d3cd28cd52c?auto=format&fit=crop&w=1920&q=80',
  },
  'riiffs': {
    logo: 'https://logo.clearbit.com/riiffs.com',
    domain: 'riiffs.com',
    hero: 'https://images.unsplash.com/photo-1566977776052-6e61e35bf9be?auto=format&fit=crop&w=1920&q=80',
  },
  'rue-broca': {
    logo: 'https://logo.clearbit.com/ruebroca.com',
    domain: 'ruebroca.com',
    hero: 'https://images.unsplash.com/photo-1583753771919-ad6c2c7e21ee?auto=format&fit=crop&w=1920&q=80',
  },
  'kajal': {
    logo: 'https://logo.clearbit.com/kajalperfumes.com',
    domain: 'kajalperfumes.com',
    hero: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1920&q=80',
  },
  'ghawali': {
    logo: 'https://logo.clearbit.com/ghawali.com',
    domain: 'ghawali.com',
    hero: 'https://images.unsplash.com/photo-1590156562745-5d3cd28cd52c?auto=format&fit=crop&w=1920&q=80',
  },
}

// Hero image fallback by region
const REGION_HEROES = {
  'AE': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80',
  'SA': 'https://images.unsplash.com/photo-1604076985493-b02f153a8fe5?auto=format&fit=crop&w=1920&q=80',
  'KW': 'https://images.unsplash.com/photo-1566977776052-6e61e35bf9be?auto=format&fit=crop&w=1920&q=80',
  'FR': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1920&q=80',
  'IN': 'https://images.unsplash.com/photo-1524492412937-b28074a47d70?auto=format&fit=crop&w=1920&q=80',
  'OM': 'https://images.unsplash.com/photo-1590156562745-5d3cd28cd52c?auto=format&fit=crop&w=1920&q=80',
  'default': 'https://images.unsplash.com/photo-1583753771919-ad6c2c7e21ee?auto=format&fit=crop&w=1920&q=80',
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🖼  Brand Logo Updater')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (DRY_RUN) console.log('🔍 DRY RUN — no DB writes\n')

  // Fetch brands from Supabase
  let query = supabase.from('brands').select('id, name, slug, country, logo_url, hero_image_url, website_url')
  if (SINGLE) query = query.eq('slug', SINGLE)
  if (!FORCE && !SINGLE) query = query.is('logo_url', null)

  const { data: brands, error } = await query
  if (error) { console.error('Error fetching brands:', error.message); process.exit(1) }

  console.log(`Found ${brands.length} brands to process\n`)

  let updated = 0, skipped = 0, failed = 0

  for (const brand of brands) {
    const known = KNOWN_BRANDS[brand.slug]

    let logoUrl = brand.logo_url
    let heroUrl = brand.hero_image_url

    // Use known logo map first
    if (known?.logo && (FORCE || !logoUrl)) {
      logoUrl = known.logo
    }

    // Fallback: Clearbit Logo API from known domain
    if (!logoUrl) {
      const domain = known?.domain || brand.website_url?.replace(/^https?:\/\//, '').replace(/\/.*/, '')
      if (domain) {
        logoUrl = `https://logo.clearbit.com/${domain}`
      }
    }

    // Hero image from known map or region fallback
    if (known?.hero && (FORCE || !heroUrl)) {
      heroUrl = known.hero
    } else if (!heroUrl) {
      const countryCode = (brand.country ?? '').toUpperCase()
      heroUrl = REGION_HEROES[countryCode] ?? REGION_HEROES.default
    }

    if (!logoUrl && !heroUrl) {
      console.log(`  ⊘  ${brand.name} (${brand.slug}) — no logo source found`)
      skipped++
      continue
    }

    const updates = {}
    if (logoUrl && (FORCE || !brand.logo_url)) updates.logo_url = logoUrl
    if (heroUrl && (FORCE || !brand.hero_image_url)) updates.hero_image_url = heroUrl

    if (Object.keys(updates).length === 0) {
      skipped++
      continue
    }

    if (DRY_RUN) {
      console.log(`  ✓  ${brand.name}: logo=${updates.logo_url ?? '(keep)'}`)
      updated++
      continue
    }

    const { error: updateErr } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', brand.id)

    if (updateErr) {
      console.error(`  ✗  ${brand.name}: ${updateErr.message}`)
      failed++
    } else {
      console.log(`  ✓  ${brand.name}`)
      updated++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Updated: ${updated}  ⊘ Skipped: ${skipped}  ✗ Failed: ${failed}`)
  if (DRY_RUN) console.log('(Dry run — nothing was written)')
}

main().catch(err => { console.error(err); process.exit(1) })
