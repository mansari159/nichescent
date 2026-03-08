'use client'

import dynamic from 'next/dynamic'

const InfiniteScrollLoader = dynamic(() => import('@/components/InfiniteScrollLoader'), { ssr: false })

interface Props {
  initialCount: number
  total: number
}

export default function HomepageInfiniteScroll({ initialCount, total }: Props) {
  return (
    <InfiniteScrollLoader
      initialProducts={[]}
      totalCount={total}
      fetchUrl="/api/products"
      extraParams={{ offset: String(initialCount) }}
      context="all fragrances"
      category="fragrances"
      showSidebarAd
    />
  )
}
