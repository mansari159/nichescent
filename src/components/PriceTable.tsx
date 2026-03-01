'use client'
import { useState } from 'react'
import type { PriceEntry } from '@/types'
import { formatPrice, formatPriceUSD, timeAgo } from '@/lib/utils'

interface Props {
  prices: PriceEntry[]
  productId: string
  productSlug: string
}

export default function PriceTable({ prices, productId, productSlug }: Props) {
  const [currency, setCurrency] = useState<'USD' | 'original'>('USD')
  const sorted = [...prices].sort((a, b) => (a.price_usd ?? 0) - (b.price_usd ?? 0))

  async function handleBuyClick(price: PriceEntry) {
    // Track the click
    await fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        retailer_id: price.retailer_id,
        source_page: 'product',
      }),
    }).catch(() => {})

    const url = price.affiliate_url || price.product_url
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!prices.length) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
        No prices available yet. Check back soon.
      </div>
    )
  }

  return (
    <div>
      {/* Currency toggle */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Price Comparison</h2>
        <div className="flex text-xs border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1.5 ${currency === 'USD' ? 'bg-navy-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            USD
          </button>
          <button
            onClick={() => setCurrency('original')}
            className={`px-3 py-1.5 ${currency === 'original' ? 'bg-navy-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Local
          </button>
        </div>
      </div>

      {/* Price rows */}
      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
        {sorted.map((price, index) => (
          <div key={price.id}
            className={`flex items-center justify-between px-4 py-3 ${index === 0 ? 'bg-green-50' : 'bg-white hover:bg-gray-50'} transition-colors`}>

            <div className="flex items-center gap-3 min-w-0">
              {/* Best deal badge */}
              {index === 0 && (
                <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full shrink-0">
                  Best deal
                </span>
              )}
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {price.retailer?.name ?? 'Retailer'}
                </p>
                <p className="text-xs text-gray-400">
                  Updated {timeAgo(price.last_updated)}
                  {!price.in_stock && <span className="ml-2 text-red-500">· Out of stock</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {currency === 'USD'
                    ? formatPriceUSD(price.price_usd)
                    : formatPrice(price.price, price.currency)}
                </p>
                {currency === 'USD' && price.currency !== 'USD' && (
                  <p className="text-xs text-gray-400">
                    {formatPrice(price.price, price.currency)}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleBuyClick(price)}
                disabled={!price.in_stock}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                  price.in_stock
                    ? index === 0
                      ? 'bg-gold-500 hover:bg-gold-600 text-white'
                      : 'bg-navy-900 hover:bg-navy-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                {price.in_stock ? 'Buy Now →' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-2">
        * We may earn a commission on purchases.{' '}
        <a href="/affiliate-disclosure" className="underline hover:text-gray-600">Learn more</a>
      </p>
    </div>
  )
}
