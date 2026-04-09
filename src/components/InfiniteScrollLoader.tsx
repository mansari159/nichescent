'use client'

import { useRef, useState, useCallback } from 'react'
import ProductCard from '@/components/ProductCard'
import EndState from '@/components/EndState'
import AdUnit from '@/components/AdUnit'
import type { Product } from '@/types'

interface Props {
  initialProducts: Product[]
  totalCount: number
  context?: string          // "all fragrances" | "UAE fragrances" | etc.
  category?: string         // for end state messaging
  fetchUrl: string          // API route to call, e.g. "/api/products"
  extraParams?: Record<string, string>
  showSidebarAd?: boolean
}

const BATCH_SIZE = 24

function SkeletonCard() {
  return (
    <div className="relative bg-white border border-obsidian-100 flex flex-col overflow-hidden animate-pulse">
      <div className="relative aspect-square bg-parchment" />
      <div className="p-4 flex flex-col flex-1 min-h-0">
        <div className="h-3 bg-obsidian-100 rounded mb-2 w-12" />
        <div className="h-4 bg-obsidian-100 rounded mb-3 w-full" />
        <div className="h-4 bg-obsidian-100 rounded mb-3 w-3/4" />
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-obsidian-100">
          <div className="h-3 bg-obsidian-100 rounded w-16" />
          <div className="h-3 bg-obsidian-100 rounded w-12" />
        </div>
      </div>
    </div>
  )
}

export default function InfiniteScrollLoader({
  initialProducts,
  totalCount,
  context = 'fragrances',
  category = 'fragrances',
  fetchUrl,
  extraParams = {},
  showSidebarAd = false,
}: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [reachedEnd, setReachedEnd] = useState(
    initialProducts.length >= totalCount
  )

  // Use refs to track mutable values inside the stable callback
  const offsetRef = useRef(initialProducts.length)
  const hasMoreRef = useRef(initialProducts.length < totalCount)
  const loadingRef = useRef(false)
  const fetchUrlRef = useRef(fetchUrl)
  const extraParamsRef = useRef(extraParams)

  // Keep refs in sync with latest props
  fetchUrlRef.current = fetchUrl
  extraParamsRef.current = extraParams

  // Stable callback — reads from refs, never changes identity
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return
    loadingRef.current = true
    setLoading(true)

    try {
      const params = new URLSearchParams({
        offset: String(offsetRef.current),
        limit: String(BATCH_SIZE),
        ...extraParamsRef.current,
      })
      const res = await fetch(`${fetchUrlRef.current}?${params}`)
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      const data: { products: Product[]; total: number } = await res.json()

      if (!data.products || data.products.length === 0) {
        hasMoreRef.current = false
        setReachedEnd(true)
        return
      }

      setProducts(prev => {
        // Deduplicate by id in case of re-renders
        const existingIds = new Set(prev.map(p => p.id))
        const newOnes = data.products.filter(p => !existingIds.has(p.id))
        return [...prev, ...newOnes]
      })

      offsetRef.current += data.products.length
      const done = data.products.length < BATCH_SIZE || offsetRef.current >= data.total
      if (done) {
        hasMoreRef.current = false
        setReachedEnd(true)
      }
    } catch (err) {
      console.error('InfiniteScroll load error:', err)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, []) // No dependencies — reads everything from refs

  // Insert ad every 48 products
  const withAds: (Product | 'ad')[] = []
  products.forEach((p, i) => {
    withAds.push(p)
    if ((i + 1) % 48 === 0 && i < products.length - 1) withAds.push('ad')
  })

  return (
    <div className="relative">
      {/* Sticky sidebar ad (desktop) */}
      {showSidebarAd && (
        <div className="hidden xl:block absolute -right-44 top-0 w-36">
          <div className="sticky top-24">
            <AdUnit position="sidebar_sticky" />
          </div>
        </div>
      )}

      {/* Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {withAds.map((item, i) =>
            item === 'ad' ? (
              <div key={`ad-${i}`} className="col-span-2 sm:col-span-3 lg:col-span-4">
                <AdUnit position="in_feed" />
              </div>
            ) : (
              <ProductCard key={item.id} product={item} priority={i < 4} />
            )
          )}
        </div>
      )}

      {/* Load more button + skeleton */}
      {!reachedEnd && (
        <div className="mt-12 flex flex-col items-center gap-6">
          {loading ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-obsidian-400 tracking-widest uppercase">
                  Loading more {category}…
                </span>
              </div>
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={loadMore}
                className="border border-obsidian-300 text-obsidian-700 text-xs tracking-widest uppercase px-10 py-3.5 hover:bg-obsidian-900 hover:text-cream hover:border-obsidian-900 transition-colors duration-200"
              >
                Load more {category}
              </button>
              <p className="text-xs text-obsidian-400">
                Showing {products.length} of {totalCount}
              </p>
            </div>
          )}
        </div>
      )}

      {/* End state */}
      {reachedEnd && (
        <EndState
          context={context}
          category={category}
          count={products.length}
        />
      )}
    </div>
  )
}
