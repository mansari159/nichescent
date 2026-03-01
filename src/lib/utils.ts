import type { Currency } from '@/types'

// ── Slugify ──────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// ── Currency formatting ───────────────────
const currencySymbols: Record<string, string> = {
  USD: '$', AED: 'AED ', SAR: 'SAR ', EUR: '€', GBP: '£', KWD: 'KWD ',
}

export function formatPrice(amount: number, currency: Currency | string = 'USD'): string {
  const symbol = currencySymbols[currency] ?? currency + ' '
  return `${symbol}${amount.toFixed(2)}`
}

export function formatPriceUSD(amount: number | null): string {
  if (!amount) return 'N/A'
  return `$${amount.toFixed(2)}`
}

// ── Fragrance type labels ─────────────────
export const fragranceTypeLabels: Record<string, string> = {
  edp: 'Eau de Parfum',
  edt: 'Eau de Toilette',
  parfum: 'Parfum',
  attar: 'Attar / Perfume Oil',
  oil: 'Perfume Oil',
  bakhoor: 'Bakhoor',
  'body-mist': 'Body Mist',
}

export function getFragranceTypeLabel(type: string): string {
  return fragranceTypeLabels[type] ?? type.toUpperCase()
}

// ── Gender labels ─────────────────────────
export const genderLabels: Record<string, string> = {
  men: 'For Men', women: 'For Women', unisex: 'Unisex',
}

// ── Affiliate URL builder ─────────────────
export function buildAffiliateUrl(
  productUrl: string,
  affiliatePattern: string | null
): string {
  if (!affiliatePattern) return productUrl
  // Pattern example: "{url}?ref=nichescent"
  if (affiliatePattern.includes('{url}')) {
    return affiliatePattern.replace('{url}', encodeURIComponent(productUrl))
  }
  return `${productUrl}?ref=nichescent`
}

// ── Time ago ──────────────────────────────
export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// ── Truncate ──────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

// ── Capitalize ────────────────────────────
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
