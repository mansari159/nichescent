'use client'
import Link from 'next/link'

interface Note {
  id: string
  name: string
  slug: string
  category: string
}

interface Props {
  notes: Note[]
  maxVisible?: number
  clickable?: boolean
  size?: 'sm' | 'xs'
}

// Color scheme per category — maps to our obsidian/gold design system
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  citrus:   { bg: 'bg-amber-50',   text: 'text-amber-700' },
  floral:   { bg: 'bg-rose-50',    text: 'text-rose-700' },
  woody:    { bg: 'bg-stone-100',  text: 'text-stone-700' },
  spicy:    { bg: 'bg-orange-50',  text: 'text-orange-700' },
  sweet:    { bg: 'bg-yellow-50',  text: 'text-yellow-700' },
  resinous: { bg: 'bg-amber-100',  text: 'text-amber-800' },
  musk:     { bg: 'bg-slate-100',  text: 'text-slate-600' },
  aquatic:  { bg: 'bg-sky-50',     text: 'text-sky-700' },
  earthy:   { bg: 'bg-neutral-100',text: 'text-neutral-700' },
}

export default function NotePills({ notes, maxVisible = 5, clickable = true, size = 'xs' }: Props) {
  if (!notes || notes.length === 0) return null

  const visible = notes.slice(0, maxVisible)
  const overflow = notes.length - maxVisible

  const pillClass = size === 'sm'
    ? 'text-xs px-2.5 py-1 rounded-full'
    : 'text-[10px] px-2 py-0.5 rounded-full'

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visible.map(note => {
        const colors = CATEGORY_COLORS[note.category] ?? { bg: 'bg-obsidian-50', text: 'text-obsidian-600' }
        const pill = (
          <span
            key={note.id}
            className={`${pillClass} ${colors.bg} ${colors.text} font-sans leading-none`}
          >
            {note.name}
          </span>
        )

        if (clickable) {
          return (
            <Link
              key={note.id}
              href={`/search?note=${note.slug}`}
              onClick={e => e.stopPropagation()}
              className="hover:opacity-80 transition-opacity"
              title={`Browse ${note.name} fragrances`}
            >
              {pill}
            </Link>
          )
        }

        return pill
      })}

      {overflow > 0 && (
        <span className={`${pillClass} bg-obsidian-100 text-obsidian-500`}>
          +{overflow}
        </span>
      )}
    </div>
  )
}
