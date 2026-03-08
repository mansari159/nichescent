'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
  const sentinel = useRef<HTMLDivElement>(null)

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

  // Set up IntersectionObserver once on mount, tear down on unmount
  useEffect(() => {
    const el = sentinel.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore]) // loadMore is stable, so this runs once

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {/* Sentinel — sits below the grid; when visible, triggers loadMore */}
      {!reachedEnd && (
        <div ref={sentinel} className="h-4 mt-4" aria-hidden="true" />
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-obsidian-400 tracking-widest uppercase">
            Loading more {category}…
          </span>
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
