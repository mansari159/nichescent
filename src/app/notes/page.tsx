import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Browse by Scent Note — Oud, Rose, Saffron & More',
  description: 'Discover MENA fragrances by their key ingredients. Browse by oud, rose, saffron, amber, musk, and 25+ more notes. Find your perfect fragrance on RareTrace.',
  keywords: ['oud fragrance', 'rose perfume', 'saffron perfume', 'amber fragrance', 'MENA notes', 'fragrance notes'],
}

interface Note {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
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

const CATEGORY_EMOJIS: Record<string, string> = {
  citrus:   '🍋',
  floral:   '🌸',
  woody:    '🌿',
  spicy:    '🌶️',
  sweet:    '🍯',
  resinous: '🪵',
  musk:     '✨',
  aquatic:  '🌊',
  earthy:   '🖤',
}

const CATEGORY_ORDER = ['woody', 'spicy', 'resinous', 'floral', 'sweet', 'citrus', 'musk', 'aquatic', 'earthy']

const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string; hover: string }> = {
  citrus:   { border: 'border-amber-200',   bg: 'bg-amber-50',    text: 'text-amber-700',   hover: 'hover:border-amber-400' },
  floral:   { border: 'border-rose-200',    bg: 'bg-rose-50',     text: 'text-rose-700',    hover: 'hover:border-rose-400' },
  woody:    { border: 'border-stone-200',   bg: 'bg-stone-50',    text: 'text-stone-700',   hover: 'hover:border-stone-400' },
  spicy:    { border: 'border-orange-200',  bg: 'bg-orange-50',   text: 'text-orange-700',  hover: 'hover:border-orange-400' },
  sweet:    { border: 'border-yellow-200',  bg: 'bg-yellow-50',   text: 'text-yellow-700',  hover: 'hover:border-yellow-400' },
  resinous: { border: 'border-amber-300',   bg: 'bg-amber-50',    text: 'text-amber-800',   hover: 'hover:border-amber-500' },
  musk:     { border: 'border-slate-200',   bg: 'bg-slate-50',    text: 'text-slate-600',   hover: 'hover:border-slate-400' },
  aquatic:  { border: 'border-sky-200',     bg: 'bg-sky-50',      text: 'text-sky-700',     hover: 'hover:border-sky-400' },
  earthy:   { border: 'border-neutral-300', bg: 'bg-neutral-100', text: 'text-neutral-700', hover: 'hover:border-neutral-500' },
}

async function getNotes(): Promise<Note[]> {
  try {
    const { data } = await supabase
      .from('notes')
      .select('id, name, slug, category, description')
      .order('name', { ascending: true })
    return (data ?? []) as Note[]
  } catch {
    return [] // notes table may not exist yet
  }
}

export default async function NotesPage() {
  const notes = await getNotes()

  // Group by category
  const grouped: Record<string, Note[]> = {}
  for (const note of notes) {
    if (!grouped[note.category]) grouped[note.category] = []
    grouped[note.category].push(note)
  }
  const orderedCategories = CATEGORY_ORDER.filter(c => grouped[c])

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <nav className="text-sm text-obsidian-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-obsidian-600">Home</Link>
        <span>/</span>
        <span className="text-obsidian-700">Browse by Note</span>
      </nav>

      <div className="mb-12">
        <p className="text-xs tracking-widest uppercase text-obsidian-400 mb-2">Find your fragrance</p>
        <h1 className="font-serif text-5xl text-obsidian-900 font-light">Browse by Note</h1>
        <p className="text-obsidian-500 mt-3 text-sm max-w-lg">
          Search for MENA fragrances by their key ingredients. Click any note to see every fragrance that features it.
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20 border border-obsidian-100 bg-white">
          <p className="font-serif text-2xl text-obsidian-400 font-light mb-3">Notes coming soon</p>
          <p className="text-sm text-obsidian-400">
            Run{' '}
            <code className="bg-obsidian-50 px-2 py-0.5 text-xs">node scripts/backfill-notes.js</code>
            {' '}after applying patch-007 to populate notes.
          </p>
        </div>
      ) : (
        <div className="space-y-14">
          {orderedCategories.map(category => {
            const catNotes = grouped[category]
            const colors = CATEGORY_COLORS[category] ?? {
              border: 'border-obsidian-200', bg: 'bg-white',
              text: 'text-obsidian-600', hover: 'hover:border-gold-400',
            }

            return (
              <section key={category}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{CATEGORY_EMOJIS[category]}</span>
                  <div>
                    <h2 className="font-serif text-2xl text-obsidian-900 font-light">
                      {CATEGORY_LABELS[category] ?? category}
                    </h2>
                    <p className="text-xs text-obsidian-400">{catNotes.length} notes</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {catNotes.map(note => (
                    <Link
                      key={note.id}
                      href={`/note/${note.slug}`}
                      className={`
                        inline-flex items-center gap-1.5 px-4 py-2 border rounded-full
                        text-sm font-sans transition-all duration-200
                        ${colors.border} ${colors.bg} ${colors.text} ${colors.hover}
                        hover:shadow-sm
                      `}
                    >
                      {note.name}
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
