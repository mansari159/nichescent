'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  compact?: boolean
  initialQuery?: string
  variant?: 'dark' | 'light'
}

export default function SearchBar({ compact = false, initialQuery = '', variant = 'dark' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Array<{ label: string; slug: string }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const popularSearches = [
    'Arabian Oud', 'Lattafa Raghba', 'Armaf Club de Nuit',
    'Ajmal Sacrifice', 'Oud Rose', 'Swiss Arabian Shaghaf',
  ]

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
      } catch { setSuggestions([]) }
    }, 250)
  }, [query])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function handleSuggestionClick(label: string) {
    setQuery(label.split(' — ')[0])
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(label.split(' — ')[0])}`)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search by name, brand, or scent notes..."
          className={
            variant === 'light'
              ? "w-full bg-white border border-obsidian-200 text-obsidian-900 placeholder-obsidian-400 px-5 py-3.5 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-colors"
              : "w-full bg-white/10 border border-white/20 text-cream placeholder-obsidian-500 px-5 py-3.5 text-sm focus:outline-none focus:border-gold-500 focus:bg-white/15 transition-colors"
          }
        />
        <button
          type="submit"
          className="bg-gold-500 hover:bg-gold-600 text-white text-xs tracking-widest2 uppercase px-6 shrink-0 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-obsidian-900 border border-obsidian-700 shadow-2xl z-50">
          {query.length < 2 ? (
            <div className="p-4">
              <p className="text-[10px] tracking-widest2 uppercase text-obsidian-500 mb-3">Popular searches</p>
              {popularSearches.map(s => (
                <button key={s} onMouseDown={() => handleSuggestionClick(s)}
                  className="block w-full text-left px-2 py-2 text-sm text-obsidian-300 hover:text-cream transition-colors">
                  {s}
                </button>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((s, i) => (
                <button key={i} onMouseDown={() => handleSuggestionClick(s.label)}
                  className="block w-full text-left px-5 py-2.5 text-sm text-obsidian-300 hover:text-cream hover:bg-obsidian-800 transition-colors">
                  {s.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
