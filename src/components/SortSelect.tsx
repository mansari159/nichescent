'use client'

interface Props {
  value: string
}

export default function SortSelect({ value }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = new URL(window.location.href)
    url.searchParams.set('sort', e.target.value)
    window.location.href = url.toString()
  }

  return (
    <div className="relative">
      <select
        defaultValue={value}
        onChange={handleChange}
        className="appearance-none bg-white border border-obsidian-200 text-obsidian-700 text-xs tracking-wide uppercase px-4 py-2.5 pr-8 focus:outline-none focus:border-gold-500 cursor-pointer hover:border-obsidian-400 transition-colors"
      >
        <option value="relevance">Most Relevant</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="newest">Newest First</option>
        <option value="name">Name A–Z</option>
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg className="w-3 h-3 text-obsidian-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
