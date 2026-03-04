import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

interface Props { params: { slug: string } }

// ── Static note descriptions (used when DB description is null) ────────────
const NOTE_DESCRIPTIONS: Record<string, string> = {
  oud:            'The undisputed king of Arabian perfumery. Oud (agarwood) is a rare resinous wood formed when the Aquilaria tree becomes infected with a specific mold. The resulting heartwood is one of the most expensive natural materials on earth — rich, dark, complex, and endlessly fascinating.',
  sandalwood:     'Sandalwood is a creamy, warm, milky-smooth wood that has been used in perfumery and ritual for thousands of years. The finest comes from Mysore, India and Kununurra, Australia. It acts as a natural fixative and blends beautifully with almost every other note.',
  rose:           'The queen of flowers in perfumery. Rose absolute and rose otto are among the most prized ingredients in fine fragrance. Taif rose from Saudi Arabia and Damascene rose from Bulgaria are the two most coveted varieties, each with distinct character.',
  amber:          'Amber in perfumery is a warm, resinous, slightly sweet accord — a blend rather than a single material. It typically combines benzoin, labdanum, and vanilla to create that enveloping, comfortable warmth that anchors so many classic Middle Eastern and oriental fragrances.',
  vanilla:        'Vanilla is the world\'s most universally loved fragrance note — sweet, warm, and comforting. It comes from the cured pods of the vanilla orchid and adds depth, sweetness, and sensuality to any composition. In Eastern perfumery it often blends with oud for rich, gourmand orientals.',
  musk:           'Musk is the backbone of most modern fragrances — the clean, warm, skin-like softness that makes a scent feel intimate and personal. Natural musk comes from the musk deer gland; today synthetic musks replicate this warmth without harm to animals.',
  saffron:        'The most expensive spice in the world also makes one of the most distinctive perfume notes. Saffron adds a leathery, honeyed, slightly metallic warmth to fragrances — a signature ingredient in classic Middle Eastern ouds and many luxury orientals.',
  leather:        'Leather is a classic perfumery note evoking birch tar, suede, and the interior of an expensive car. It adds sophistication and darkness to fragrances and is closely associated with chypre, fougère, and smoky oriental styles.',
  tobacco:        'Tobacco in perfumery bears little resemblance to cigarette smoke — it\'s warm, rich, sweet, and slightly honeyed, like cured Virginia tobacco or pipe tobacco. It adds depth and a pleasurably addictive quality to many orientals.',
  incense:        'Incense has been burned in religious and cultural ceremonies for millennia across the Middle East, Asia, and beyond. In perfumery it evokes that spiritual, otherworldly smokiness of frankincense, myrrh, and bakhoor — meditative and deeply evocative.',
  cardamom:       'Cardamom is the spice of Arabian coffee culture and a cornerstone of Middle Eastern fragrance. It adds a fresh, eucalyptus-like spiciness that bridges the gap between green freshness and warm spice — bright but grounded.',
  bergamot:       'Bergamot is the sparkling citrus that opens countless fine fragrances. A small, sour Italian citrus fruit (Earl Grey tea gets its scent from bergamot), it adds freshness, lightness, and an elegant lift to oriental and floral compositions.',
  jasmine:        'Jasmine is one of the most important floral ingredients in perfumery — rich, indolic, heady, and intensely sweet. It forms the backbone of countless classic fragrances and is cultivated for perfumery in Egypt, India, Morocco, and the South of France.',
  patchouli:      'Patchouli is earthy, dark, sweet, and slightly funky — one of the most recognizable perfumery notes. It acts as a tremendous fixative and adds groundedness and depth. The finest aged patchouli from Indonesia is prized by connoisseurs.',
  vetiver:        'Vetiver is a grass native to India whose roots produce one of the most complex materials in perfumery — earthy, smoky, woody, and slightly citrusy. Haitian and Javanese vetiver are the two most sought-after varieties.',
  cedarwood:      'Cedarwood provides a dry, slightly pencil-shaving woody backbone to hundreds of fragrances. It\'s clean, approachable, and incredibly versatile — at home in everything from fresh fougères to deep orientals.',
  pink_pepper:    'Pink pepper adds a bright, slightly fruity, peppery sparkle to modern fragrances. It\'s technically from a different plant than black pepper, with a cleaner, more rosy character that lifts and energizes compositions.',
  'orange-blossom': 'Orange blossom and its absolute (neroli from the flower, petitgrain from the leaf) are pillars of Mediterranean and Middle Eastern perfumery. The blossom has a rich, sweet, honeyed floral character — think of orange blossom water in Arabic sweets.',
  neroli:         'Neroli is steam-distilled from the flowers of the bitter orange tree — one of the most precious and delicate ingredients in perfumery. It has a fresh, slightly metallic, deeply floral character that is simultaneously citrusy and floral.',
  frankincense:   'Frankincense (olibanum) is the ancient aromatic resin from the Boswellia tree, most prized from Oman and the Horn of Africa. It has a clean, slightly citrusy, deeply spiritual smokiness that has been burned in sacred spaces for thousands of years.',
  labdanum:       'Labdanum is a sticky resin from the cistus rock rose of the Mediterranean. It has an ambery, leathery, warm character and is one of the key ingredients in amber accords and chypre fragrances. Hauntingly beautiful.',
  benzoin:        'Benzoin is a sweet, vanilla-like balsamic resin from Southeast Asian Styrax trees. It adds warmth, sweetness, and a slightly medicinal depth to oriental compositions, and is a classic fixative in fine fragrance.',
  tonka:          'The tonka bean comes from a South American tree and smells of sweet, warm coumarin — like freshly cut hay, almonds, and vanilla all at once. It\'s an essential ingredient in gourmand fragrances and fougères.',
  smoke:          'Smoke in perfumery can range from the clean lapsang souchong of a fireplace to the darker, rubbery smoke of birch tar. It adds mystery, drama, and an almost threatening sensuality to a composition.',
  honey:          'Honey in perfumery adds a rich, beeswax-like, slightly animalic warmth. The best honey notes are complex — sweet but never cloying, with a depth that feels almost primitive and ancient.',
  caramel:        'Caramel adds a buttery, burnt-sugar warmth to gourmand fragrances. When done well, it feels rich and comforting rather than sweet and cloying — think of the edge of a crème brûlée rather than a lollipop.',
  grapefruit:     'Grapefruit adds a sharp, sparkling, slightly bitter citrus freshness that\'s more sophisticated than simple lemon or orange. It\'s a signature note in many fresh and aquatic fragrances.',
  lavender:       'Lavender is one of the most versatile notes in perfumery — fresh and herbal in fougères, warm and powdery in orientals, medicinal in some compositions. French Provence lavender is the gold standard.',
  'ylang-ylang':  'Ylang ylang is an intensely floral, creamy, slightly rubbery tropical flower from the Comoros Islands. In small doses it adds depth to florals; in larger amounts it becomes heady and almost narcotic.',
  aquatic:        'Aquatic notes evoke clean water, sea spray, and open skies. Modern and fresh, they were pioneered in the 1990s and remain popular in accessible, easy-wearing fragrances.',
}

const CATEGORY_LABELS: Record<string, string> = {
  citrus:   'Citrus',
  floral:   'Floral',
  woody:    'Woody',
  spicy:    'Spicy',
  sweet:    'Sweet',
  resinous: 'Resinous',
  musk:     'Musk & Animalic',
  aquatic:  'Aquatic',
  earthy:   'Earthy & Smoky',
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  citrus:   { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200' },
  floral:   { bg: 'bg-rose-50',     text: 'text-rose-700',    border: 'border-rose-200' },
  woody:    { bg: 'bg-stone-100',   text: 'text-stone-700',   border: 'border-stone-300' },
  spicy:    { bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200' },
  sweet:    { bg: 'bg-yellow-50',   text: 'text-yellow-700',  border: 'border-yellow-200' },
  resinous: { bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-300' },
  musk:     { bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200' },
  aquatic:  { bg: 'bg-sky-50',      text: 'text-sky-700',     border: 'border-sky-200' },
  earthy:   { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-300' },
}

interface NoteRow {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
}

async function getNoteWithProducts(slug: string): Promise<{ note: NoteRow; products: Product[]; relatedNotes: NoteRow[] } | null> {
  // Fetch note
  const { data: note } = await supabase
    .from('notes')
    .select('id, name, slug, category, description')
    .eq('slug', slug)
    .single()

  if (!note) return null

  // Fetch product IDs that have this note
  const { data: pnRows } = await supabase
    .from('product_notes')
    .select('product_id')
    .eq('note_id', note.id)
    .limit(200)

  const productIds = (pnRows ?? []).map(r => r.product_id)

  let products: Product[] = []
  if (productIds.length > 0) {
    const { data: prods } = await supabase
      .from('products')
      .select('*, brand:brands(name, slug, country)')
      .in('id', productIds)
      .eq('is_active', true)
      .not('lowest_price', 'is', null)
      .order('lowest_price', { ascending: true })
      .limit(48)
    products = (prods ?? []) as Product[]
  }

  // Related notes — same category
  const { data: related } = await supabase
    .from('notes')
    .select('id, name, slug, category, description')
    .eq('category', note.category)
    .neq('slug', slug)
    .limit(8)

  return { note, products, relatedNotes: (related ?? []) as NoteRow[] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getNoteWithProducts(params.slug)
  if (!result) return { title: 'Note Not Found' }
  const { note, products } = result
  const noteName = note.name
  return {
    title: `Best ${noteName} Fragrances — Niche & Artisan Perfumes`,
    description: `Discover ${products.length}+ niche fragrances featuring ${noteName}. Compare prices across retailers and find your perfect ${noteName.toLowerCase()} perfume on RareTrace.`,
    keywords: [
      `${noteName.toLowerCase()} fragrance`,
      `${noteName.toLowerCase()} perfume`,
      `best ${noteName.toLowerCase()} perfumes`,
      `${noteName.toLowerCase()} oud`,
      'niche fragrance',
    ],
  }
}

export default async function NotePage({ params }: Props) {
  const result = await getNoteWithProducts(params.slug)
  if (!result) notFound()

  const { note, products, relatedNotes } = result
  const description = note.description ?? NOTE_DESCRIPTIONS[note.slug] ?? null
  const colors = CATEGORY_COLORS[note.category] ?? { bg: 'bg-obsidian-50', text: 'text-obsidian-600', border: 'border-obsidian-200' }
  const categoryLabel = CATEGORY_LABELS[note.category] ?? note.category

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Hero header ─────────────────────────────── */}
      <div className="bg-obsidian-950 border-b border-obsidian-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-obsidian-500 mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-obsidian-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/notes" className="hover:text-obsidian-300 transition-colors">Notes</Link>
            <span>/</span>
            <span className="text-obsidian-300">{note.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              {/* Category badge */}
              <span className={`inline-flex items-center text-[10px] tracking-widest uppercase font-medium px-2.5 py-1 border mb-4 ${colors.bg} ${colors.text} ${colors.border}`}>
                {categoryLabel}
              </span>

              <h1 className="font-serif text-5xl md:text-6xl text-cream font-light leading-tight">
                {note.name}
              </h1>

              {products.length > 0 && (
                <p className="text-obsidian-400 mt-3 text-sm">
                  {products.length} fragrance{products.length !== 1 ? 's' : ''} featuring this note
                </p>
              )}
            </div>

            <Link
              href="/notes"
              className="text-xs tracking-widest uppercase text-obsidian-500 hover:text-gold-400 transition-colors border border-obsidian-700 hover:border-gold-600 px-4 py-2 self-start md:self-auto"
            >
              ← All Notes
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* ── Note description ──────────────────────── */}
        {description && (
          <div className="max-w-3xl mb-14">
            <p className="text-obsidian-600 leading-relaxed text-base">{description}</p>
          </div>
        )}

        {/* ── Products ─────────────────────────────── */}
        {products.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs tracking-widest uppercase text-obsidian-400 mb-1">Fragrances featuring</p>
                <h2 className="font-serif text-3xl text-obsidian-900 font-light">{note.name}</h2>
              </div>
              <Link
                href={`/search?note=${note.slug}`}
                className="text-xs tracking-widest uppercase text-gold-500 hover:text-gold-600 transition-colors hidden sm:block"
              >
                Search with filters →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length >= 48 && (
              <div className="mt-8 text-center">
                <Link
                  href={`/search?note=${note.slug}`}
                  className="inline-block border border-obsidian-300 text-obsidian-600 hover:border-gold-500 hover:text-obsidian-900 text-xs tracking-widest uppercase px-8 py-3 transition-colors"
                >
                  View All Results
                </Link>
              </div>
            )}
          </section>
        ) : (
          <div className="text-center py-20 border border-obsidian-100 bg-white">
            <p className="font-serif text-2xl text-obsidian-400 font-light mb-3">No fragrances yet</p>
            <p className="text-sm text-obsidian-400 mb-4">
              Run <code className="bg-obsidian-50 px-2 py-0.5 text-xs">npm run backfill:notes</code> to link notes to products.
            </p>
            <Link href="/search" className="text-xs tracking-widest uppercase text-gold-500 hover:text-gold-600">
              Browse all fragrances →
            </Link>
          </div>
        )}

        {/* ── Related notes ─────────────────────────── */}
        {relatedNotes.length > 0 && (
          <section className="mt-20 pt-12 border-t border-obsidian-100">
            <p className="text-xs tracking-widest uppercase text-obsidian-400 mb-2">Also in {categoryLabel}</p>
            <h3 className="font-serif text-2xl text-obsidian-900 font-light mb-6">Related Notes</h3>
            <div className="flex flex-wrap gap-2">
              {relatedNotes.map(rn => (
                <Link
                  key={rn.id}
                  href={`/note/${rn.slug}`}
                  className={`inline-flex items-center px-4 py-2 border text-sm transition-all duration-200 hover:shadow-sm ${colors.border} ${colors.bg} ${colors.text} hover:opacity-80`}
                >
                  {rn.name}
                </Link>
              ))}
              <Link
                href="/notes"
                className="inline-flex items-center px-4 py-2 border border-obsidian-200 bg-white text-obsidian-500 text-sm hover:border-gold-400 transition-colors"
              >
                All Notes →
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
