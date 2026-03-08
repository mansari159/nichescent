export interface Brand {
  id: string
  name: string
  slug: string
  country: string | null
  country_id?: string | null
  region: string
  description: string | null
  logo_url: string | null
  hero_image_url?: string | null
  founded_year?: number | null
  signature_style?: string | null
  common_notes?: string[]
  products_count: number
  website_url?: string | null
}

export interface Retailer {
  id: string
  name: string
  slug: string
  domain: string
  platform: string
  base_currency: string
  affiliate_url_pattern: string | null
  commission_rate: number | null
  logo_url: string | null
  country: string | null
  priority: number
}

export interface Product {
  id: string
  name: string
  slug: string
  brand_id: string
  brand?: Brand
  description: string | null
  fragrance_type: string
  concentration: string | null
  gender: string
  size_ml: number | null
  notes_top: string[]
  notes_mid: string[]
  notes_base: string[]
  image_url: string | null
  category_tags: string[]
  is_active?: boolean
  lowest_price: number | null
  retailers_count: number
  created_at: string
  updated_at?: string
  primary_vibe_slug?: string | null
  primary_vibe_emoji?: string | null
  current_prices?: PriceEntry[]
}

export interface Vibe {
  id: string
  name: string
  slug: string
  description: string | null
  emoji?: string
  color_hex?: string
  gradient_colors?: string[]
  display_order: number
  common_ingredients?: string[]
  best_for?: string | null
}

export interface Note {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
  illustration_url?: string | null
}

export interface PriceEntry {
  id: string
  product_id: string
  retailer_id: string
  retailer?: Retailer
  price: number
  currency: string
  price_usd: number | null
  product_url: string
  affiliate_url: string | null
  in_stock: boolean
  last_updated: string
}

export interface Country {
  id: string
  name: string
  slug?: string
  code: string
  flag_emoji: string
  region: string
  hero_image_url: string | null
  hero_video_url?: string | null
  heritage_description: string | null
  perfumery_tradition?: string | null
  display_order: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
}

export interface SearchResult {
  products: Product[]
  total: number
  query: string
}

export interface EmailSubscriber {
  id: string
  email: string
  source: string
  subscribed_at: string
}

export type Currency = 'USD' | 'AED' | 'SAR' | 'EUR' | 'GBP' | 'KWD'
export type FragranceType = 'edp' | 'edt' | 'parfum' | 'attar' | 'oil' | 'bakhoor' | 'body-mist'
export type Gender = 'men' | 'women' | 'unisex'

export interface SearchFilters {
  query?: string
  brands?: string[]
  types?: FragranceType[]
  genders?: Gender[]
  countries?: string[]
  vibes?: string[]
  priceRange?: '$' | '$$' | '$$$'
  inStockOnly?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name'
}
