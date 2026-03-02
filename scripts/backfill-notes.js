/**
 * backfill-notes.js
 * Extracts scent notes from product names/descriptions and inserts into product_notes.
 * Run: node scripts/backfill-notes.js
 *
 * Prerequisites: patch-007-vibes-notes.sql must be applied first.
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Map of note slug → keywords to search for
const NOTE_KEYWORDS = {
  'oud':           ['oud', 'agarwood', 'dehn al oud', 'dehn oud'],
  'sandalwood':    ['sandalwood', 'sandal'],
  'cedarwood':     ['cedar', 'cedarwood'],
  'vetiver':       ['vetiver'],
  'patchouli':     ['patchouli', 'patchouly'],
  'benzoin':       ['benzoin'],
  'labdanum':      ['labdanum', 'cistus'],
  'incense':       ['incense', 'frankincense', 'olibanum', 'bakhoor', 'bukhoor'],
  'amber':         ['amber', 'ambre', 'ambergris'],
  'saffron':       ['saffron', 'za\'faran', 'kesar'],
  'cardamom':      ['cardamom', 'cardamom'],
  'cinnamon':      ['cinnamon', 'cassia'],
  'pink-pepper':   ['pink pepper', 'pink peppercorn'],
  'rose':          ['rose', 'rosewater', 'ward', 'taif rose', 'damascus rose'],
  'jasmine':       ['jasmine', 'jasminum', 'sambac'],
  'orange-blossom':['orange blossom', 'neroli', 'fleur d\'oranger'],
  'ylang-ylang':   ['ylang', 'ylang-ylang'],
  'neroli':        ['neroli', 'orange blossom'],
  'vanilla':       ['vanilla', 'vanille'],
  'tonka-bean':    ['tonka', 'tonka bean', 'coumarin'],
  'caramel':       ['caramel', 'toffee', 'butterscotch'],
  'honey':         ['honey', 'beeswax', 'honeycomb'],
  'musk':          ['musk', 'muscs', 'clean musk'],
  'leather':       ['leather', 'cuir'],
  'tobacco':       ['tobacco', 'tabac', 'cigarette'],
  'smoke':         ['smoke', 'smoky', 'burnt', 'tar'],
  'bergamot':      ['bergamot'],
  'grapefruit':    ['grapefruit', 'pamplemousse'],
  'lavender':      ['lavender', 'lavande'],
  'aquatic':       ['aquatic', 'marine', 'ocean', 'sea', 'water'],
}

function extractNotes(product) {
  const text = [
    product.name ?? '',
    product.description ?? '',
    ...(product.notes_top ?? []),
    ...(product.notes_mid ?? []),
    ...(product.notes_base ?? []),
  ].join(' ').toLowerCase()

  const matched = []
  for (const [noteSlug, keywords] of Object.entries(NOTE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      // Infer position from which notes array it appeared in
      let position = 'general'
      for (const kw of keywords) {
        if ((product.notes_top ?? []).some(n => n.toLowerCase().includes(kw))) {
          position = 'top'; break
        }
        if ((product.notes_mid ?? []).some(n => n.toLowerCase().includes(kw))) {
          position = 'mid'; break
        }
        if ((product.notes_base ?? []).some(n => n.toLowerCase().includes(kw))) {
          position = 'base'; break
        }
      }
      matched.push({ slug: noteSlug, position })
    }
  }
  return matched
}

async function main() {
  console.log('🎵 Backfill Notes starting...\n')

  // Fetch all notes from DB
  const { data: noteRows, error: noteErr } = await supabase
    .from('notes')
    .select('id, slug')
  if (noteErr) { console.error('Failed to fetch notes:', noteErr.message); process.exit(1) }

  const noteMap = Object.fromEntries(noteRows.map(n => [n.slug, n.id]))

  // Fetch products
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, description, notes_top, notes_mid, notes_base')
    .eq('is_active', true)
  if (prodErr) { console.error('Failed to fetch products:', prodErr.message); process.exit(1) }

  console.log(`Processing ${products.length} products...\n`)

  // Coverage stats
  const noteCoverage = {}
  let productsWithNotes = 0
  let totalInserts = 0

  for (const product of products) {
    const matchedNotes = extractNotes(product)
    if (matchedNotes.length === 0) continue

    productsWithNotes++

    const rows = matchedNotes
      .filter(({ slug }) => noteMap[slug])
      .map(({ slug, position }) => ({
        product_id: product.id,
        note_id: noteMap[slug],
        position,
      }))

    if (rows.length > 0) {
      const { error } = await supabase
        .from('product_notes')
        .upsert(rows, { onConflict: 'product_id,note_id' })
      if (!error) {
        totalInserts += rows.length
        rows.forEach(r => {
          const slug = matchedNotes.find(n => noteMap[n.slug] === r.note_id)?.slug
          if (slug) noteCoverage[slug] = (noteCoverage[slug] || 0) + 1
        })
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅  Products with notes: ${productsWithNotes} / ${products.length}`)
  console.log(`📝  Total note links:    ${totalInserts}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nNote coverage (top 15):')
  Object.entries(noteCoverage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([slug, count]) => console.log(`  ${slug.padEnd(18)} ${count} products`))

  console.log('\nDone! 🎉')
}

main().catch(console.error)
