'use client'

import { useEffect, useRef } from 'react'

interface Props {
  position: 'before_scroll' | 'in_feed' | 'sidebar_sticky' | 'product_page' | 'after_purchase'
  className?: string
}

// Google AdSense slot IDs — replace with real IDs after AdSense approval
const AD_SLOTS: Record<Props['position'], string> = {
  before_scroll: '1234567890',
  in_feed: '2345678901',
  sidebar_sticky: '3456789012',
  product_page: '4567890123',
  after_purchase: '5678901234',
}

const AD_SIZES: Record<Props['position'], { width: number; height: number; label: string }> = {
  before_scroll: { width: 728, height: 90, label: 'Leaderboard' },
  in_feed: { width: 970, height: 90, label: 'In-Feed Banner' },
  sidebar_sticky: { width: 160, height: 600, label: 'Wide Skyscraper' },
  product_page: { width: 300, height: 250, label: 'Medium Rectangle' },
  after_purchase: { width: 300, height: 250, label: 'Medium Rectangle' },
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdUnit({ position, className = '' }: Props) {
  const adRef = useRef<HTMLModElement>(null)
  const initialized = useRef(false)
  const size = AD_SIZES[position]

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch (e) {
      console.warn('AdSense push error:', e)
    }
  }, [])

  // In development, show placeholder
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`flex items-center justify-center bg-obsidian-50 border border-dashed border-obsidian-200 text-obsidian-300 text-[10px] tracking-widest uppercase ${className}`}
        style={{ minHeight: Math.min(size.height, 120), width: '100%' }}
      >
        Ad · {size.label} ({size.width}×{size.height})
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: size.height }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-XXXXXXXXXXXXXXXX'}
        data-ad-slot={AD_SLOTS[position]}
        data-ad-format={position === 'sidebar_sticky' ? 'vertical' : 'horizontal'}
        data-full-width-responsive="true"
      />
    </div>
  )
}
