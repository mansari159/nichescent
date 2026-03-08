'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import ProductCard from '@/components/ProductCard'
import EndState from '@/components/EndState'
import AdUnit from '@/components/AdUnit'
import type { Product, SearchFilters } from '@/types'

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
  const [offset, setOffset] = useState(initialProducts.length)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialProducts.length < totalCount)
  const [reachedEnd, setReachedEnd] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)

    try {
      const params = new URLSearchParams({ offset: String(offset), limit: String(BATCH_SIZE), ...extraParams })
      const res = await fetch(`${fetchUrl}?${params}`)
      if (!res.ok) throw new Error('Fetch failed')
      const data: { products: Product[]; total: number } = await res.json()

      setProducts(prev => [...prev, ...data.products])
      const newOffset = offset + data.products.length
      setOffset(newOffset)

      if (data.products.length < BATCH_SIZE || newOffset >= data.total) {
        setHasMore(false)
        setReachedEnd(true)
      }
    } catch (err) {
      console.error('InfiniteScroll load error:', err)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [fetchUrl, offset, hasMore, extraParams])

  useEffect(() => {
    const el = sentinel.current
    if (!el || !hasMore) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, hasMore])

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

      {/* Sentinel for IntersectionObserver */}
      {hasMore && <div ref={sentinel} className="h-1" />}

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-obsidian-400 tracking-widest uppercase">Loading more {category}…</span>
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
