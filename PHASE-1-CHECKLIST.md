# RareTrace — Phase 1 Completion Checklist
> Everything that must be done before moving to Phase 2 (paid subscriptions, price history)

---

## 1. Data — Minimum Viable Catalog

- [ ] **Run all 9 scrapers** — Lattafa, Afnan, Dukhni, Swiss Arabian, Al Haramain, Gissah, Assaf, Rasasi, Ajmal
  ```
  npm run scrape
  npm run match
  ```
- [ ] **500+ products** in the database with prices
- [ ] **8+ active retailers** with at least 1 price each
- [ ] **Gender data is accurate** — spot check 20 products, verify men/women/unisex is correct
- [ ] **No duplicate products** — review the `scraper_listings` table for duplicates with `match_status = 'matched'`
- [ ] **Run SQL patch-001** (`patch-001-fix-stats.sql`) — ensures `lowest_price` and `retailers_count` are populated
- [ ] **Run SQL patch-002** (`patch-002-new-retailers.sql`) — adds new retailers and brands

---

## 2. Scraping — Automation

- [ ] **GitHub repository created** and code pushed
- [ ] **GitHub Actions secrets set** — `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EXCHANGE_RATE_API_KEY`
- [ ] **Daily scraper running** — check `.github/workflows/daily-scrape.yml` is active
- [ ] **Exchange rates updating** — verify `exchange_rates` table has recent data
- [ ] Confirm scraper handles retailer downtime gracefully (it does — errors are caught per-retailer)

---

## 3. Hosting & Domain

- [ ] **Vercel deployment live** — push to GitHub, import to Vercel
- [ ] **Custom domain purchased** — `raretrace.com` (or `.co`, `.io`)
- [ ] **Domain connected to Vercel** — in Vercel project settings → Domains
- [ ] **SSL certificate active** — Vercel handles this automatically
- [ ] **Environment variables added in Vercel** — mirror your `.env.local` exactly

---

## 4. SEO

- [ ] **Sitemap** — create `src/app/sitemap.ts` (Next.js auto-generates `/sitemap.xml`)
- [ ] **Robots.txt** — create `src/app/robots.ts`
- [ ] **OG image** — create a default Open Graph image (`public/og-image.jpg`, 1200×630px)
- [ ] **Structured data** — add JSON-LD `Product` schema to product pages (helps Google show prices)
- [ ] **Google Search Console** — verify site ownership, submit sitemap
- [ ] Product page titles follow format: `[Product Name] — Compare Prices | RareTrace`
- [ ] Brand pages indexed: `/brand/lattafa`, `/brand/ajmal`, etc.

---

## 5. Analytics & Monitoring

- [ ] **Vercel Analytics** — enable in Vercel dashboard (free, no cookie banner needed)
- [ ] **Error monitoring** — add Sentry free tier (optional but recommended)
  ```
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
- [ ] **Click tracking working** — verify `click_events` table is receiving rows when "Buy Now" is clicked
- [ ] **Weekly review** — check which products get the most clicks (your first affiliate revenue signal)

---

## 6. Legal Pages

- [ ] **Affiliate disclosure page** at `/affiliate-disclosure`
- [ ] **Privacy policy** at `/privacy`
- [ ] **Terms of service** at `/terms`
- [ ] Affiliate disclosure visible in footer (already in layout.tsx)
- [ ] Affiliate disclosure visible on product pages near "Buy Now" button

> These pages can be simple text pages for now. Use a generator like termsfeed.com for a first draft.

---

## 7. User Experience

- [ ] **Search returns results** — test 10 different queries
- [ ] **All filters work** — brand, type, gender, price range
- [ ] **Product pages load** — spot check 10 product pages
- [ ] **Brand pages load** — check `/brand/lattafa`, `/brand/ajmal`
- [ ] **Category pages load** — all 7 categories return results or a clean empty state
- [ ] **Mobile layout** — test on phone (or Chrome DevTools mobile mode)
- [ ] **Images load** — no broken images on product cards
- [ ] **"Buy Now" links work** — clicking opens correct retailer URL

---

## 8. Performance

- [ ] **Core Web Vitals green** — run [PageSpeed Insights](https://pagespeed.web.dev) on homepage and a product page
- [ ] Target: LCP < 2.5s, CLS < 0.1, FID < 100ms
- [ ] Product images have explicit `sizes` attribute (already done in ProductCard)
- [ ] Homepage `getFeaturedProducts()` query is fast (< 200ms) — check Supabase logs

---

## 9. Affiliate Setup

- [ ] **Identify which retailers have affiliate programs:**
  - Lattafa USA — check their site for "Affiliates" or email them
  - FragranceX — has a public affiliate program
  - FragranceNet — has a public affiliate program
  - Al Haramain — email them
- [ ] **Apply to 2–3 programs** — even without traffic, apply early (approval takes weeks)
- [ ] **Update `affiliate_url_pattern`** in `retailers` table once approved:
  ```sql
  UPDATE retailers
  SET affiliate_url_pattern = 'https://www.fragrancex.com/...?affid=YOUR_ID'
  WHERE slug = 'fragrancex';
  ```
- [ ] Update `buildAffiliateUrl()` in `src/lib/utils.ts` to inject your affiliate tag

---

## 10. First Users

- [ ] **Post to r/fragrance** — "I built a price comparison for MENA/Arabian fragrances"
- [ ] **Post to r/ArabicFragrances** (if it exists) or r/Oud
- [ ] **Instagram/TikTok** — 3 posts showing side-by-side price comparisons for popular scents
- [ ] **FragranceNet, Basenotes, or Fragrantica forums** — link in relevant threads
- [ ] **Target: 100 unique visitors in first 30 days**
- [ ] **Collect feedback** — add a simple "Suggest a brand" or "Report a price error" form

---

## Phase 2 Unlock Criteria

You are ready for Phase 2 (premium subscriptions) when:

| Metric | Target |
|--------|--------|
| Products in DB | 500+ |
| Active retailers | 8+ |
| Monthly visitors | 500+ |
| Daily scraper | Running reliably for 2+ weeks |
| Affiliate clicks | 50+ total |
| User feedback | At least 5 pieces of feedback collected |

---

## Quick Reference — Current Status

| Area | Status |
|------|--------|
| Core app | Built |
| Scrapers | 9 configured (need to run) |
| DB schema | Deployed |
| Hosting | Not yet deployed |
| Domain | Not purchased |
| SEO files | Not created |
| Legal pages | Not created |
| Analytics | Not set up |
| Affiliate programs | Not applied |
