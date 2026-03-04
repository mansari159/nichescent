import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { formatPriceUSD, getFragranceTypeLabel, truncate } from '@/lib/utils'
import { getCountryFlag } from '@/lib/countries'

interface Props { product: Product }

// Slugify a note name for linking to /note/[slug]
function noteSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function ProductCard({ product }: Props) {
  const brandName   = product.brand?.name ?? ''
  const countryCode = product.brand?.country ?? null
  const countryFlag = getCountryFlag(countryCode)

  // Top notes for pill display (max 3 from top+mid combined)
  const notePills = [...(product.notes_top ?? []), ...(product.notes_mid ?? [])].slice(0, 3)

  return (
    <Link href={`/product/${product.slug}`}
      className="group bg-white border border-obsidian-100 hover:border-gold-300 transition-colors duration-200 flex flex-col overflow-hidden">

      {/* Image */}
      <div className="relative aspect-square bg-parchment overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-6 group-hover:scale-103 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-obsidian-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        )}

        {/* Type badge */}
        <span className="absolute top-3 left-3 bg-obsidian-900/80 text-cream text-[10px] tracking-widest2 uppercase px-2.5 py-1">
          {getFragranceTypeLabel(product.fragrance_type)}
        </span>

        {/* Vibe emoji badge */}
        {product.primary_vibe_emoji && (
          <span
            className="absolute top-3 right-3 bg-obsidian-900/80 text-sm px-1.5 py-0.5 rounded"
            title={product.primary_vibe_slug?.replace(/-/g, ' ') ?? ''}
          >
            {product.primary_vibe_emoji}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand + country flag */}
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-[10px] tracking-widest2 uppercase text-gold-500 font-sans">{brandName}</p>
          {countryFlag && (
            <span className="text-[11px] leading-none" title={countryCode ?? undefined}>{countryFlag}</span>
          )}
        </div>

        <h3 className="font-serif text-base font-light text-obsidian-900 leading-tight mb-2">
          {truncate(product.name, 48)}
        </h3>

        {/* Note pills */}
        {notePills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3" onClick={e => e.preventDefault()}>
            {notePills.map(note => (
              <Link
                key={note}
                href={`/note/${noteSlug(note)}`}
                className="text-[10px] bg-obsidian-50 text-obsidian-500 hover:bg-gold-50 hover:text-gold-700 px-2 py-0.5 border border-obsidian-100 hover:border-gold-200 transition-colors rounded-sm"
                onClick={e => e.stopPropagation()}
              >
                {note}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-obsidian-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest2 uppercase text-stone mb-0.5">From</p>
            <p className="font-serif text-lg text-obsidian-900">
              {product.lowest_price ? formatPriceUSD(product.lowest_price) : '—'}
            </p>
          </div>
          {(product.retailers_count ?? 0) > 0 && (
            <span className="text-[10px] tracking-widest2 uppercase text-stone">
              {product.retailers_count} {product.retailers_count === 1 ? 'store' : 'stores'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
