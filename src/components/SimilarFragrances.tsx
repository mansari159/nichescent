import Link from 'next/link'
import Image from 'next/image'
import { getSimilarProducts } from '@/lib/similarity'
import { formatPriceUSD, getFragranceTypeLabel } from '@/lib/utils'

interface Props {
  productId: string
}

export default async function SimilarFragrances({ productId }: Props) {
  const products = await getSimilarProducts(productId, 6)
  if (products.length === 0) return null

  return (
    <section className="mt-16 border-t border-obsidian-100 pt-12">
      <div className="mb-6">
        <p className="text-xs tracking-widest2 uppercase text-obsidian-400 mb-1">Discover more</p>
        <h2 className="font-serif text-3xl text-obsidian-900 font-light">Similar Fragrances</h2>
      </div>

      {/* Horizontally scrollable carousel */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
          {products.map(product => {
            const brandName = product.brand?.name ?? ''
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group flex-shrink-0 w-44 snap-start border border-obsidian-100 hover:border-gold-300 bg-white transition-colors duration-200 flex flex-col overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square bg-parchment overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      sizes="176px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-obsidian-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-obsidian-900/80 text-cream text-[9px] tracking-widest2 uppercase px-2 py-0.5">
                    {getFragranceTypeLabel(product.fragrance_type)}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1">
                  <p className="text-[9px] tracking-widest2 uppercase text-gold-500 mb-0.5 truncate">{brandName}</p>
                  <h3 className="font-serif text-sm font-light text-obsidian-900 leading-snug line-clamp-2 mb-auto">
                    {product.name}
                  </h3>
                  <div className="mt-2 pt-2 border-t border-obsidian-50">
                    <p className="font-serif text-base text-obsidian-900">
                      {product.lowest_price ? formatPriceUSD(product.lowest_price) : '—'}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
