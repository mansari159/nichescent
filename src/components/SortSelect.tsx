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
    <select
      defaultValue={value}
      onChange={handleChange}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold-500"
    >
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="newest">Newest First</option>
      <option value="name">Name A–Z</option>
    </select>
  )
}
