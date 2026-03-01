import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { formatPriceUSD, getFragranceTypeLabel, truncate } from '@/lib/utils'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const brandName = product.brand?.name ?? ''

  return (
    <Link href={`/product/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-gold-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">

      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        )}

        {/* Type badge */}
        <span className="absolute top-2 left-2 bg-navy-900 text-white text-xs px-2 py-0.5 rounded-full opacity-90">
          {getFragranceTypeLabel(product.fragrance_type)}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gold-600 font-medium mb-0.5">{brandName}</p>
        <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
          {truncate(product.name, 50)}
        </h3>

        {/* Scent notes preview */}
        {product.notes_top.length > 0 && (
          <p className="text-xs text-gray-400 mb-2 leading-relaxed">
            {[...product.notes_top, ...product.notes_mid].slice(0, 3).join(' · ')}
          </p>
        )}

        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">From</span>
            <p className="text-base font-bold text-navy-900">
              {product.lowest_price ? formatPriceUSD(product.lowest_price) : 'Check price'}
            </p>
          </div>
          {product.retailers_count > 0 && (
            <span className="text-xs text-gray-400">
              {product.retailers_count} {product.retailers_count === 1 ? 'retailer' : 'retailers'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
