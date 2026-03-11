import Link from 'next/link'
import { getNoteCategory, NOTE_CATEGORY_STYLES, noteSlug } from '@/lib/utils'

interface Props {
  note: string
  linkable?: boolean
  size?: 'sm' | 'md'
}

export default function NotePill({ note, linkable = false, size = 'sm' }: Props) {
  const category = getNoteCategory(note)
  const style = NOTE_CATEGORY_STYLES[category]
  const className = size === 'md'
    ? 'inline-flex items-center text-xs px-3 py-1.5 transition-opacity hover:opacity-80'
    : 'inline-flex items-center text-[10px] px-2 py-0.5 transition-opacity hover:opacity-80'

  const inner = (
    <span
      className={className}
      style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
    >
      {note}
    </span>
  )

  if (linkable) {
    return <Link href={`/note/${noteSlug(note)}`}>{inner}</Link>
  }
  return inner
}
