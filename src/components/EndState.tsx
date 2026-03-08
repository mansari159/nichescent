'use client'

import Link from 'next/link'
import EmailCapture from '@/components/EmailCapture'

interface Props {
  context?: string
  category?: string
  count?: number
  crossLink?: { href: string; label: string }
}

export default function EndState({ context = 'everything', category = 'fragrances', count, crossLink }: Props) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="mt-16 border-t border-obsidian-100 pt-16 pb-8">
      <div className="max-w-xl mx-auto text-center">
        {/* Check icon */}
        <div className="w-12 h-12 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center mx-auto mb-5">
          <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-3">
          {count ? `You've seen all ${count} ${context}` : `You've seen ${context}`}
        </p>

        <h3 className="font-serif text-3xl text-obsidian-900 font-light mb-4">
          More {category} coming soon
        </h3>

        <p className="text-sm text-obsidian-500 leading-relaxed mb-8 max-w-sm mx-auto">
          We add 50+ new brands and hundreds of fragrances every week. Be first to know when new discoveries arrive.
        </p>

        <EmailCapture source="end_state" placeholder="your@email.com" buttonText="Notify Me" />

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-obsidian-100">
          <div className="text-center">
            <p className="font-serif text-2xl text-obsidian-900">{count ?? '—'}</p>
            <p className="text-[10px] tracking-widest uppercase text-obsidian-400">Tracking now</p>
          </div>
          <div className="w-px h-8 bg-obsidian-100" />
          <div className="text-center">
            <p className="font-serif text-2xl text-obsidian-900">Weekly</p>
            <p className="text-[10px] tracking-widest uppercase text-obsidian-400">Next update</p>
          </div>
          <div className="w-px h-8 bg-obsidian-100" />
          <div className="text-center">
            <p className="font-serif text-2xl text-obsidian-900">50+</p>
            <p className="text-[10px] tracking-widest uppercase text-obsidian-400">Brands added/wk</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={scrollToTop}
            className="text-xs tracking-widest uppercase text-obsidian-500 hover:text-obsidian-900 transition-colors border border-obsidian-200 hover:border-obsidian-400 px-5 py-2.5"
          >
            Back to top
          </button>
          {crossLink && (
            <Link
              href={crossLink.href}
              className="text-xs tracking-widest uppercase text-gold-500 hover:text-gold-600 transition-colors border border-gold-300 hover:border-gold-500 px-5 py-2.5"
            >
              {crossLink.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
