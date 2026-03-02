'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

interface Note {
  id: string
  name: string
  slug: string
  category: string
}

interface Props {
  notes: Note[]
}

const CATEGORY_LABELS: Record<string, string> = {
  citrus:   'Citrus',
  floral:   'Floral',
  woody:    'Woody',
  spicy:    'Spicy',
  sweet:    'Sweet',
  resinous: 'Resinous',
  musk:     'Musk',
  aquatic:  'Aquatic',
  earthy:   'Earthy',
}

// Preferred category display order
const CATEGORY_ORDER = ['woody', 'spicy', 'resinous', 'floral', 'sweet', 'citrus', 'musk', 'aquatic', 'earthy']

export default function NoteFilter({ notes }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ woody: true, spicy: true })

  const selectedNotes = searchParams.getAll('note')

  const toggleNote = useCallback((slug: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.getAll('note').filter(n => n !== slug)
    params.delete('note')
    current.forEach(n => params.append('note', n))
    if (checked) params.append('note', slug)
    params.delete('page')
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const clearNotes = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('note')
    params.delete('page')
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  // Group by category
  const grouped: Record<string, Note[]> = {}
  for (const note of notes) {
    if (!grouped[note.category]) grouped[note.category] = []
    grouped[note.category].push(note)
  }

  const orderedCategories = CATEGORY_ORDER.filter(c => grouped[c])

  if (orderedCategories.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs tracking-widest uppercase text-obsidian-500">Scent Notes</h3>
        {selectedNotes.length > 0 && (
          <button
            onClick={clearNotes}
            className="text-[10px] text-gold-600 hover:text-gold-700 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Selected pills */}
      {selectedNotes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {selectedNotes.map(slug => {
            const note = notes.find(n => n.slug === slug)
            return note ? (
              <button
                key={slug}
                onClick={() => toggleNote(slug, false)}
                className="text-[10px] bg-gold-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-gold-600 transition-colors"
              >
                {note.name}
                <span className="text-white/80">×</span>
              </button>
            ) : null
          })}
        </div>
      )}

      <div className="space-y-2">
        {orderedCategories.map(category => {
          const catNotes = grouped[category]
          const isOpen = expanded[category] ?? false
          const hasSelected = catNotes.some(n => selectedNotes.includes(n.slug))

          return (
            <div key={category} className="border-b border-obsidian-50 last:border-0 pb-2">
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [category]: !isOpen }))}
                className="flex items-center justify-between w-full py-1.5 text-left group"
              >
                <span className="text-xs text-obsidian-700 font-medium group-hover:text-obsidian-900 transition-colors">
                  {CATEGORY_LABELS[category] ?? category}
                  {hasSelected && (
                    <span className="ml-1.5 text-[9px] text-gold-500 font-sans">●</span>
                  )}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-obsidian-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="mt-1.5 space-y-2 pl-0.5">
                  {catNotes.map(note => (
                    <label key={note.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedNotes.includes(note.slug)}
                        onChange={e => toggleNote(note.slug, e.target.checked)}
                        className="w-3.5 h-3.5 rounded-none border-obsidian-300 text-gold-500 focus:ring-gold-400 focus:ring-offset-0"
                      />
                      <span className="text-xs text-obsidian-600 group-hover:text-obsidian-900 transition-colors">
                        {note.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
