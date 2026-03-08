import Link from 'next/link'
import SearchBar from '@/components/SearchBar'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-serif text-[120px] text-obsidian-100 font-light leading-none mb-4">404</p>
      <h1 className="font-serif text-4xl text-obsidian-900 font-light mb-3">Fragrance not found.</h1>
      <p className="text-obsidian-500 text-lg mb-10 max-w-sm">
        This page doesn&apos;t exist — but the fragrance you&apos;re looking for might.
      </p>
      <div className="w-full max-w-md mb-8">
        <SearchBar placeholder="Search fragrances…" />
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { href: '/', label: 'Homepage' },
          { href: '/search', label: 'Browse All' },
          { href: '/vibes', label: 'Browse by Vibe' },
          { href: '/brands', label: 'All Brands' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs tracking-widest uppercase text-obsidian-500 border border-obsidian-200 hover:border-gold-400 hover:text-gold-600 px-4 py-2.5 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
