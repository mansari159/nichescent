'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  defaultValue?: string
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

const SUGGESTIONS = [
  'Oud Rose', 'Saffron & Amber', 'Kuwait house', 'Attar oil',
  'French niche', 'Sweet musk', 'Smoke & leather',
]

export default function SearchBar({ defaultValue = '', placeholder, autoFocus = false, className = '' }: Props) {
  const [query, setQuery] = useState(defaultValue)
  const [focused, setFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = (q = query) => {
    const trimmed = q.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    inputRef.current?.blur()
    setFocused(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit()
    if (e.key === 'Escape') { setQuery(''); inputRef.current?.blur(); setFocused(false) }
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`flex items-center border transition-colors duration-200 ${
        focused ? 'border-gold-400 bg-white' : 'border-obsidian-600 bg-obsidian-900/60'
      }`}>
        {/* Search icon */}
        <button onClick={() => submit()} className={`pl-4 pr-2 shrink-0 transition-colors ${focused ? 'text-gold-500' : 'text-obsidian-400'}`} aria-label="Search">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Search brand, note, country…'}
          autoFocus={autoFocus}
          className={`flex-1 px-3 py-4 text-base bg-transparent focus:outline-none placeholder:text-obsidian-500 transition-colors ${
            focused ? 'text-obsidian-900' : 'text-cream'
          }`}
          aria-label="Search fragrances"
        />

        {/* Clear */}
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="pr-3 text-obsidian-400 hover:text-obsidian-200 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <button
          onClick={() => submit()}
          className="hidden sm:block mx-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-xs tracking-widest uppercase transition-colors shrink-0"
        >
          Search
        </button>
      </div>

      {/* Quick suggestions */}
      {focused && !query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-obsidian-200 shadow-xl z-20 py-3">
          <p className="px-4 pb-2 text-[10px] tracking-widest uppercase text-obsidian-400">Popular searches</p>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onMouseDown={() => submit(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-obsidian-700 hover:bg-obsidian-50 hover:text-obsidian-900 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
