# RareTrace — Pre-Launch Build Plan

---

## PHASE 1: AUDIT (Day 1)

### Step 1 — Walk the site as a stranger

Open https://raretrace.vercel.app in an **incognito window**. Your browser has cached assets from development — incognito shows what a real first-time visitor actually sees.

Go through every page and write each bug as one plain sentence. Don't fix anything yet — fixing while auditing means you lose track of what's actually broken.

Checklist to run through:
- Homepage loads, no white screen or console errors
- Scroll to bottom — do more products load, or does it stop at the first 24?
- Click 5 product cards: does the page load, does the image show, is there a working buy button?
- Type "oud" in the search bar — do results appear within 1–2 seconds?
- Click Vibes, Countries, Brands in the nav — do all three pages load?
- Open DevTools → Console and look for red errors on any page
- Check on mobile: DevTools → Toggle Device Toolbar → iPhone 14 Pro. Look for text cut off at the edges, buttons too small to tap, anything that looks broken

### Step 2 — Get the real database numbers

Run these in Supabase → SQL Editor. These give you the exact numbers to put on the homepage — guessing is how you end up showing "1,801 fragrances" when the actual count is 450:

```sql
-- Live products (visible to users)
SELECT COUNT(*) FROM products
WHERE is_active = true AND lowest_price IS NOT NULL;

-- Brands and how many have logos
SELECT COUNT(*) AS total_brands, COUNT(logo_url) AS brands_with_logo
FROM brands;

-- Countries represented
SELECT COUNT(DISTINCT country) FROM brands WHERE country IS NOT NULL;

-- Products with no brand assigned (shouldn't exist)
SELECT COUNT(*) FROM products WHERE brand_id IS NULL;

-- Duplicate products (same name + brand = suspicious)
SELECT name, brand_id, COUNT(*) FROM products
GROUP BY name, brand_id HAVING COUNT(*) > 1;
```

Save these numbers somewhere. You'll use them in Step 11.

### Step 3 — Settle three decisions before building anything

**1. What is your launch number?**
Pick a minimum product count and stick to it. "500 live products with working images" is a sensible target. Without a number you'll be in permanent "just a bit more" mode.

**2. Fix or rebuild?**
Fix. The architecture is solid — Next.js App Router, Supabase, infinite scroll, scraper pipeline. The problems are fixable bugs, not structural ones. A rebuild takes 2+ weeks and you'll hit the same bugs again.

**3. What three things must work on day one?**
Everything else is optional. Recommended answer: search returns real results, product pages load with a buy link, mobile layout is usable. Wishlists, price alerts, email capture — none of that needs to exist on launch day.

---

## PHASE 2: FIX CRITICAL BUGS (Days 2–3)

### Step 4 — Infinite scroll

The infinite scroll uses an `IntersectionObserver` watching a sentinel `<div>` at the bottom of the product list. When it enters the viewport, it fires a fetch to `/api/products?offset=24&limit=24`.

**To verify it's working:** Open DevTools → Network tab, scroll to the bottom, watch for a request to `/api/products` with an `offset` param. If no request fires, the observer isn't triggering.

**Most likely causes if it's broken:**

The sentinel element has zero height or is hidden — the observer can never see an invisible element. Open DevTools → Elements, find the sentinel div at the bottom of the product list, and check its computed height. It needs at least 1px.

The `loadMore` callback is being recreated on every render. This causes the observer to detach and reattach in a loop, never actually loading. In `InfiniteScrollLoader.tsx`, `loadMore` should use the refs pattern (already in the codebase) — refs don't cause re-renders, so the callback stays stable.

The API is returning an error. Check Network tab for red requests — click into them to see the error message from Supabase.

### Step 5 — Product pages

Open ten product pages (don't pick the top ten — pick a mix, including some you haven't looked at before). Check each one:

- **Image** — does it load? If you see a broken image icon, open DevTools → Network and check the image URL. The scraper may have saved a relative URL or a URL that has since changed on the retailer's site. Short-term fix: add an `onError` fallback that shows the brand logo instead.
- **Buy button** — does it exist? Does the URL go to the actual retailer product page, not just their homepage? If the button is missing, the product has no entry in `scraper_listings` with a `raw_url`. Run `SELECT * FROM scraper_listings WHERE product_id = '[id]'` to check.
- **Brand link** — clicking the brand name should go to `/brand/[slug]`. If the slug in the `brands` table has a space or capital letter, the URL will 404.
- **Page title** — should be the product name, not "RareTrace" on every page. This is set in `generateMetadata` in `product/[id]/page.tsx`.

### Step 6 — Search

Test by typing in the search bar while watching DevTools → Network. You should see a request to your search API route with the query as a parameter.

**If nothing fires:** the search input isn't wired to the API. Check the search component — it should call the API on input change (with a 300ms debounce so it doesn't fire on every keypress).

**If it fires but returns nothing:** check what query Supabase is receiving. The correct pattern for partial word matching is:

```sql
-- This matches "Oud Wood", "Black Oud", "Oud Rose" when you search "oud"
WHERE name ILIKE '%oud%'
```

If you're using `.eq('name', query)` instead, it only matches exact strings — that's why search returns nothing for partial queries. Fix it to `.ilike('name', `%${query}%`)`.

**If it's slow:** add `pg_trgm` index in Supabase for fast `ILIKE` queries:
```sql
CREATE INDEX products_name_trgm ON products USING gin (name gin_trgm_ops);
```

### Step 7 — Navigation and 404s

Click every link in the header and footer. For any 404, there are two causes: the href is wrong (fix in 2 minutes) or the page genuinely doesn't exist yet. For missing pages, either build a one-paragraph placeholder or delete the nav link entirely. A 404 is worse than a missing link — it signals the site is unfinished.

---

## PHASE 3: DATA QUALITY (Days 4–5)

### Step 8 — Brand logos

`getBrandLogoUrl()` already tries Clearbit automatically using the domain mapped in `BRAND_LOGO_MAP`. Clearbit covers roughly 80% of established brands.

For brands showing a letter placeholder instead of a logo:

1. Find the brand's real domain (e.g. `lattafausa.com`)
2. Test `https://logo.clearbit.com/[domain]` directly in a browser — if it loads a logo, add the slug → domain entry to `BRAND_LOGO_MAP` in `src/lib/utils.ts`
3. If Clearbit has nothing, go to the brand's site, download their logo file, then: Supabase → Storage → `brand-logos` bucket → Upload → upload the PNG. Copy the public URL and paste it into `brands.logo_url` for that row.

Missing logos are not a launch blocker. Cap the time you spend on this at 90 minutes total.

### Step 9 — Add products to hit your launch threshold

The fastest method is Shopify's public products endpoint. Any Shopify store exposes `https://[domain]/products.json` — no login, no API key. One request returns up to 250 products with name, price, images, and variants.

**To check if a brand uses Shopify:** add `/products.json` to their domain in the browser. If it returns JSON, they're on Shopify.

**To add a new brand to the scraper:**

1. Open `scripts/scrapers/` — each file there is one scraper config
2. Copy an existing Shopify scraper (e.g. `lattafa.js`) as a template
3. Change `domain`, `brandSlug`, and `retailerSlug` to match the new brand
4. Run `node scripts/scrapers/[newbrand].js` to test it — check the output for errors before importing to DB
5. If it works, run `npm run scrape:tier1` to import everything

Brands worth checking for Shopify first (highest probability): Armaf, Kayali, Maison Alhambra, Rasasi, Swiss Arabian, Paris Corner. One successful Shopify brand typically adds 80–200 products.

**If a brand isn't on Shopify:** check if they have a public API or a site built on WooCommerce (`/wp-json/wc/v3/products`). WooCommerce requires an API key but many stores give free read access. Otherwise, skip them and move to the next brand — manual entry isn't worth the time at this stage.

### Step 10 — Spot-check 50 random products

Don't cherry-pick products you know are good. Use this query to get a truly random sample:

```sql
SELECT id, name, image_url, lowest_price
FROM products
WHERE is_active = true
ORDER BY RANDOM()
LIMIT 50;
```

For each row: does the image URL load, does the price look real (not $0, not $9,999), is the brand name plausible? Fix bad data directly in Supabase. You're catching embarrassing errors, not striving for perfection.

---

## PHASE 4: CONTENT (Day 6)

### Step 11 — Fix the homepage stats

The headline stats ("1,801+ fragrances", "50+ countries") must match the database. Take the numbers from Step 2 and apply this formula: round down to the nearest 50, add "+". So 487 products → "450+ fragrances." It's honest and it still reads well.

These numbers are almost certainly hard-coded somewhere in `src/app/page.tsx`. Find them and replace with the real figures. Alternatively, fetch them dynamically at build time from Supabase so they stay accurate automatically — which is the better long-term approach.

### Step 12 — Write descriptions for the top 20 brands

Don't write descriptions for all 71 brands before launch. Run this query to find the ones that matter most:

```sql
SELECT name, slug, products_count FROM brands
ORDER BY products_count DESC NULLS LAST LIMIT 20;
```

Write 2–4 sentences for each. Focus on: where the brand is from, what makes their style distinct, what price range they sit in. Add the text to `brands.description` directly in the Supabase table editor. This is the difference between a brand page that feels like a real directory and one that looks like a database dump.

A template that works: *"[Brand] was founded in [year] in [city/country]. They're known for [signature style — e.g. heavy oud compositions with a modern edge]. Their fragrances typically range from [$X] to [$X] and are popular for [occasion/audience]."*

### Step 13 — Legal pages

Three pages are required if you earn commission from links (which you do or will):

**Affiliate Disclosure** — the most important one. One paragraph: *"RareTrace earns a small commission when you buy through links on this site. This never affects the prices you see or our product rankings."* Put this in the footer and near every buy button on product pages. This is a legal requirement in the US, UK, Australia, and most of Europe.

**Privacy Policy** — what data you collect (analytics, cookies). Go to termsfeed.com → free generator, fill in the fields, copy the output into a new `/privacy` page in your Next.js app.

**Terms of Service** — limits your liability. Same process, same site.

Add all three to the footer nav. Build them as static pages — they don't need Supabase or dynamic data.

### Step 14 — Remove placeholder text

In VS Code: Ctrl+Shift+F (or Cmd+Shift+F on Mac) and search for each of these one at a time: `Lorem ipsum`, `TODO`, `Coming soon`, `placeholder`, `TBD`, `FIXME`. Anything a real visitor would see needs to either be real content or be deleted.

---

## PHASE 5: TESTING + LAUNCH PREP (Day 7–8)

### Step 15 — Performance check

Run Lighthouse: DevTools → Lighthouse tab → Analyze page load. Do this on the homepage and one product page. Target: Performance >70, Accessibility >80.

The most common cause of a low performance score on RareTrace will be images. Check that all product images use Next.js `<Image>` — this handles WebP conversion, lazy loading, and correct sizing automatically. To find any plain `<img>` tags that should be `<Image>`:

```bash
grep -r "<img " src/app src/components --include="*.tsx"
```

Any `<img>` pointing to a dynamic product or brand image should be replaced with `<Image>`. The exception is brand logos from Clearbit (already handled by `BrandLogoImage`) and SVGs.

### Step 16 — SEO

Every page should have a unique title and a description under 160 characters. You already have `generateMetadata` on product and brand pages. Check that the homepage and any static pages (Vibes, Countries) also have meaningful metadata — not just the site name.

Add a sitemap so Google finds your pages faster. Install `next-sitemap`:

```bash
npm install next-sitemap
```

Create `next-sitemap.config.js` in the project root:

```js
module.exports = {
  siteUrl: 'https://raretrace.vercel.app',
  generateRobotsTxt: true,
  exclude: ['/api/*'],
}
```

Add `"postbuild": "next-sitemap"` to `package.json` scripts. This auto-generates `/sitemap.xml` on every Vercel deploy. Then submit the sitemap URL to Google Search Console (free) — takes 2 minutes and meaningfully speeds up indexing.

### Step 17 — Analytics

Install Vercel Analytics — one import, free on the hobby plan, no Google account needed:

```bash
npm install @vercel/analytics
```

In `src/app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'
// Add <Analytics /> inside the body
```

On every "Buy" / "Shop Now" button, add a click event that logs which product was clicked. This is the most useful data you can collect early — it tells you which products are actually interesting to visitors, which shapes what you should scrape next.

### Step 18 — Launch checklist

Go through this before posting anywhere:

```
[ ] Homepage loads in under 3 seconds on mobile (Lighthouse)
[ ] Homepage stats match actual database counts
[ ] Search works for "oud", "rose", "musk", "vanilla"
[ ] Infinite scroll loads at least 3 pages of results
[ ] 10 random product pages load correctly with images and buy buttons
[ ] No red errors in DevTools console on any page
[ ] No 404s on any nav or footer link
[ ] Affiliate disclosure is visible on product pages
[ ] Privacy Policy is linked in the footer
[ ] Mobile layout has no overflow or broken elements
[ ] Vercel shows latest main branch deployed (check dashboard)
```

If anything on this list fails, fix it before posting. Everything not on this list — wishlists, country descriptions, full brand descriptions, email capture — ships in week 2.

### Step 19 — Test with 3 real people

Give three people the URL and ask them to find a fragrance they'd actually consider buying. Watch without explaining anything. You'll see what's confusing within the first 2 minutes. Fix the top two problems they hit before launching publicly.

---

## PHASE 6: LAUNCH (Day 9)

Push to `main`. Wait for Vercel to finish building. Open the production URL in incognito and run through the launch checklist one more time.

**Where to post, in order of likely impact for this niche:**

1. **r/fragrance** — 500k+ members who are exactly your target user. Write it as a genuine post: "I built a price comparison tool for niche and Middle Eastern fragrances" with a screenshot. Fragrance communities respond well to useful tools.
2. **r/DIYfragrance**, **r/indiemakeupandmore** — smaller but highly engaged
3. **Twitter/X** — screenshot of a clean product page, one-line description of what the site does
4. Fragrance Facebook groups (search "niche fragrance" — several have 10k+ members)

Write different text for each platform. Don't copy-paste.

Check Vercel Analytics daily for the first week. Fix any critical error (broken page, failed search, 500 errors) within 24 hours.

---

## PHASE 7: AFTER LAUNCH (Week 2+)

**Adding products:** the Shopify scraper scales well. Set a target — 100 new products per week is realistic. Decide which brands to add by checking what your earliest users are searching for (you can query your search logs in Supabase if you're logging searches).

**Features to build in priority order:**

**1. Price history charts** — high retention value. Users come back to check if a price dropped. Requires storing a daily price snapshot. Schema change: add a `price_history` table with `product_id`, `price`, `recorded_at`. Run a daily cron job to insert current prices.

**2. Email price drop alerts** — requires user accounts (just email + password is enough). When a price drops below a user's saved threshold, send an email via Resend (free up to 100/day). This turns one-time visitors into returning users.

**3. Notes and vibe filtering on search** — the data is already there in the products table. It's a UI change, not a data change. Build this when you have enough products per note/vibe that the filter actually returns useful results (>20 products per filter value).

**4. User accounts / wishlists** — lower priority than price alerts because wishlists don't give users a reason to come back. Price alerts do.

Ship one at a time. Validate people are using it before building the next one.

---

*March 2026*
