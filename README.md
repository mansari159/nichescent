# NicheScent — Setup Guide

Fragrance price comparison for MENA brands. Built with Next.js 14, Supabase, and Tailwind CSS.

---

## Prerequisites

You need three things installed before starting:

1. **Node.js 20+** — download from [nodejs.org](https://nodejs.org) (choose "LTS")
2. **Git** — download from [git-scm.com](https://git-scm.com)
3. A free **Supabase account** — sign up at [supabase.com](https://supabase.com)

---

## Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Give it a name (e.g. `nichescent`) and create a strong database password (save it!)
3. Wait ~2 minutes for the project to boot
4. Go to **SQL Editor** (left sidebar) → **New Query**
5. Open the file `supabase/schema.sql` from this project, paste the entire contents, and click **Run**
6. You should see "Success" — this creates all tables, indexes, and seed data

**Get your API keys:**

- Go to **Project Settings** → **API**
- Copy:
  - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role secret` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Configure environment variables

In the `nichescent` folder, make a copy of `.env.local.example` and name it `.env.local`:

```
# On Mac/Linux:
cp .env.local.example .env.local

# On Windows (Command Prompt):
copy .env.local.example .env.local
```

Open `.env.local` in any text editor and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional — get a free key at exchangerate-api.com for live currency rates
EXCHANGE_RATE_API_KEY=

# Your site URL (use localhost for development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 3 — Install dependencies

Open a terminal (Command Prompt or PowerShell on Windows) in the `nichescent` folder and run:

```bash
npm install
```

This downloads all required packages (~300MB, takes 1-2 minutes).

---

## Step 4 — Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You'll see the homepage — it'll be empty until you run the scrapers in the next step.

---

## Step 5 — Populate with data (run scrapers)

Open a **second terminal** in the `nichescent` folder and run:

```bash
# Scrape all retailers (Lattafa USA, Afnan, Dukhni)
npm run scrape

# Then match scraped listings to products in the database
npm run match
```

The first run takes 5-10 minutes. After it completes, refresh [http://localhost:3000](http://localhost:3000) — you should see products!

**To scrape just one retailer:**
```bash
node scripts/scrape-all.js --retailer lattafa-usa
node scripts/scrape-all.js --retailer afnan
node scripts/scrape-all.js --retailer dukhni
```

---

## Step 6 — Deploy to Vercel (optional, free)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
3. In the "Environment Variables" section, add all variables from your `.env.local`
4. Click Deploy — done! You get a free `yourapp.vercel.app` URL

**Set up automatic daily scraping (free with GitHub Actions):**

1. In your GitHub repo, go to **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `EXCHANGE_RATE_API_KEY` (optional)
3. The workflow file `.github/workflows/daily-scrape.yml` is already included — it will run automatically every day at 3 AM UTC

---

## Project structure

```
nichescent/
├── .env.local              ← your secrets (never commit this!)
├── .github/
│   └── workflows/
│       └── daily-scrape.yml  ← GitHub Actions cron job
├── supabase/
│   └── schema.sql          ← run this in Supabase SQL editor
├── scripts/
│   ├── scrape-all.js       ← master scraper (runs all retailers)
│   ├── match-products.js   ← links scraped data to products
│   ├── update-exchange-rates.js
│   └── scrapers/
│       ├── shopify.js      ← generic Shopify scraper (used by all)
│       ├── lattafa.js      ← Lattafa USA config
│       ├── afnan.js        ← Afnan Perfumes config
│       └── dukhni.js       ← Dukhni config
└── src/
    ├── app/                ← Next.js pages & API routes
    │   ├── page.tsx        ← homepage
    │   ├── search/         ← search results
    │   ├── product/[slug]/ ← product detail
    │   ├── brand/[slug]/   ← brand page
    │   ├── category/[slug]/ ← category page
    │   └── api/            ← REST API endpoints
    ├── components/         ← React components
    ├── lib/                ← Supabase client, utilities, currency
    └── types/              ← TypeScript type definitions
```

---

## Adding more retailers

To add a new Shopify-based retailer:

1. Create `scripts/scrapers/new-retailer.js` (copy from `lattafa.js`, update the config)
2. Add it to `scripts/scrape-all.js` SCRAPERS map
3. Add the retailer to Supabase via the SQL editor:
   ```sql
   INSERT INTO retailers (name, slug, domain, platform, base_currency, country)
   VALUES ('Retailer Name', 'retailer-slug', 'www.retailer.com', 'shopify', 'USD', 'AE');
   ```

---

## Common issues

**"Cannot find module '@supabase/supabase-js'"**
→ Run `npm install` again

**Homepage shows empty / no products**
→ You need to run `npm run scrape` then `npm run match`

**Scraper times out**
→ The retailer's site may be slow. Try running a single retailer: `node scripts/scrape-all.js --retailer lattafa-usa`

**Supabase "permission denied" errors**
→ Make sure you used the `service_role` key in `.env.local` for `SUPABASE_SERVICE_ROLE_KEY`, NOT the `anon` key

**Product images not loading on Vercel**
→ Add the retailer's image domain to `next.config.js` under `images.remotePatterns`

---

## npm scripts reference

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run scrape` | Run all scrapers |
| `npm run match` | Run product matcher |
| `npm run rates` | Update exchange rates |

---

Built with ❤ for the niche fragrance community.
