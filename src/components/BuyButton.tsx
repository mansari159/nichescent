'use client'
import { track } from '@vercel/analytics'

interface Props {
  href: string
  productName: string
}

export default function BuyButton({ href, productName }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="block w-full text-center py-3.5 bg-obsidian-900 text-cream text-xs tracking-widest uppercase hover:bg-gold-600 transition-colors"
      onClick={() => track('buy_click', { product: productName })}
    >
      Purchase Now →
    </a>
  )
}
