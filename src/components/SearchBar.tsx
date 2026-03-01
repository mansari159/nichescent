'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  compact?: boolean
  initialQuery?: string
}

export default function SearchBar({ compact = false, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const popularSearches = [
    'Arabian Oud', 'Lattafa Raghba', 'Armaf Club de Nuit',
    'Ajmal Sacrifice', 'oud rose', 'attar', 'Swiss Arabian Shaghaf',
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

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion)
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
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
          placeholder={compact ? 'Search fragrances...' : 'Search by name, brand, or scent notes...'}
          className={`w-full border border-gray-300 rounded-l-lg px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white ${compact ? 'py-2 text-sm' : 'py-3 text-base'}`}
        />
        <button
          type="submit"
          className={`bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-r-lg px-4 transition-colors shrink-0 ${compact ? 'py-2 text-sm' : 'py-3 px-6'}`}
        >
          {compact ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ) : 'Search'}
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 mt-1">
          {query.length < 2 ? (
            <div className="p-3">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Popular searches</p>
              {popularSearches.map(s => (
                <button key={s} onMouseDown={() => handleSuggestionClick(s)}
                  className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded">
                  🔍 {s}
                </button>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map(s => (
                <button key={s} onMouseDown={() => handleSuggestionClick(s)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  {s}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
