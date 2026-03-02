/**
 * backfill-vibes.js
 * Assigns vibe tags to products based on keyword matching.
 *
 * By default only processes products with no vibe yet (primary_vibe_slug IS NULL).
 * Pass --all to re-process every active product.
 *
 * Run: node scripts/backfill-vibes.js          # tag untagged only
 *      node scripts/backfill-vibes.js --all     # re-tag everything
 *
 * Prerequisites: patch-007-vibes-notes.sql must be applied first.
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Keyword rules per vibe (lower-case, checked against name + description) ──
const VIBE_RULES = [
  {
    slug: 'woody-earthy',
    keywords: [
      'oud', 'agarwood', 'sandalwood', 'cedar', 'vetiver', 'patchouli',
      'wood', 'earthy', 'bakhoor', 'dehn', 'kalimat', 'incense',
    ],
  },
  {
    slug: 'warm-spicy',
    keywords: [
      'saffron', 'amber', 'cardamom', 'cinnamon', 'spic', 'oriental',
      'warm', 'pepper', 'clove', 'nutmeg', 'shaghaf', 'khaltat',
    ],
  },
  {
    slug: 'floral-romantic',
    keywords: [
      'rose', 'jasmine', 'floral', 'flower', 'neroli', 'tuberose',
      'orange blossom', 'peony', 'ylang', 'romantic', 'feminine', 'women',
    ],
  },
  {
    slug: 'sweet-gourmand',
    keywords: [
      'vanilla', 'tonka', 'caramel', 'honey', 'sweet', 'gourmand',
      'candy', 'sugar', 'praline', 'chocolate', 'musk',
    ],
  },
  {
    slug: 'smoky-intense',
    keywords: [
      'leather', 'tobacco', 'smoke', 'intense', 'dark', 'noir',
      'oud intense', 'extreme', 'black', 'midnight', 'tar', 'labdanum',
    ],
  },
  {
    slug: 'fresh-clean',
    keywords: [
      'citrus', 'bergamot', 'lemon', 'lime', 'aquatic', 'fresh',
      'clean', 'grapefruit', 'marine', 'green', 'mint', 'lavender',
    ],
  },
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

  const scores = {}

  for (const rule of VIBE_RULES) {
    let score = 0
    for (const kw of rule.keywords) {
      if (text.includes(kw)) score += 1
    }
    scores[rule.slug] = score
  }

  // Sort vibes by score
  const sorted = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])

  return sorted
}

async function main() {
  const ALL_MODE = process.argv.includes('--all')
  console.log(`🌿 Backfill Vibes starting (${ALL_MODE ? 're-tagging ALL products' : 'untagged only'})...\n`)

  // Fetch all vibe IDs
  const { data: vibes, error: vibeErr } = await supabase
    .from('vibes')
    .select('id, slug, emoji')
  if (vibeErr) { console.error('Failed to fetch vibes:', vibeErr.message); process.exit(1) }

  const vibeMap = Object.fromEntries(vibes.map(v => [v.slug, v]))

  // Fetch products — untagged only by default, all if --all flag passed
  let query = supabase
    .from('products')
    .select('id, name, description, notes_top, notes_mid, notes_base, category_tags')
    .eq('is_active', true)

  if (!ALL_MODE) {
    query = query.is('primary_vibe_slug', null)
  }

  const { data: products, error: prodErr } = await query
  if (prodErr) { console.error('Failed to fetch products:', prodErr.message); process.exit(1) }

  console.log(`Found ${products.length} products to process...\n`)

  let tagged = 0
  let skipped = 0
  const needsReview = []

  for (const product of products) {
    const scored = scoreProduct(product)

    if (scored.length === 0) {
      skipped++
      needsReview.push(product.name)
      continue
    }

    const rows = []

    // Primary vibe (highest score)
    const [primarySlug] = scored[0]
    const primaryVibe = vibeMap[primarySlug]
    if (primaryVibe) {
      rows.push({ product_id: product.id, vibe_id: primaryVibe.id, strength: 'primary' })
    }

    // Secondary vibe (if score > 0 and different from primary)
    if (scored.length > 1) {
      const [secondarySlug] = scored[1]
      const secondaryVibe = vibeMap[secondarySlug]
      if (secondaryVibe && secondarySlug !== primarySlug) {
        rows.push({ product_id: product.id, vibe_id: secondaryVibe.id, strength: 'secondary' })
      }
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('product_vibes')
        .upsert(rows, { onConflict: 'product_id,vibe_id' })
      if (error) {
        console.warn(`  ⚠ Failed for "${product.name}": ${error.message}`)
        continue
      }

      // Update denormalized columns on products table
      if (primaryVibe) {
        await supabase
          .from('products')
          .update({
            primary_vibe_slug: primarySlug,
            primary_vibe_emoji: primaryVibe.emoji,
          })
          .eq('id', product.id)
      }

      tagged++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅  Tagged:       ${tagged} products`)
  console.log(`⚠️   Skipped:      ${skipped} products (no keyword match)`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (needsReview.length > 0) {
    console.log('\nProducts needing manual vibe assignment:')
    needsReview.slice(0, 20).forEach(n => console.log(`  • ${n}`))
    if (needsReview.length > 20) console.log(`  ... and ${needsReview.length - 20} more`)
  }

  if (!ALL_MODE) {
    console.log('\nTip: run with --all to re-tag products that already have vibes')
  }
  console.log('\nDone! 🎉')
}

main().catch(console.error)
