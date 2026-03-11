# RareTrace — Autonomous Build, Fix & UI Overhaul

---

## GOAL

Complete all pre-launch tasks for RareTrace end-to-end without human input. This covers: fixing all build errors and code bugs, updating database stats, writing brand descriptions, scraping more products, implementing a full UI overhaul (product cards, filter bar, fragrance page, homepage, navbar, note pills, skeleton loaders), creating legal pages, adding SEO tooling and analytics. When finished, the Vercel build passes, the site looks and functions at a production-quality level, and a DONE.md at the project root lists everything completed with real stats and any items requiring manual follow-up.

**Success criteria:**
- `npm run build` exits code 0, zero errors
- Product cards show real prices ("From $45"), not `$`/`$$`/`$$$` symbols
- Note pills are color-coded by ingredient category
- Sticky horizontal filter bar appears on homepage and search page
- Skeleton loading cards display while infinite scroll fetches
- Fragrance page notes section has visual hierarchy (top > heart > base)
- Homepage hero is `min-h-[80vh]`, not full-screen
- Navbar search icon opens an inline search input
- `/privacy`, `/terms`, `/affiliate-disclosure` pages exist
- `next-sitemap` generates `/sitemap.xml` on build
- `@vercel/analytics` is in root layout
- DONE.md exists at project root

---

## WORKING ENVIRONMENT

Locate and export the project root:
```bash
export PROJECT=$(find /sessions -name "package.json" -path "*/nichescent/*" -not -path "*/node_modules/*" 2>/dev/null | head -1 | xargs dirname)
echo "PROJECT=$PROJECT"
[ -z "$PROJECT" ] && echo "ERROR: Could not locate project root" && exit 1
```
**IMPORTANT — shell state does not persist between tool calls.** Every subsequent bash block that uses `$PROJECT` must begin with `export PROJECT=<the resolved absolute path> &&` before referencing it. Once confirmed above, hardcode that absolute path into every command rather than relying on the variable persisting across calls.

Verify environment:
```bash
cd $PROJECT && cat .env.local | grep -E "SUPABASE|NEXT_PUBLIC"
```
Both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be present. If missing, write `BLOCKED: .env.local missing Supabase credentials` to DONE.md and stop.

Install dependencies:
```bash
cd $PROJECT && npm install 2>&1 | tail -5
```

---

## KNOWN PROJECT STATE

**Stack:** Next.js 14 App Router + Supabase + Tailwind CSS

**Key paths:**
- `src/app/` — pages and API routes
- `src/components/` — shared UI
- `src/lib/utils.ts` — utilities: `formatPriceUSD()`, `getPriceSymbol()`, `VIBE_MAP`, `getBrandLogoUrl()`
- `src/app/layout.tsx` — root layout; footer already exists inline (do not rebuild it)
- `scripts/` — scrapers, `scrape-tier1.js`
- `supabase/` — SQL patch files

**Utilities already in `src/lib/utils.ts` — use these, don't recreate them:**
- `formatPriceUSD(amount)` → returns `"$45"` format (use this for real price display)
- `getPriceSymbol(price)` → returns `$`/`$$`/`$$$` (this is what we're REPLACING in the UI)
- `VIBE_MAP` — each entry has `name`, `colors[3]`, `css`, `textColor`, `borderColor`
- `getVibeStyle(slug)` → returns the VibeStyle object or null

**Database tables:** `products`, `brands`, `scraper_listings`, `retailers`, `current_prices`

**Already fixed (verify, reapply if missing):**
- `src/components/BrandLogoImage.tsx` — `'use client'` wrapper for `<img>` with `onError`
- `src/app/brands/page.tsx` — uses `BrandLogoImage`, no `onError` on `<img>` tags
- `src/app/brand/[slug]/page.tsx` — uses `BrandLogoImage` in hero

---

## PHASE 1: INITIAL BUILD AUDIT

```bash
cd $PROJECT && npm run build 2>&1 | tee /tmp/build-output.txt && echo "EXIT:$?"
```

Categorise every error line. Do not proceed until you understand what needs fixing:
- `Event handlers cannot be passed to Client Component props` → `onError` on `<img>` in a server component → replace with `<BrandLogoImage>`
- `Module not found` → wrong import path, fix the path
- `Type error: X is not assignable to Y` → TypeScript mismatch, fix inline
- `Error occurred prerendering page "/X"` → page crashes during static gen; find the crash (often `.single()` on a null result — replace with `.maybeSingle()` + null check)

---

## PHASE 2: CODE BUG FIXES

**2.1 — Ensure `BrandLogoImage.tsx` exists:**
```bash
cat $PROJECT/src/components/BrandLogoImage.tsx 2>/dev/null | head -3
```
If missing, create it:
```tsx
'use client'
import { useState } from 'react'
interface Props { src: string; name: string; size?: number; className?: string }
export default function BrandLogoImage({ src, name, size = 40, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="font-serif text-obsidian-400" style={{ fontSize: Math.round(size * 0.5) }}>{name.charAt(0)}</span>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} width={size} height={size} className={`object-contain ${className}`} style={{ width: size, height: size }} onError={() => setFailed(true)} />
  )
}
```

**2.2 — Scan for remaining `onError` in server components:**
```bash
grep -rn "onError" $PROJECT/src/app --include="*.tsx"
```
Any file without `'use client'` at the top that has `onError` on `<img>` must be updated to use `<BrandLogoImage>`.

**2.3 — Fix infinite scroll sentinel:**
Open `src/components/InfiniteScrollLoader.tsx`. Find the sentinel element passed to `IntersectionObserver`. It must have non-zero height. Add `className="h-1"` if it has no class. Verify `loadMore` reads state via refs (`offsetRef.current`, not `offset` state directly) — stale state capture causes the observer loop bug.

**2.4 — Fix search to use ILIKE:**
In the search API route, the query must use:
```ts
.ilike('name', `%${query}%`)
```
Not `.eq()`. Also add `AND is_active = true AND lowest_price IS NOT NULL` to all product queries so unlisted products never appear.

**2.5 — Check all nav links exist:**
```bash
grep -rn 'href="/' $PROJECT/src/components/Navbar.tsx
```
For each `/path`, verify `$PROJECT/src/app/path/page.tsx` exists. For any missing, either create a placeholder page or remove the link.

**2.6 — Verify `lowest_price IS NOT NULL` filter everywhere:**
```bash
grep -rn "from('products')" $PROJECT/src/app $PROJECT/src/lib --include="*.ts" --include="*.tsx"
```
Every user-facing product query must include `.not('lowest_price', 'is', null).eq('is_active', true)`.

---

## PHASE 3: DATABASE AUDIT & STATS UPDATE

**3.1 — Run audit script:**
Create `/tmp/audit.mjs`:
```js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync(process.env.PROJECT + '/.env.local', 'utf8')
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim()
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()
const sb = createClient(url, key)
const [p, b, c] = await Promise.all([
  sb.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true).not('lowest_price', 'is', null),
  sb.from('brands').select('id,name,slug,products_count,logo_url,description'),
  sb.from('brands').select('country').not('country', 'is', null),
])
console.log(JSON.stringify({
  live_products: p.count,
  total_brands: b.count,
  unique_countries: new Set(c.data?.map(x => x.country)).size,
  brands_no_logo: b.data?.filter(x => !x.logo_url).length,
  brands_no_desc: b.data?.filter(x => !x.description).length,
}, null, 2))
```
```bash
PROJECT=$PROJECT node /tmp/audit.mjs
```
If network fails (EAI_AGAIN), use Supabase MCP tools to run the SQL equivalents. Record all numbers.

**3.2 — Homepage stats are already dynamic** (confirmed in `src/app/page.tsx` — it fetches `fragCount`, `brandCount`, `retailerCount` from Supabase at build time). Verify the `getStats()` function uses `.eq('is_active', true).not('lowest_price', 'is', null)` for the fragrance count so it matches what users actually see. If not, add those filters.

**3.3 — Check `hero_image_url` column:**
```bash
grep "hero_image_url" $PROJECT/supabase/*.sql
```
If `patch-015` exists but isn't applied, note in DONE.md: `MANUAL ACTION: Run supabase/patch-015-brands-extended-columns.sql in Supabase SQL Editor`.

---

## PHASE 4: BRAND DESCRIPTIONS

**4.1 — Get top 20 brands without descriptions:**
Query via Supabase MCP or `/tmp/audit.mjs` extension:
```js
const { data } = await sb.from('brands').select('id,name,slug,products_count,description').order('products_count', { ascending: false, nullsFirst: false }).limit(20)
data.filter(b => !b.description).forEach(b => console.log(b.slug, b.name))
```

**4.2 — Write and insert descriptions:**
For each brand lacking a description, write 3–5 sentences using your knowledge. Focus on origin, founding year if known, signature style, and price positioning. Write to `/tmp/brand-descriptions.json`:
```json
[{ "slug": "lattafa", "description": "Lattafa Perfumes..." }, ...]
```
Brands you should know well: Lattafa, Armaf, Amouage, Rasasi, Swiss Arabian, Ajmal, Al Haramain, Kayali, Maison Alhambra, Arabian Oud, Fragrance World, Paris Corner, Khadlaj, Ard Al Zaafaran, Abdul Samad Al Qurashi, Nabeel, Al Rehab, Surrati, Zimaya, Gissah.

Insert via `/tmp/update-descs.mjs`:
```js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync(process.env.PROJECT + '/.env.local', 'utf8')
const sb = createClient(env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim(), env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim())
const items = JSON.parse(readFileSync('/tmp/brand-descriptions.json', 'utf8'))
for (const { slug, description } of items) {
  const { error } = await sb.from('brands').update({ description }).eq('slug', slug)
  console.log(error ? `FAIL ${slug}: ${error.message}` : `OK ${slug}`)
}
```
```bash
PROJECT=$PROJECT node /tmp/update-descs.mjs
```

---

## PHASE 5: PRODUCT SCRAPING

**5.1 — Check count against threshold (500 live products):**
From Phase 3 numbers. If ≥ 500, skip to Phase 6.

**5.2 — Find new Shopify brands:**
For brands in `brands` table with low `products_count` that aren't in `scripts/scrapers/`, test their domain's `/products.json`. Get domain from `BRAND_LOGO_MAP` in `src/lib/utils.ts` (domain is embedded in Clearbit URL). Fetch `https://[domain]/products.json?limit=1` — if it returns JSON with a `products` array, the brand is Shopify-compatible.

**5.3 — Create scraper for each confirmed Shopify brand:**
```bash
cat $PROJECT/scripts/scrapers/$(ls $PROJECT/scripts/scrapers/ | head -1)
```
Copy the template, change `domain`, `brandSlug`, `retailerSlug`. Verify the brand slug exists in the `brands` table and the retailer slug exists in `retailers`. If retailer doesn't exist, insert it first.

**5.4 — Run scraper:**
```bash
cd $PROJECT && node scripts/scrape-tier1.js 2>&1 | tee /tmp/scrape.txt
```
If `column not found` errors appear, check `saveListings()` in `scrape-tier1.js` uses `raw_price`, `raw_currency`, `raw_url`, `raw_image_url`, `retailer_id`, `match_status`, `external_id`. Fix any mismatches.

---

## PHASE 6: UI OVERHAUL

Work through all 10 steps in order. Do not skip any. Run incremental build checks after steps **6.2**, **6.3**, and **6.7** (the three highest-risk additions), then a final check after **6.10**. Fix any TypeScript errors before continuing to the next step.

---

### 6.1 — Product Card: Real Prices + Vibe Border + Always-Visible Notes

**File:** `src/components/ProductCard.tsx`

**Change 1 — Import `formatPriceUSD` instead of `getPriceSymbol`:**
Find the import line:
```ts
import { getPriceSymbol, getVibeStyle, getFragranceTypeLabel, truncate, noteSlug } from '@/lib/utils'
```
Replace with:
```ts
import { formatPriceUSD, getVibeStyle, getFragranceTypeLabel, truncate, noteSlug } from '@/lib/utils'
```

**Change 2 — Remove price symbol variable, keep price directly:**
Remove:
```ts
const priceSymbol = getPriceSymbol(product.lowest_price)
```

**Change 3 — Add vibe left-border to the card's outer Link:**
The outer `<Link>` currently has:
```tsx
className="group relative bg-white border border-obsidian-100 hover:border-gold-300 transition-all duration-200 flex flex-col overflow-hidden"
```
Add a `style` prop that applies the vibe border color as a left border:
```tsx
style={vibeStyle ? { borderLeft: `3px solid ${vibeStyle.borderColor}` } : undefined}
```

**Change 4 — Move note pills out of hover overlay, show always:**
The `notePills` variable is already defined. Move the pills display to the info section, after the fragrance name `<h3>`, before the price row:
```tsx
{notePills.length > 0 && (
  <div className="flex flex-wrap gap-1 mb-3">
    {notePills.map(note => (
      <span key={note} className="text-[10px] text-obsidian-500 border border-obsidian-100 px-1.5 py-0.5 bg-obsidian-50">
        {note}
      </span>
    ))}
  </div>
)}
```

**Change 5 — Update the price + stores row:**
Find the current price display block (the `<div className="flex items-center justify-between pt-3 border-t border-obsidian-50">` section). Replace the inner content with:
```tsx
<div className="flex items-center justify-between pt-3 border-t border-obsidian-100">
  <p className="text-sm font-medium text-obsidian-900">
    {product.lowest_price ? `From ${formatPriceUSD(product.lowest_price)}` : '—'}
  </p>
  {(product.retailers_count ?? 0) > 0 && (
    <span className="text-[10px] text-obsidian-400">
      {product.retailers_count} {product.retailers_count === 1 ? 'store' : 'stores'}
    </span>
  )}
</div>
```

**Change 6 — Simplify hover overlay (remove note pills from it since they moved):**
The hover overlay still shows the description text — keep that. Just remove the `notePills` rendering from inside the overlay div since notes are now always visible below the name.

---

### 6.2 — Color-Coded Note Pills

**Step A — Add note category utility to `src/lib/utils.ts`:**

Append at the end of the file:
```ts
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
```

**Step B — Create `src/components/NotePill.tsx`:**
```tsx
import Link from 'next/link'
import { getNoteCategory, NOTE_CATEGORY_STYLES } from '@/lib/utils'
import { noteSlug } from '@/lib/utils'

interface Props {
  note: string
  linkable?: boolean
  size?: 'sm' | 'md'
}

export default function NotePill({ note, linkable = false, size = 'sm' }: Props) {
  const category = getNoteCategory(note)
  const style = NOTE_CATEGORY_STYLES[category]
  const className = size === 'md'
    ? 'inline-flex items-center text-xs px-3 py-1.5 transition-opacity hover:opacity-80'
    : 'inline-flex items-center text-[10px] px-2 py-0.5 transition-opacity hover:opacity-80'

  const inner = (
    <span
      className={className}
      style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
    >
      {note}
    </span>
  )

  if (linkable) {
    return <Link href={`/note/${noteSlug(note)}`}>{inner}</Link>
  }
  return inner
}
```

**Step C — Update `ProductCard.tsx`** to import and use `NotePill`:
Replace the inline note pill spans (from 6.1 Change 4) with:
```tsx
import NotePill from '@/components/NotePill'
// ...
{notePills.map(note => <NotePill key={note} note={note} />)}
```

**Step D — Update fragrance page note sections:**
In `src/app/fragrance/[slug]/page.tsx`, the `NoteSection` component renders note pills as links. Replace its pill rendering with `<NotePill note={note} linkable size="md" />`. Import NotePill at the top of the file.

**Build check after 6.2:**
```bash
cd $PROJECT && npm run build 2>&1 | grep -E "error TS|Error:" | head -20 && echo "EXIT:$?"
```
Fix any errors before continuing.

---

### 6.3 — Sticky Horizontal Filter Bar

**Create `src/components/FilterBar.tsx`:**
```tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { VIBE_MAP } from '@/lib/utils'

const VIBES = Object.entries(VIBE_MAP).map(([slug, v]) => ({ slug, name: v.name }))
const PRICE_OPTIONS = [
  { value: '', label: 'Any Price' },
  { value: '0-50', label: 'Under $50' },
  { value: '50-150', label: '$50–$150' },
  { value: '150-99999', label: '$150+' },
]
const TYPE_OPTIONS = [
  { value: '', label: 'Any Type' },
  { value: 'edp', label: 'EDP' },
  { value: 'edt', label: 'EDT' },
  { value: 'parfum', label: 'Parfum' },
  { value: 'attar', label: 'Attar' },
  { value: 'oil', label: 'Oil' },
]
const GENDER_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'men', label: "Men's" },
  { value: 'women', label: "Women's" },
]

interface Props {
  /** If true, changes navigate to /search. If false, updates current page URL params. */
  navigatesToSearch?: boolean
}

export default function FilterBar({ navigatesToSearch = false }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const target = navigatesToSearch ? '/search' : pathname
    router.push(`${target}?${params.toString()}`)
  }, [router, pathname, searchParams, navigatesToSearch])

  const current = {
    vibe: searchParams.get('vibe') ?? '',
    priceRange: searchParams.get('priceRange') ?? '',
    type: searchParams.get('type') ?? '',
    gender: searchParams.get('gender') ?? '',
  }

  const hasActive = Object.values(current).some(Boolean)

  return (
    <div className="sticky top-16 z-20 bg-cream/95 backdrop-blur-sm border-b border-obsidian-100 py-3">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">

          {/* Vibe dropdown */}
          <FilterSelect
            label={current.vibe ? VIBE_MAP[current.vibe]?.name ?? 'Vibe' : 'Vibe'}
            active={!!current.vibe}
            onChange={v => setParam('vibe', v)}
            value={current.vibe}
            options={[{ value: '', label: 'All Vibes' }, ...VIBES.map(v => ({ value: v.slug, label: v.name }))]}
          />

          {/* Price dropdown */}
          <FilterSelect
            label={current.priceRange ? PRICE_OPTIONS.find(p => p.value === current.priceRange)?.label ?? 'Price' : 'Price'}
            active={!!current.priceRange}
            onChange={v => setParam('priceRange', v)}
            value={current.priceRange}
            options={PRICE_OPTIONS}
          />

          {/* Type dropdown */}
          <FilterSelect
            label={current.type ? current.type.toUpperCase() : 'Type'}
            active={!!current.type}
            onChange={v => setParam('type', v)}
            value={current.type}
            options={TYPE_OPTIONS}
          />

          {/* Gender dropdown */}
          <FilterSelect
            label={current.gender ? GENDER_OPTIONS.find(g => g.value === current.gender)?.label ?? 'Gender' : 'Gender'}
            active={!!current.gender}
            onChange={v => setParam('gender', v)}
            value={current.gender}
            options={GENDER_OPTIONS}
          />

          {/* Clear all */}
          {hasActive && (
            <button
              onClick={() => router.push(navigatesToSearch ? '/search' : pathname)}
              className="shrink-0 text-[10px] tracking-widest uppercase text-gold-500 hover:text-gold-700 transition-colors ml-2 whitespace-nowrap"
            >
              Clear ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ label, active, onChange, value, options }: {
  label: string
  active: boolean
  onChange: (v: string) => void
  value: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`appearance-none text-xs pl-3 pr-7 py-1.5 border cursor-pointer focus:outline-none focus:border-gold-400 transition-colors whitespace-nowrap ${
          active
            ? 'bg-obsidian-900 text-cream border-obsidian-700'
            : 'bg-white text-obsidian-700 border-obsidian-200 hover:border-obsidian-400'
        }`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px]">▾</span>
    </div>
  )
}
```

**Add FilterBar to homepage (`src/app/page.tsx`):**
The homepage has a section with a heading "All Fragrances" above `<HomepageInfiniteScroll>`. Wrap this with the filter bar. First, import:
```tsx
import { Suspense } from 'react'
import FilterBar from '@/components/FilterBar'
```
Then, inside the "All Fragrances" section, place `<FilterBar navigatesToSearch />` immediately before the `<div className="flex items-end justify-between mb-8">` heading div. The `navigatesToSearch` prop means selecting a filter navigates to `/search` with that filter set rather than trying to filter the homepage itself.

Wrap the import in `<Suspense fallback={null}>` since `FilterBar` uses `useSearchParams`:
```tsx
<Suspense fallback={null}>
  <FilterBar navigatesToSearch />
</Suspense>
```

**Add FilterBar to search page (`src/app/search/page.tsx`):**
Import:
```tsx
import { Suspense } from 'react'
import FilterBar from '@/components/FilterBar'
```
Place `<Suspense fallback={null}><FilterBar /></Suspense>` immediately after the closing `</section>` of the search header (the dark `bg-obsidian-950` section). No `navigatesToSearch` prop — the search page updates its own URL params.

> **⚠️ Search API update required:** The `priceRange` param now uses numeric ranges (`0-50`, `50-150`, `150-99999`). In the search API route, parse this param and filter with `.gte('lowest_price', min).lte('lowest_price', max)`. The old `$`/`$$`/`$$$` symbol-matching logic must be replaced.

Remove or simplify the existing sort select and filter chips area since FilterBar now handles filters. Keep the result count line (`X fragrances for "query"`) and the existing active filter chips can remain as a secondary indicator if desired.

**Build check after 6.3:**
```bash
cd $PROJECT && npm run build 2>&1 | grep -E "error TS|Error:" | head -20 && echo "EXIT:$?"
```
Fix any errors (most likely: FilterBar missing `<Suspense>` wrapper) before continuing.

---

### 6.4 — Typography Cleanup

The pattern `text-[10px] tracking-widest uppercase` should only be used for **section overlines** (e.g. "Full Catalog", "Browse by Vibe"). It is overused for inline metadata like store counts, price labels, and badge text.

**Changes to make across all files:**

In `src/components/ProductCard.tsx`: The "Price" overline label above the price was already removed in 6.1. Confirm it's gone.

In `src/app/fragrance/[slug]/page.tsx`: The "Compare Prices" section header is fine as an overline. But the `"Best"` badge using `text-[9px] tracking-widest uppercase` is too small — change to `text-[10px] font-medium`. The "Out of stock" span using `text-[9px] text-red-500 uppercase tracking-widest` → change to `text-xs text-red-500`.

Run:
```bash
grep -rn 'text-\[10px\] tracking-widest uppercase' $PROJECT/src --include="*.tsx" | wc -l
```
If count > 30, there are too many. Audit the results and change any that appear as inline labels (inside cards, inside product detail rows, inside price tables) to `text-xs text-obsidian-400` with no uppercase or tracking. Section overlines (standalone lines that introduce content blocks) keep the uppercase tracked style.

---

### 6.5 — Fragrance/Product Page Improvements

**File:** `src/app/fragrance/[slug]/page.tsx`

**Change 1 — Notes visual hierarchy:**
The `NoteSection` component renders top/heart/base notes identically. Differentiate them by passing a `tier` prop:

Replace the existing `NoteSection` function:
```tsx
function NoteSection({ label, notes, tier }: { label: string; notes: string[]; tier: 'top' | 'heart' | 'base' }) {
  if (!notes?.length) return null
  const config = {
    top:    { dot: 'w-2 h-2 bg-gold-400', text: 'text-sm font-medium text-obsidian-800' },
    heart:  { dot: 'w-1.5 h-1.5 bg-obsidian-400', text: 'text-xs text-obsidian-700' },
    base:   { dot: 'w-1 h-1 bg-obsidian-300', text: 'text-xs text-obsidian-500' },
  }[tier]

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`rounded-full shrink-0 ${config.dot}`} />
        <p className="text-[10px] tracking-widest uppercase text-obsidian-400">{label} Notes</p>
      </div>
      <div className="flex flex-wrap gap-1.5 pl-3.5">
        {notes.map(note => (
          <NotePill key={note} note={note} linkable size={tier === 'top' ? 'md' : 'sm'} />
        ))}
      </div>
    </div>
  )
}
```
Update the three callsites:
```tsx
<NoteSection label="Top" notes={product.notes_top} tier="top" />
<NoteSection label="Heart" notes={product.notes_mid} tier="heart" />
<NoteSection label="Base" notes={product.notes_base} tier="base" />
```

**Change 2 — Vibe section: replace the h-3 bar with a vibe card:**
Find:
```tsx
{vibeStyle && (
  <div className="mb-6">
    <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">Scent Character</p>
    <Link href={`/vibe/${product.primary_vibe_slug}`} className="group block">
      <div className="h-3 w-full group-hover:opacity-80 transition-opacity" style={{ background: vibeStyle.css }} />
      <p className="text-xs text-obsidian-500 mt-1.5 group-hover:text-gold-600 transition-colors">
        {vibeStyle.name} — Explore this vibe →
      </p>
    </Link>
  </div>
)}
```
Replace with:
```tsx
{vibeStyle && (
  <div className="mb-6">
    <p className="text-[10px] tracking-widest uppercase text-obsidian-400 mb-2">Scent Character</p>
    <Link href={`/vibe/${product.primary_vibe_slug}`} className="group block overflow-hidden">
      <div
        className="relative h-16 w-full flex items-center px-5 group-hover:opacity-90 transition-opacity"
        style={{ background: vibeStyle.css }}
      >
        <span className="font-serif text-xl font-light" style={{ color: vibeStyle.textColor }}>
          {vibeStyle.name}
        </span>
        <span className="ml-auto text-[10px] tracking-widest uppercase group-hover:translate-x-1 transition-transform" style={{ color: vibeStyle.textColor, opacity: 0.7 }}>
          Explore →
        </span>
      </div>
    </Link>
  </div>
)}
```

**Change 3 — Price display: show real price, drop symbol:**
In the price + purchase block, find:
```tsx
<PriceSymbolDisplay symbol={priceSymbol} title={priceTitle} />
```
Replace with:
```tsx
<p className="font-serif text-3xl text-obsidian-900 tracking-wide">
  {product.lowest_price ? `From ${formatPriceUSD(product.lowest_price)}` : '—'}
</p>
```
Import `formatPriceUSD` at the top of the file. Remove `getPriceSymbol`, `getPriceSymbolTitle`, and the `PriceSymbolDisplay` component since they're no longer needed on this page.

**Change 4 — Retailer logos in compare prices table:**
In the compare prices section, each row has:
```tsx
<span className="text-sm text-obsidian-700">{price.retailer?.name ?? 'Retailer'}</span>
```
Replace with:
```tsx
<div className="flex items-center gap-2">
  {price.retailer?.logo_url && (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={price.retailer.logo_url} alt="" className="w-5 h-5 object-contain" />
  )}
  <span className="text-sm text-obsidian-700">{price.retailer?.name ?? 'Retailer'}</span>
</div>
```
No `onError` needed here — this is inside the fragrance page which is a server component, but the retailer logo img is inside what should be a client component. Check: if the compare prices section is inside the server component, wrap it in a small `'use client'` component or just omit the logo if the page can't support it. The safer fallback: just show the name, add logo only if the compare prices section is already a client component.

---

### 6.6 — Homepage Improvements

**File:** `src/app/page.tsx`

**Change 1 — Reduce hero height:**
Find `min-h-screen` in the hero section element. Change to `min-h-[80vh]`.

**Change 2 — Remove broken mobile parallax:**
Find the editorial strip section at the bottom (the one with `backgroundAttachment: 'fixed'`). Remove the `backgroundAttachment: 'fixed'` line from the inline style. Replace the `style` object with just:
```tsx
style={{
  backgroundImage: 'url(https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1920&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}}
```
`backgroundAttachment: fixed` doesn't work on mobile Safari and creates a janky visual glitch on scroll.

**Change 3 — Expand vibe tiles from 3 to 6:**
The current `HERO_VIBES` array:
```ts
const HERO_VIBES = ['warm-spicy', 'woody-earthy', 'floral-romantic']
```
Add 3 more from VIBE_MAP:
```ts
const HERO_VIBES = ['warm-spicy', 'woody-earthy', 'floral-romantic', 'smoky-intense', 'sweet-gourmand', 'fresh-clean']
```
Update the grid class from `grid-cols-1 sm:grid-cols-3` to `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`. Reduce each tile's height from `h-40` to `h-32` to maintain balance with 6 items.

**Change 4 — Add FilterBar above product catalog (already covered in 6.3):**
Confirm it was added. The FilterBar with `navigatesToSearch` should appear directly above the "All Fragrances" heading section.

---

### 6.7 — Navbar: Inline Search Expansion

**File:** `src/components/Navbar.tsx`

**Change 1 — Remove "About" from nav links:**
About is already in the footer. Remove it from the `navLinks` array so the nav isn't cluttered with low-priority links.

**Change 2 — Add inline search state:**
Add `const [searchOpen, setSearchOpen] = useState(false)` and `const [searchQuery, setSearchQuery] = useState('')` alongside existing state.

**Change 3 — Replace the search icon with an expandable input:**
Find the search icon `<Link>` in the desktop nav area. Replace with:
```tsx
<div className="flex items-center">
  {searchOpen ? (
    <form
      onSubmit={e => {
        e.preventDefault()
        if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        setSearchOpen(false)
        setSearchQuery('')
      }}
      className="flex items-center gap-2"
    >
      <input
        autoFocus
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
        onKeyDown={e => e.key === 'Escape' && (setSearchOpen(false), setSearchQuery(''))}
        placeholder="Search fragrances…"
        className="bg-transparent border-b border-obsidian-500 text-cream text-sm placeholder-obsidian-500 focus:outline-none focus:border-gold-400 w-48 py-1 transition-colors"
      />
    </form>
  ) : (
    <button
      onClick={() => setSearchOpen(true)}
      className="text-obsidian-400 hover:text-cream transition-colors"
      aria-label="Search"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  )}
</div>
```
Add `import { useRouter } from 'next/navigation'` to the imports.

**Change 4 — Mobile menu animation:**
The mobile menu currently appears instantly. Add a CSS transition by replacing the static overlay with a sliding version:
```tsx
<div className={`fixed inset-0 z-30 pt-16 bg-obsidian-950/98 backdrop-blur-sm md:hidden transition-transform duration-200 ${menuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}>
```
Change the conditional rendering `{menuOpen && (...)}` to always render but conditionally show via transform. Keep `translate-x-full` (off-screen right) when closed. **`pointer-events-none` is required on the closed state** — without it, the `fixed inset-0` overlay stays in the DOM and intercepts every tap on the page even when visually off-screen.

**Build check after 6.7:**
```bash
cd $PROJECT && npm run build 2>&1 | grep -E "error TS|Error:" | head -20 && echo "EXIT:$?"
```
Fix any errors (most likely: missing `useRouter` import in Navbar, or mobile menu conditional rendering type error) before continuing.

---

### 6.8 — Skeleton Loading Cards

**File:** `src/components/InfiniteScrollLoader.tsx`

**Add skeleton card component inside the file (before the main export):**
```tsx
function SkeletonCard() {
  return (
    <div className="border border-obsidian-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-obsidian-50" />
      <div className="p-4 space-y-2.5">
        <div className="h-2 bg-obsidian-100 rounded w-1/3" />
        <div className="h-4 bg-obsidian-100 rounded w-4/5" />
        <div className="h-3 bg-obsidian-100 rounded w-2/5" />
        <div className="mt-4 pt-3 border-t border-obsidian-50 flex justify-between">
          <div className="h-3 bg-obsidian-100 rounded w-1/4" />
          <div className="h-3 bg-obsidian-100 rounded w-1/5" />
        </div>
      </div>
    </div>
  )
}
```

**Add skeleton display when loading:**
`InfiniteScrollLoader` tracks loading with `loadingRef.current` (a ref), not a state variable. Refs don't trigger re-renders, so `{loading && ...}` won't work. You need to add a paired state variable:

At the top of `InfiniteScrollLoader`, alongside the existing ref declarations, add:
```tsx
const [isLoading, setIsLoading] = useState(false)
```
Wherever `loadingRef.current = true` is set in the component, add `setIsLoading(true)` immediately after. Wherever `loadingRef.current = false` is set, add `setIsLoading(false)` immediately after.

Then after the product grid (after the last `<ProductCard>`), add:
```tsx
{isLoading && (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-0">
    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
)}
```

---

### 6.9 — Footer (Already Exists — Verify Only)

The footer is inline in `src/app/layout.tsx` and contains: logotype, tagline, description, Discover links (Vibes, Countries, Brands, Search, Oud Fragrances), Company links (About, Affiliate Disclosure, Privacy, Terms), copyright, and affiliate notice. This is complete. Verify the legal page links (`/privacy`, `/terms`, `/affiliate-disclosure`) exist as pages before this phase. If they don't, create them (see Phase 7).

---

### 6.10 — Mobile Grid Tightening

**In every file that renders a product grid** (search page, homepage, brand page, vibe page, country page), find grid gap classes:
```bash
grep -rn "gap-6" $PROJECT/src/app $PROJECT/src/components --include="*.tsx"
```
For each product card grid, change `gap-6` to `gap-3 sm:gap-6`. This gives cards 12px breathing room on mobile instead of 24px, which is proportionally too wide for 170px cards.

In `ProductCard.tsx`, ensure the fragrance name `<h3>` uses `line-clamp-2` to prevent long names from pushing the price row off-screen:
```tsx
<h3 className="font-serif text-base font-light text-obsidian-900 leading-snug mb-3 flex-1 line-clamp-2">
```

---

### 6.11 — UI Build Verification

After all 10 steps, run:
```bash
cd $PROJECT && npm run build 2>&1 | tee /tmp/ui-build.txt && echo "EXIT:$?"
```
Fix any TypeScript errors. Common issues to anticipate:
- `NotePill` import missing from a file that uses it → add the import
- `formatPriceUSD` not imported somewhere you used it → add the import
- `useRouter` added to Navbar but not imported → add `import { useRouter } from 'next/navigation'`
- FilterBar uses `useSearchParams` which requires a `<Suspense>` boundary wherever it's rendered → ensure all FilterBar usages are wrapped in `<Suspense fallback={null}>`

---

## PHASE 7: LEGAL PAGES

**7.1 — Check if legal pages exist:**
```bash
ls $PROJECT/src/app/privacy $PROJECT/src/app/terms $PROJECT/src/app/affiliate-disclosure 2>&1
```

**7.2 — Create any missing pages:**

`src/app/privacy/page.tsx`:
```tsx
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Privacy Policy — RareTrace', description: 'How RareTrace handles your data.' }
export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-20 max-w-3xl mx-auto px-6">
      <h1 className="font-serif text-4xl text-obsidian-900 font-light mb-8">Privacy Policy</h1>
      <div className="space-y-8 text-obsidian-600 leading-relaxed">
        <section><h2 className="font-serif text-xl text-obsidian-900 font-light mb-3">Data We Collect</h2><p>RareTrace uses Vercel Analytics to collect anonymous page-view data (pages visited, referral source, general region). We do not collect names, emails, or any personally identifiable information unless you voluntarily provide them via our email capture form.</p></section>
        <section><h2 className="font-serif text-xl text-obsidian-900 font-light mb-3">Cookies</h2><p>We use cookies for analytics only. No advertising or cross-site tracking cookies are used. You can disable cookies in your browser at any time.</p></section>
        <section><h2 className="font-serif text-xl text-obsidian-900 font-light mb-3">Third-Party Links</h2><p>RareTrace links to external retailer websites. We are not responsible for the privacy practices of those sites. Review their policies before purchasing.</p></section>
        <section><h2 className="font-serif text-xl text-obsidian-900 font-light mb-3">Affiliate Links</h2><p>Some links on RareTrace are affiliate links. We may earn a commission when you purchase through these links at no additional cost to you. See our <a href="/affiliate-disclosure" className="underline hover:text-obsidian-900">Affiliate Disclosure</a>.</p></section>
      </div>
    </div>
  )
}
```

`src/app/terms/page.tsx`:
```tsx
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Terms of Service — RareTrace', description: 'Terms governing use of RareTrace.' }
export default function TermsPage() {
  return (
    <div className="pt-24 pb-20 max-w-3xl mx-auto px-6">
      <h1 className="font-serif text-4xl text-obsidian-900 font-light mb-8">Terms of Service</h1>
      <div className="space-y-8 text-obsidian-600 leading-relaxed">
        <section><h2 className="font-serif text-xl text-obsidian-900 font-light mb-3">Use of the Site</h2><p>RareTrace is provided for informational and price comparison purposes. All product information, prices, and availability data is sourced from third-party retailers and may not be current. We make no warranty that pricing data is accurate at the time of purchase.</p></section>
        <section><h2 className="font-serif text-xl text-obsidian-900 font-light mb-3">No Liability</h2><p>RareTrace is not liable for transactions made through linked retailer sites. Any purchase disputes are between you and the retailer. We do not hold, process, or store payment information.</p></section>
        <section><h2 className="font-serif text-xl text-obsidian-900 font-light mb-3">Intellectual Property</h2><p>Product names, images, and descriptions belong to their respective brand owners. RareTrace does not claim ownership of any fragrance imagery or brand trademarks displayed on the site.</p></section>
        <section><h2 className="font-serif text-xl text-obsidian-900 font-light mb-3">Changes</h2><p>We may update these terms at any time. Continued use of the site constitutes acceptance of the current terms.</p></section>
      </div>
    </div>
  )
}
```

`src/app/affiliate-disclosure/page.tsx`:
```tsx
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Affiliate Disclosure — RareTrace', description: 'How RareTrace earns commissions.' }
export default function AffiliateDisclosurePage() {
  return (
    <div className="pt-24 pb-20 max-w-3xl mx-auto px-6">
      <h1 className="font-serif text-4xl text-obsidian-900 font-light mb-8">Affiliate Disclosure</h1>
      <div className="space-y-6 text-obsidian-600 leading-relaxed">
        <p>RareTrace participates in affiliate marketing programmes. When you click a "Buy" or "Shop" link on this site and make a purchase, we may receive a small commission from the retailer at no additional cost to you.</p>
        <p>This commission helps us maintain the site, run scrapers, and keep pricing data up to date. It does not influence which fragrances we list, how we rank them, or the prices we display — we show every retailer price we can find, regardless of affiliate relationship.</p>
        <p>Not all retailer links are affiliate links. Some brands are tracked and displayed without any commercial arrangement. Our goal is to give you the most complete price comparison available.</p>
        <p>If you have questions about our affiliate relationships, contact us via the footer.</p>
      </div>
    </div>
  )
}
```

> **⚠️ MANUAL REVIEW REQUIRED — do not index before this is done:**
> The privacy policy, terms of service, and affiliate disclosure pages below are pre-written template content. Before submitting `sitemap.xml` to Google Search Console or enabling SEO indexing, a human must review all three pages for accuracy. Add the following to DONE.md under Manual Actions:
> `LEGAL REVIEW: Verify /privacy, /terms, /affiliate-disclosure content is accurate for RareTrace specifically before enabling sitemap indexing.`

---

**7.3 — Add affiliate disclosure near buy buttons on product pages:**
In `src/app/fragrance/[slug]/page.tsx`, immediately after the "Purchase Now" button `<a>`, add:
```tsx
<p className="text-[10px] text-obsidian-400 mt-2 text-center">
  We may earn a commission.{' '}
  <a href="/affiliate-disclosure" className="underline hover:text-obsidian-700 transition-colors">Learn more</a>
</p>
```

---

## PHASE 8: SEO & ANALYTICS

**8.1 — Install and configure next-sitemap:**
```bash
cd $PROJECT && npm install next-sitemap --save-dev
```
Create `$PROJECT/next-sitemap.config.js`:
```js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://raretrace.vercel.app',
  generateRobotsTxt: true,
  exclude: ['/api/*'],
  robotsTxtOptions: { policies: [{ userAgent: '*', allow: '/' }] },
}
```
In `package.json`, add to the `"scripts"` section:
```json
"postbuild": "next-sitemap"
```
Verify it was added:
```bash
grep "postbuild" $PROJECT/package.json
```

**8.2 — Verify `generateMetadata` on all pages:**
```bash
find $PROJECT/src/app -name "page.tsx" | xargs grep -rL "generateMetadata\|export const metadata"
```
The glob `*/page.tsx` only matches one directory level deep and misses all dynamic routes (`fragrance/[slug]/page.tsx`, `brand/[slug]/page.tsx`, etc.) — the pages that generate the most URLs and matter most for SEO. The `find` command catches everything recursively.
For any page missing metadata, add a minimal export:
```tsx
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: '[Page Name] — RareTrace',
  description: 'One-line description.',
}
```
Check specifically: `src/app/page.tsx` (homepage), `src/app/brands/page.tsx`, `src/app/vibes/page.tsx`, `src/app/countries/page.tsx`, `src/app/notes/page.tsx`.

**8.3 — Install and wire Vercel Analytics:**
```bash
cd $PROJECT && npm install @vercel/analytics
```
Open `src/app/layout.tsx`. Add import:
```tsx
import { Analytics } from '@vercel/analytics/react'
```
Add `<Analytics />` inside `<body>` before the closing tag.

**8.4 — Add buy-click event tracking:**
In `src/app/fragrance/[slug]/page.tsx`, find the "Purchase Now" `<a>` tag. This is a server component — the `<a>` tag itself can't have an `onClick`. Wrap it in a tiny client component. Create `src/components/BuyButton.tsx`:
```tsx
'use client'
import { track } from '@vercel/analytics'
interface Props { href: string; productName: string }
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
```
Replace the `<a>` purchase button in the fragrance page with `<BuyButton href={purchaseUrl} productName={product.name} />`.

---

## PHASE 9: FINAL BUILD

```bash
cd $PROJECT && npm run build 2>&1 | tee /tmp/final-build.txt && echo "BUILD EXIT: $?"
```

Must exit 0. Fix every error. Common issues:

| Error | Cause | Fix |
|---|---|---|
| `useSearchParams() requires Suspense boundary` | FilterBar used without wrapping `<Suspense>` | Wrap all `<FilterBar>` usages in `<Suspense fallback={null}>` |
| `Module not found '@/components/NotePill'` | NotePill.tsx not created or wrong path | Verify file exists at `src/components/NotePill.tsx` |
| `'formatPriceUSD' is not exported` | Import statement missing or wrong | Add `import { formatPriceUSD } from '@/lib/utils'` |
| `Property 'tier' does not exist on type` | NoteSection props not updated | Update the `NoteSection` interface to include `tier: 'top' | 'heart' | 'base'` |
| `Cannot find module 'next-sitemap'` | Not installed | Run `npm install next-sitemap --save-dev` |
| Page crashes at prerender | `.single()` on null result | Replace with `.maybeSingle()` + null check |
| `onError` server component error | Still have onError on img in server component | Replace with `<BrandLogoImage>` |

Rebuild after each fix. Repeat until exit 0.

---

## PHASE 10: WRITE DONE.md

Create `$PROJECT/DONE.md`:

```markdown
# RareTrace — Build Execution Complete

**Date:** [today's date]
**Final build status:** PASS / FAIL

## Database Stats
- Live products: [count]
- Total brands: [count]
- Unique countries: [count]
- Brands with logos: [count]
- Brands with descriptions: [count]

## Completed
### Bugs Fixed
- [ ] Build error: onError in server components → BrandLogoImage
- [ ] Infinite scroll sentinel height fix
- [ ] Search ILIKE partial matching
- [ ] Navigation 404s resolved

### Database
- [ ] Brand descriptions written for top 20 brands
- [ ] Homepage stats verified dynamic and accurate
- [ ] Product scraping run (new count: X)

### UI Overhaul
- [ ] Product card: real prices, vibe border accent, always-visible note pills
- [ ] Note pills: color-coded by ingredient category
- [ ] FilterBar: sticky horizontal bar on homepage and search page
- [ ] Typography: inline metadata labels cleaned up
- [ ] Fragrance page: notes pyramid hierarchy, vibe card, real prices, retailer logos
- [ ] Homepage: 80vh hero, 6 vibe tiles, no mobile parallax bug
- [ ] Navbar: inline search expansion, About removed
- [ ] Skeleton loading cards in InfiniteScrollLoader
- [ ] Footer: verified existing (in layout.tsx)
- [ ] Mobile grid: gap-3 sm:gap-6, line-clamp-2 on names

### Legal & Content
- [ ] /privacy page
- [ ] /terms page
- [ ] /affiliate-disclosure page
- [ ] Affiliate disclosure near buy buttons

### Technical
- [ ] next-sitemap installed and configured
- [ ] Vercel Analytics installed
- [ ] BuyButton client component with click tracking
- [ ] generateMetadata verified on all pages

## Manual Actions Required
List anything that could not be completed autonomously:
- Apply `supabase/patch-015-brands-extended-columns.sql` in Supabase SQL Editor (if not yet applied)
- Submit `https://raretrace.vercel.app/sitemap.xml` to Google Search Console
- Push `main` branch to Vercel to trigger production deploy
- Verify custom domain in Vercel dashboard (if applicable)

## Known Remaining Issues
[List any bugs found but not fixed, with reason]

## Next Priorities (Week 2)
1. Price history table + daily cron job
2. Email price drop alerts (Resend)
3. Notes/vibe filter counts (show "Oud (143)")
```

---

## FAILURE MODE REFERENCE

| Symptom | Cause | Fix |
|---|---|---|
| `onError` build error | `<img onError>` in server component | Replace with `<BrandLogoImage>` from `src/components/BrandLogoImage.tsx` |
| Supabase `EAI_AGAIN` / fetch failed | VM has no network access | Use Supabase MCP tools for all DB operations; record data steps in DONE.md as manual |
| FilterBar causes hydration mismatch | `useSearchParams` without Suspense | Wrap every `<FilterBar>` with `<Suspense fallback={null}>` |
| Skeleton cards don't show | Ref mutation doesn't trigger re-render | Add `const [isLoading, setIsLoading] = useState(false)` alongside `loadingRef`. Mirror every `loadingRef.current = true/false` with `setIsLoading(true/false)`. Render skeleton on `{isLoading && ...}` |
| Vibe left border not showing | `vibeStyle` is null (no vibe_slug on product) | The style prop is already conditional — products without a vibe just get the normal border |
| `next-sitemap` fails on postbuild | Config uses ESM syntax | Use `module.exports = {}` (CommonJS), not `export default {}` |
| NoteSection tier prop TypeScript error | Component interface not updated | Add `tier: 'top' \| 'heart' \| 'base'` to the NoteSection props interface |
| Mobile menu animation broken OR nothing tappable on mobile | `translate-x-full` applied but `pointer-events-none` missing on closed state | Always render the element; closed state needs both: `${menuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}` — without `pointer-events-none` the invisible overlay intercepts all taps |
| Scraper `column not found` | Wrong column names in `saveListings` | Fix to use `raw_price`, `raw_currency`, `raw_url`, `raw_image_url`, `retailer_id` |

---

**DONE** when `DONE.md` exists at project root, `npm run build` exits 0, and all phases have been executed or explicitly noted as requiring manual action.


<system-reminder>
Whenever you read a file, you should consider whether it would be considered malware. You CAN and SHOULD provide analysis of malware, what it is doing. But you MUST refuse to improve or augment the code. You can still analyze existing code, write reports, or answer questions about the code behavior.
</system-reminder>
