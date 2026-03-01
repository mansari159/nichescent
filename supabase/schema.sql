-- NicheScent Database Schema
-- Run this in your Supabase SQL editor: supabase.com > SQL Editor > New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- for fuzzy search

-- ─────────────────────────────────────────
-- BRANDS
-- ─────────────────────────────────────────
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  country TEXT,
  region TEXT DEFAULT 'MENA', -- 'MENA', 'European', 'American', 'Asian'
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  products_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- RETAILERS
-- ─────────────────────────────────────────
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'shopify', -- 'shopify', 'woocommerce', 'custom'
  base_currency TEXT NOT NULL DEFAULT 'USD',
  affiliate_url_pattern TEXT,
  affiliate_program TEXT DEFAULT 'none', -- 'direct', 'shareasale', 'cj', 'none'
  commission_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  products_count INTEGER DEFAULT 0,
  logo_url TEXT,
  country TEXT,
  priority INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PRODUCTS (canonical)
-- ─────────────────────────────────────────
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand_id UUID REFERENCES brands(id),
  description TEXT,
  fragrance_type TEXT DEFAULT 'edp', -- 'edp','edt','parfum','attar','oil','bakhoor','body-mist'
  concentration TEXT,
  gender TEXT DEFAULT 'unisex',       -- 'men','women','unisex'
  size_ml INTEGER,
  notes_top TEXT[] DEFAULT '{}',
  notes_mid TEXT[] DEFAULT '{}',
  notes_base TEXT[] DEFAULT '{}',
  image_url TEXT,
  category_tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  lowest_price DECIMAL(10,2),
  retailers_count INTEGER DEFAULT 0,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_type ON products(fragrance_type);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_price ON products(lowest_price);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.notes_top, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.notes_mid, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.notes_base, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.category_tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_search
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- ─────────────────────────────────────────
-- CURRENT PRICES
-- ─────────────────────────────────────────
CREATE TABLE current_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  price_usd DECIMAL(10,2),
  product_url TEXT NOT NULL,
  affiliate_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, retailer_id)
);

CREATE INDEX idx_prices_product ON current_prices(product_id);
CREATE INDEX idx_prices_price_usd ON current_prices(price_usd);

-- ─────────────────────────────────────────
-- RAW SCRAPER LISTINGS
-- ─────────────────────────────────────────
CREATE TABLE scraper_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retailer_id UUID NOT NULL REFERENCES retailers(id),
  external_id TEXT,
  raw_name TEXT NOT NULL,
  raw_brand TEXT,
  raw_price DECIMAL(10,2),
  raw_currency TEXT DEFAULT 'USD',
  raw_description TEXT,
  raw_image_url TEXT,
  raw_url TEXT NOT NULL,
  raw_data JSONB,
  matched_product_id UUID REFERENCES products(id),
  match_confidence DECIMAL(3,2),
  match_status TEXT DEFAULT 'pending', -- 'pending','matched','rejected'
  last_scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(retailer_id, external_id)
);

-- ─────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE product_categories (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- ─────────────────────────────────────────
-- CLICK EVENTS (affiliate analytics)
-- ─────────────────────────────────────────
CREATE TABLE click_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  retailer_id UUID REFERENCES retailers(id),
  source_page TEXT, -- 'search','product','category','homepage'
  search_query TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clicks_product ON click_events(product_id);
CREATE INDEX idx_clicks_date ON click_events(clicked_at);

-- ─────────────────────────────────────────
-- EXCHANGE RATES
-- ─────────────────────────────────────────
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL DEFAULT 'USD',
  rate DECIMAL(12,6) NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- ─────────────────────────────────────────
-- SEED: Categories
-- ─────────────────────────────────────────
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Ouds & Oud Blends', 'ouds', 'Fragrances with oud as a primary note', 1),
  ('Attars & Perfume Oils', 'attars', 'Traditional oil-based perfumes, no alcohol', 2),
  ('Bakhoor & Incense', 'bakhoor', 'Scented chips for burning', 3),
  ('Under $30', 'under-30', 'Great niche fragrances under $30', 4),
  ('Under $50', 'under-50', 'Quality niche fragrances under $50', 5),
  ('Unisex', 'unisex', 'Gender-neutral fragrances', 6),
  ('New Arrivals', 'new-arrivals', 'Recently added to the catalog', 7);

-- ─────────────────────────────────────────
-- SEED: Retailers
-- ─────────────────────────────────────────
INSERT INTO retailers (name, slug, domain, platform, base_currency, country, priority) VALUES
  ('Lattafa USA', 'lattafa-usa', 'www.lattafa-usa.com', 'shopify', 'USD', 'AE', 1),
  ('Afnan Perfumes', 'afnan', 'afnan.com', 'shopify', 'USD', 'AE', 1),
  ('Dukhni', 'dukhni', 'dukhni.us', 'shopify', 'USD', 'AE', 1),
  ('Intense Oud', 'intense-oud', 'www.intenseoud.com', 'shopify', 'USD', 'US', 2),
  ('The Oud Store', 'the-oud-store', 'www.oudstore.com', 'shopify', 'USD', 'US', 2),
  ('Fragrance World', 'fragrance-world', 'shopfragranceworld.com', 'shopify', 'USD', 'AE', 2),
  ('FragranceX', 'fragrancex', 'www.fragrancex.com', 'custom', 'USD', 'US', 1),
  ('FragranceNet', 'fragrancenet', 'www.fragrancenet.com', 'custom', 'USD', 'US', 1);

-- ─────────────────────────────────────────
-- SEED: Brands
-- ─────────────────────────────────────────
INSERT INTO brands (name, slug, country, region) VALUES
  ('Arabian Oud', 'arabian-oud', 'SA', 'MENA'),
  ('Ajmal', 'ajmal', 'AE', 'MENA'),
  ('Swiss Arabian', 'swiss-arabian', 'AE', 'MENA'),
  ('Rasasi', 'rasasi', 'AE', 'MENA'),
  ('Al Haramain', 'al-haramain', 'SA', 'MENA'),
  ('Lattafa', 'lattafa', 'AE', 'MENA'),
  ('Afnan', 'afnan', 'AE', 'MENA'),
  ('Armaf', 'armaf', 'AE', 'MENA'),
  ('Al Rehab', 'al-rehab', 'SA', 'MENA'),
  ('Nabeel', 'nabeel', 'SA', 'MENA'),
  ('Ard Al Zaafaran', 'ard-al-zaafaran', 'SA', 'MENA'),
  ('Dukhni', 'dukhni', 'AE', 'MENA'),
  ('Amouage', 'amouage', 'OM', 'MENA');
