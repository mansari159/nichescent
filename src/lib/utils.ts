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

// ─── Brand Logo Map ───────────────────────────────────────────────────────────
// Clearbit / CDN logo URLs keyed by brand slug.
// Used as a fallback when brands.logo_url is null in the DB.
// Run `npm run logos` to persist these into the DB.
// Known brand slugs → confirmed domain for logo lookup.
// Priority: logo_url from DB > this map > website_url domain > Google Favicon guess
export const BRAND_LOGO_MAP: Record<string, string> = {
  // ── UAE / Gulf ────────────────────────────────────────────────────────────
  'lattafa':                   'https://logo.clearbit.com/lattafaperfumes.com',
  'ajmal':                     'https://logo.clearbit.com/ajmalperfume.com',
  'rasasi':                    'https://logo.clearbit.com/rasasi.com',
  'swiss-arabian':             'https://logo.clearbit.com/swissarabian.com',
  'gissah':                    'https://logo.clearbit.com/gissah.com',
  'amouage':                   'https://logo.clearbit.com/amouage.com',
  'al-haramain':               'https://logo.clearbit.com/alharamain.com',
  'kayali':                    'https://logo.clearbit.com/kayali.com',
  'armaf':                     'https://logo.clearbit.com/armaf.com',
  'maison-alhambra':           'https://logo.clearbit.com/maisonalhambra.com',
  'arabian-oud':               'https://logo.clearbit.com/arabianoud.com',
  'spirit-of-dubai':           'https://logo.clearbit.com/spiritofdubai.com',
  'afnan':                     'https://logo.clearbit.com/afnanperfumes.com',
  'khadlaj':                   'https://logo.clearbit.com/khadlaj.com',
  'ard-al-zaafaran':           'https://logo.clearbit.com/ardalzaafaran.com',
  'attar-collection':          'https://logo.clearbit.com/attarcollection.com',
  'widian':                    'https://logo.clearbit.com/widian.com',
  'zimaya':                    'https://logo.clearbit.com/zimayaperfumes.com',
  'orientica':                 'https://logo.clearbit.com/orientica.com',
  'fragrance-world':           'https://logo.clearbit.com/fragranceworld.com',
  'paris-corner':              'https://logo.clearbit.com/pariscornerperfumes.com',
  'nabeel':                    'https://logo.clearbit.com/nabeelperfumes.com',
  'assaf':                     'https://logo.clearbit.com/assafperfumes.com',
  'al-rehab':                  'https://logo.clearbit.com/alrehab.net',
  'riiffs':                    'https://logo.clearbit.com/riiffs.com',
  'rue-broca':                 'https://logo.clearbit.com/ruebroca.com',
  'kajal':                     'https://logo.clearbit.com/kajalperfumes.com',
  'ghawali':                   'https://logo.clearbit.com/ghawali.com',
  'arabiyat-prestige':         'https://logo.clearbit.com/arabiyatprestige.com',
  'gulf-orchid':               'https://logo.clearbit.com/gulforchid.com',
  'yas-perfumes':              'https://logo.clearbit.com/yasperfumes.com',
  'abdul-samad-al-qurashi':   'https://logo.clearbit.com/aqperfumes.com',
  'surrati':                   'https://logo.clearbit.com/surrati.com',
  'al-nuaim':                  'https://logo.clearbit.com/alnuaim.com',
  'maison-asrar':              'https://logo.clearbit.com/maisonasrar.com',
  'navitus':                   'https://logo.clearbit.com/navitusperfumes.com',
  'rayhaan':                   'https://logo.clearbit.com/rayhaan.com',
  'emper':                     'https://logo.clearbit.com/emper.com',
  'french-avenue':             'https://logo.clearbit.com/frenchavenueperfumes.com',
  'louis-cardin':              'https://logo.clearbit.com/louiscardin.com',
  'al-wataniah':               'https://logo.clearbit.com/alwataniah.com',
  'hamidi':                    'https://logo.clearbit.com/hamidioud.com',
  'reef-perfumes':             'https://logo.clearbit.com/reefperfumes.com',
  'sapil':                     'https://logo.clearbit.com/sapil.com',
  'hind-al-oud':               'https://logo.clearbit.com/hindaloud.com',
  'ibraq':                     'https://logo.clearbit.com/ibraqperfumes.com',
  'dukhni':                    'https://logo.clearbit.com/dukhni.com',
  'el-nabil':                  'https://logo.clearbit.com/elnabil.com',
  'ahmed-al-maghribi':         'https://logo.clearbit.com/ahmadalmaghribi.com',
  'naseem':                    'https://logo.clearbit.com/naseemfragrances.com',
  'khalis':                    'https://logo.clearbit.com/khalisperfumes.com',
  'suroori':                   'https://logo.clearbit.com/suroori.com',
  'memo-paris':                'https://logo.clearbit.com/memoparis.com',
  'al-qasr':                   'https://logo.clearbit.com/alqasrperfumes.com',
  'silver-mountain':           'https://logo.clearbit.com/silvermountainperfumes.com',
  'niche-oud':                 'https://logo.clearbit.com/nicheoud.com',
  'oud-elite':                 'https://logo.clearbit.com/oudelite.com',
  'al-fares':                  'https://logo.clearbit.com/alfaresperfumes.com',
  'deray':                     'https://logo.clearbit.com/derayperfumes.com',
  'al-mas':                    'https://logo.clearbit.com/almasperfumes.com',
  'al-baraka':                 'https://logo.clearbit.com/albarakaperfumes.com',
  'oud-mood':                  'https://logo.clearbit.com/oudmood.com',
  'pendora':                   'https://logo.clearbit.com/pendorascent.com',
  'ex-nihilo':                 'https://logo.clearbit.com/ex-nihilo-paris.com',
  'roja-dove':                 'https://logo.clearbit.com/rojadove.com',
  'maison-francis-kurkdjian':  'https://logo.clearbit.com/franciskurkdjian.com',
  // ── Saudi Arabia ──────────────────────────────────────────────────────────
  'haramain':                  'https://logo.clearbit.com/alharamain.com',
  'ahmed-al-maghribi-sa':     'https://logo.clearbit.com/ahmadalmaghribi.com',
  'zuhoor-al-reehan':         'https://logo.clearbit.com/zuhoorialreehan.com',
  'misk':                      'https://logo.clearbit.com/misk.com',
  // ── Kuwait ────────────────────────────────────────────────────────────────
  'royal-diwan':               'https://logo.clearbit.com/royaldiwan.com',
  'kuwait-shop':               'https://logo.clearbit.com/kuwaitshop.com',
  // ── India / South Asia ────────────────────────────────────────────────────
  'nemat':                     'https://logo.clearbit.com/nematfragrances.com',
  'kama-ayurveda':             'https://logo.clearbit.com/kamaayurveda.com',
  'gulshan':                   'https://logo.clearbit.com/gulshan.in',
  'darvesh':                   'https://logo.clearbit.com/darveshperfumes.com',
  'al-ameen':                  'https://logo.clearbit.com/alameen.com',
  // ── France / Europe ───────────────────────────────────────────────────────
  'serge-lutens':              'https://logo.clearbit.com/sergelutens.com',
  'diptyque':                  'https://logo.clearbit.com/diptyqueparis.com',
  'frederic-malle':            'https://logo.clearbit.com/fredericmalle.com',
  'byredo':                    'https://logo.clearbit.com/byredo.com',
  'juliette-has-a-gun':        'https://logo.clearbit.com/juliettehasagun.com',
  'etat-libre-dorange':        'https://logo.clearbit.com/etatlibredorange.com',
  'sweet-anthem':              'https://logo.clearbit.com/sweetanthem.com',
  'initio':                    'https://logo.clearbit.com/initiofragrances.com',
  'nishane':                   'https://logo.clearbit.com/nishane.com.tr',
  'orto-parisi':               'https://logo.clearbit.com/ortoparisi.com',
  'bdk-parfums':               'https://logo.clearbit.com/bdkparfums.com',
  'xerjoff':                   'https://logo.clearbit.com/xerjoff.com',
  'parfums-de-marly':          'https://logo.clearbit.com/parfumsdemarly.com',
  'creed':                     'https://logo.clearbit.com/creed.com',
  'clive-christian':           'https://logo.clearbit.com/clivechristian.com',
  'niche-love':                'https://logo.clearbit.com/nichelove.com',
  'vilhelm-parfumerie':        'https://logo.clearbit.com/vilhelmparfumerie.com',
  'bortnikoff':                'https://logo.clearbit.com/bortnikoff.com',
  'stephane-humbert-lucas':    'https://logo.clearbit.com/stéphanehumebtlucas777.com',
  '377':                       'https://logo.clearbit.com/shl777.com',
  // ── USA ───────────────────────────────────────────────────────────────────
  'commodity':                 'https://logo.clearbit.com/commoditygoods.com',
  'henry-rose':                'https://logo.clearbit.com/henryrose.com',
  'dedcool':                   'https://logo.clearbit.com/dedcool.com',
  // ── Japan ─────────────────────────────────────────────────────────────────
  'juniper-berry':             'https://logo.clearbit.com/juniperberry.jp',
  'shiro':                     'https://logo.clearbit.com/shiro-shiro.jp',
}

/**
 * Returns the best available logo URL for a brand.
 * Priority: DB logo_url → BRAND_LOGO_MAP → website_url domain → null
 * Google Favicon API is used when a confirmed domain is available.
 */
export function getBrandLogoUrl(
  brand: { slug: string; logo_url?: string | null; website_url?: string | null }
): string | null {
  if (brand.logo_url) return brand.logo_url
  if (BRAND_LOGO_MAP[brand.slug]) return BRAND_LOGO_MAP[brand.slug]
  // Extract domain from website_url and use Google Favicon API (reliable, free, no rate limit)
  if (brand.website_url) {
    try {
      const domain = new URL(brand.website_url).hostname.replace(/^www\./, '')
      if (domain) return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
    } catch {
      // malformed URL — fall through
    }
  }
  return null
}

// ─── Note Category System ─────────────────────────────────────────────────────

export type NoteCategory = 'floral' | 'wood' | 'spice' | 'musk' | 'citrus' | 'other'

const NOTE_CATEGORY_MAP: Record<string, NoteCategory> = {
  // Florals
  'rose': 'floral', 'jasmine': 'floral', 'ylang-ylang': 'floral', 'ylang ylang': 'floral',
  'violet': 'floral', 'iris': 'floral', 'tuberose': 'floral', 'peony': 'floral',
  'orange blossom': 'floral', 'neroli': 'floral', 'geranium': 'floral', 'lily': 'floral',
  'carnation': 'floral', 'magnolia': 'floral', 'cherry blossom': 'floral',
  // Woods & Resins
  'oud': 'wood', 'agarwood': 'wood', 'sandalwood': 'wood', 'cedar': 'wood',
  'cedarwood': 'wood', 'vetiver': 'wood', 'patchouli': 'wood', 'frankincense': 'wood',
  'myrrh': 'wood', 'benzoin': 'wood', 'labdanum': 'wood', 'incense': 'wood',
  'guaiac wood': 'wood', 'birch': 'wood', 'smoke': 'wood',
  // Spices
  'saffron': 'spice', 'cardamom': 'spice', 'pepper': 'spice', 'black pepper': 'spice',
  'cinnamon': 'spice', 'clove': 'spice', 'nutmeg': 'spice', 'ginger': 'spice',
  'cumin': 'spice', 'coriander': 'spice', 'pink pepper': 'spice',
  // Musks & Ambers
  'musk': 'musk', 'white musk': 'musk', 'amber': 'musk', 'ambergris': 'musk',
  'tonka bean': 'musk', 'tonka': 'musk', 'vanilla': 'musk', 'benzyl benzoate': 'musk',
  'cashmeran': 'musk', 'civet': 'musk',
  // Citrus & Fresh
  'bergamot': 'citrus', 'lemon': 'citrus', 'lime': 'citrus', 'orange': 'citrus',
  'grapefruit': 'citrus', 'mandarin': 'citrus', 'petitgrain': 'citrus',
  'yuzu': 'citrus', 'sea salt': 'citrus', 'aquatic': 'citrus',
}

export const NOTE_CATEGORY_STYLES: Record<NoteCategory, { bg: string; text: string; border: string }> = {
  floral:  { bg: '#fce8e8', text: '#8a3030', border: '#f0bcbc' },
  wood:    { bg: '#f5ede0', text: '#6b3d18', border: '#e0c9a8' },
  spice:   { bg: '#fdf0d8', text: '#7a4800', border: '#f0d49a' },
  musk:    { bg: '#f0ede8', text: '#4a433c', border: '#d8d0c5' },
  citrus:  { bg: '#f0f7e8', text: '#3a5c18', border: '#c8e0a8' },
  other:   { bg: '#f7f5f2', text: '#5e5143', border: '#ede9e3' },
}

export function getNoteCategory(note: string): NoteCategory {
  return NOTE_CATEGORY_MAP[note.toLowerCase()] ?? 'other'
}
