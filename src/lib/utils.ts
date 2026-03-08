import type { Currency } from '@/types'

// ─── Price Utilities ─────────────────────────────────────────────────────────

export function getPriceSymbol(priceUSD: number | null | undefined): string {
  if (!priceUSD) return '—'
  if (priceUSD < 50) return '$'
  if (priceUSD < 150) return '$$'
  return '$$$'
}

export function getPriceSymbolTitle(priceUSD: number | null | undefined): string {
  if (!priceUSD) return 'Price unavailable'
  if (priceUSD < 50) return 'Budget-friendly (under $50)'
  if (priceUSD < 150) return 'Mid-range ($50–$150)'
  return 'Premium ($150+)'
}

export function formatPriceUSD(amount: number | null): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export function formatPrice(amount: number, currency: Currency | string = 'USD'): string {
  const symbols: Record<string, string> = { USD: '$', AED: 'AED ', SAR: 'SAR ', EUR: '€', GBP: '£', KWD: 'KWD ' }
  const symbol = symbols[currency] ?? currency + ' '
  return `${symbol}${amount.toFixed(2)}`
}

// ─── Vibe System ─────────────────────────────────────────────────────────────

export interface VibeStyle {
  name: string
  colors: [string, string, string]
  css: string
  textColor: string
  borderColor: string
}

export const VIBE_MAP: Record<string, VibeStyle> = {
  'warm-spicy': {
    name: 'Warm & Spicy',
    colors: ['#FF6B35', '#FF4500', '#8B4513'],
    css: 'linear-gradient(135deg, #FF6B35, #FF4500, #8B4513)',
    textColor: '#FFF5EC',
    borderColor: '#FF6B35',
  },
  'woody-earthy': {
    name: 'Woody & Earthy',
    colors: ['#2D5016', '#3D6B26', '#8B7355'],
    css: 'linear-gradient(135deg, #2D5016, #3D6B26, #8B7355)',
    textColor: '#F0EAE0',
    borderColor: '#3D6B26',
  },
  'floral-romantic': {
    name: 'Floral & Romantic',
    colors: ['#FFC0CB', '#FFE4E1', '#F0A8B8'],
    css: 'linear-gradient(135deg, #FFC0CB, #FFE4E1, #F0A8B8)',
    textColor: '#5A1A2A',
    borderColor: '#FFC0CB',
  },
  'floral-delicate': {
    name: 'Floral & Delicate',
    colors: ['#FFC0CB', '#FFE4E1', '#FFFFFF'],
    css: 'linear-gradient(135deg, #FFC0CB, #FFE4E1, #FFFFFF)',
    textColor: '#5A1A2A',
    borderColor: '#FFC0CB',
  },
  'smoky-intense': {
    name: 'Smoky & Intense',
    colors: ['#2C2C2C', '#4A4A4A', '#696969'],
    css: 'linear-gradient(135deg, #2C2C2C, #4A4A4A, #696969)',
    textColor: '#E8E8E8',
    borderColor: '#4A4A4A',
  },
  'sweet-gourmand': {
    name: 'Sweet & Gourmand',
    colors: ['#FFD700', '#FFA500', '#D4A574'],
    css: 'linear-gradient(135deg, #FFD700, #FFA500, #D4A574)',
    textColor: '#3D2A00',
    borderColor: '#FFD700',
  },
  'fresh-clean': {
    name: 'Fresh & Clean',
    colors: ['#87CEEB', '#B0E0E6', '#E0F4FF'],
    css: 'linear-gradient(135deg, #87CEEB, #B0E0E6, #E0F4FF)',
    textColor: '#0A3D5C',
    borderColor: '#87CEEB',
  },
}

export function getVibeStyle(slug: string | null | undefined): VibeStyle | null {
  if (!slug) return null
  return VIBE_MAP[slug] ?? null
}

// ─── String Utilities ─────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function noteSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ─── Fragrance Type Labels ────────────────────────────────────────────────────

export const FRAGRANCE_TYPE_LABELS: Record<string, string> = {
  edp: 'EDP',
  edt: 'EDT',
  parfum: 'Parfum',
  attar: 'Attar',
  oil: 'Oil',
  bakhoor: 'Bakhoor',
  'body-mist': 'Body Mist',
}

export function getFragranceTypeLabel(type: string | null | undefined): string {
  if (!type) return 'Fragrance'
  return FRAGRANCE_TYPE_LABELS[type] ?? capitalize(type)
}

// ─── Gender Labels ────────────────────────────────────────────────────────────

export const genderLabels: Record<string, string> = {
  men: "Men's",
  women: "Women's",
  unisex: 'Unisex',
}

// ─── Description Cleaner ─────────────────────────────────────────────────────

export function cleanDescription(desc: string | null | undefined): string | null {
  if (!desc) return null
  const rawStart = desc.search(/\.\s+Top Notes\s/i)
  if (rawStart > 0) return desc.slice(0, rawStart + 1).trim()
  return desc.trim()
}

// ─── Affiliate URL ────────────────────────────────────────────────────────────

export function buildAffiliateUrl(productUrl: string, affiliatePattern: string | null): string {
  if (!affiliatePattern) return productUrl
  if (affiliatePattern.includes('{url}')) return affiliatePattern.replace('{url}', encodeURIComponent(productUrl))
  return `${productUrl}?ref=raretrace`
}

// ─── Time Ago ─────────────────────────────────────────────────────────────────

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export const fragranceTypeLabels = FRAGRANCE_TYPE_LABELS
