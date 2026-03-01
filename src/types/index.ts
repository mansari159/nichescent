export interface Brand {
  id: string
  name: string
  slug: string
  country: string | null
  region: string
  description: string | null
  logo_url: string | null
  products_count: number
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
  lowest_price: number | null
  retailers_count: number
  created_at: string
  current_prices?: PriceEntry[]
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

export type Currency = 'USD' | 'AED' | 'SAR' | 'EUR' | 'GBP' | 'KWD'

export type FragranceType = 'edp' | 'edt' | 'parfum' | 'attar' | 'oil' | 'bakhoor' | 'body-mist'

export type Gender = 'men' | 'women' | 'unisex'

export interface SearchFilters {
  query?: string
  brands?: string[]
  types?: FragranceType[]
  genders?: Gender[]
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name'
}
