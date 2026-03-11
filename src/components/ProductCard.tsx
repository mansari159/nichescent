'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { formatPriceUSD, getVibeStyle, getFragranceTypeLabel, truncate, noteSlug } from '@/lib/utils'
import { getCountryFlag } from '@/lib/countries'
import NotePill from '@/components/NotePill'

interface Props {
  product: Product
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: Props) {
  const brandName = product.brand?.name ?? ''
  const countryCode = product.brand?.country ?? null
  const countryFlag = getCountryFlag(countryCode)
  const vibeStyle = getVibeStyle(product.primary_vibe_slug)
  const notePills = [...(product.notes_top ?? []), ...(product.notes_mid ?? [])].slice(0, 3)
  const desc = product.description?.slice(0, 120) ?? ''

  return (
    <Link
      href={`/fragrance/${product.slug}`}
      className="group relative bg-white border border-obsidian-100 hover:border-gold-300 transition-all duration-200 flex flex-col overflow-hidden"
      style={vibeStyle ? { borderLeft: `3px solid ${vibeStyle.borderColor}` } : undefined}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-parchment overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={`${product.name} by ${brandName}`}
            fill
            priority={priority}
            className="object-contain p-5 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-obsidian-100 flex items-center justify-center">
              <span className="font-serif text-2xl text-obsidian-400">
                {brandName.charAt(0) || '?'}
              </span>
            </div>
          </div>
        )}

        {/* Country flag badge — top left */}
        {countryFlag && (
          <span
            className="absolute top-2.5 left-2.5 text-base leading-none z-10"
            title={countryCode ?? undefined}
            aria-label={`Origin: ${countryCode}`}
          >
            {countryFlag}
          </span>
        )}

        {/* Vibe gradient badge — top right */}
        {vibeStyle && (
          <span
            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full z-10 ring-1 ring-white/50"
            style={{ background: vibeStyle.css }}
            title={vibeStyle.name}
            aria-label={`Vibe: ${vibeStyle.name}`}
          />
        )}

        {/* Type badge */}
        <span className="absolute bottom-2.5 left-2.5 bg-obsidian-900/80 backdrop-blur-sm text-cream text-[10px] tracking-widest uppercase px-2 py-0.5 z-10">
          {getFragranceTypeLabel(product.fragrance_type)}
        </span>

        {/* Hover overlay — description only, no note pills */}
        {desc && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-obsidian-950/92 backdrop-blur-sm p-4 z-20">
            <p className="text-xs text-obsidian-200 leading-relaxed line-clamp-4">{desc}</p>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-4 flex flex-col flex-1 min-h-0">
        {/* Brand name */}
        <p className="text-[11px] tracking-widest uppercase text-gold-500 font-sans mb-1 truncate">
          {brandName}
        </p>

        {/* Fragrance name */}
        <h3 className="font-serif text-base font-light text-obsidian-900 leading-snug mb-3 flex-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Always-visible note pills */}
        {notePills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {notePills.map(note => (
              <NotePill key={note} note={note} />
            ))}
          </div>
        )}

        {/* Price + store count */}
        <div className="flex items-center justify-between pt-3 border-t border-obsidian-100">
          <p className="text-sm font-medium text-obsidian-900">
            {product.lowest_price ? `From ${formatPriceUSD(product.lowest_price)}` : '—'}
          </p>
          {(product.retailers_count ?? 0) > 0 && (
            <span className="text-[10px] text-obsidian-400">
              {product.retailers_count} {product.retailers_count === 1 ? 'store' : 'stores'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
