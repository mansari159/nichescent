'use client'

import InfiniteScrollLoader from '@/components/InfiniteScrollLoader'
import type { Product } from '@/types'

interface Props {
  initialProducts: Product[]
  total: number
}

export default function HomepageInfiniteScroll({ initialProducts, total }: Props) {
  return (
    <InfiniteScrollLoader
      initialProducts={initialProducts}
      totalCount={total}
      fetchUrl="/api/products"
      context="all fragrances"
      category="fragrances"
      showSidebarAd
    />
  )
}
