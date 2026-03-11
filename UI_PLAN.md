# RareTrace — UI Improvement Plan

The design foundation is strong: the obsidian/cream/gold palette, Cormorant serif, and the overall dark-editorial aesthetic are all right. What's missing is execution discipline — the same patterns repeat too uniformly, information hierarchy is weak in places, and a few key UX decisions actively hurt usability. This plan goes component by component with specific changes. Nothing here requires a design overhaul, just targeted surgery.

---

## Design Philosophy

Sites like Wikiparfum and SSQRD feel premium because they make two consistent choices: they give every page one clear job, and they treat whitespace as a design element rather than wasted space. RareTrace currently tries to do too much with too little visual breathing room — every section is the same density, the same border weight, the same micro-label style.

The target feel: **confident and editorial, not busy**. Every element should either communicate information or create atmosphere. Nothing should just fill space.

---

## Priority 1 — Product Card (highest leverage, appears everywhere)

**Current problems:**
- Price shows `$` / `$$` / `$$$` symbols instead of real prices. Users on a fragrance site are price-sensitive — they need `$45` not a vague tier symbol. This is the single biggest usability gap.
- The hover overlay (dark panel sliding up to cover the image) hides the thing users are looking at. It's clever but counterproductive.
- "Price" label in `text-[10px] uppercase` above the symbol makes the bottom section feel like a form, not a product.
- The vibe dot badge (top-right, 5px circle) is invisible and cryptic without a tooltip visible by default.
- No actual price shown anywhere — only the `$$$` tier.

**Changes:**

Replace the `$`/`$$`/`$$$` price display with the real price. The `lowest_price` is already on the product object:
```
Before: "$$$"
After:  "From $148"
```

Remove the "Price" overline label — it's redundant if the format is "From $X".

Move the hover overlay to a tooltip or remove it entirely. Instead, show the 3 note pills directly under the fragrance name (always visible, no hover required). This is what Wikiparfum does — notes are the key discovery signal.

Replace the vibe colored dot with a 2px colored left-border on the card. The entire card gets a vibe-colored left edge — visible at a glance across a whole grid without being loud.

Card bottom section simplified:
```
[Brand name in gold-500 uppercase]
[Fragrance name in Cormorant, 2 lines max]
[note pill] [note pill] [note pill]
─────────────────────────────────
From $45 USD          3 stores →
```

The `3 stores →` link makes it immediately clear this is a price comparison tool.

---

## Priority 2 — Search & Filter Experience

**Current problems:**
- Search page shows 24 static results with no infinite scroll (unlike the homepage). Users hit the bottom and that's it.
- The filter experience is hidden behind a modal (`FilterModal`) — users have to click "Filter" to see filter options, which kills discoverability.
- The sort select uses native `<select>` — it looks inconsistent with the rest of the UI.
- No count next to filter options ("Oud (143 fragrances)" vs just "Oud").

**Changes:**

Add a sticky horizontal filter bar directly below the search input, always visible. No modal needed. One row of horizontally scrollable filter pills:
```
[All Vibes ▾]  [All Countries ▾]  [Price ▾]  [Type ▾]  [Gender ▾]  |  Sort: Newest ▾
```
Each opens a small dropdown panel, not a full modal. Selected filters show as filled gold pills. This is exactly how SSQRD handles it — everything is accessible without a click to open a secondary interface.

Add infinite scroll to the search page. The homepage has it, the search page doesn't — that inconsistency is jarring.

Replace the native `<select>` for sort with a styled button that opens a small popover.

---

## Priority 3 — Typography Hierarchy

**Current problem:**
`text-[10px] tracking-widest uppercase text-obsidian-400` appears on literally every section as a label. There's no differentiation between a section overline ("Full Catalog"), an inline label ("Price"), a badge ("EDP"), and a metadata note ("3 stores"). They're all identical.

**Changes — establish 4 clear text levels:**

| Level | Use | Style |
|---|---|---|
| Display | Hero headlines, brand names | `font-serif text-5xl+ font-light` |
| Title | Section headings, product names | `font-serif text-2xl–4xl font-light` |
| Label | Section overlines, metadata keys | `text-[10px] tracking-widest uppercase` — keep this but use it ONLY for section overlines |
| Caption | Counts, notes, secondary info | `text-xs text-obsidian-400` — no uppercase, no tracking |

The fix is mostly about stopping the overuse of the uppercase-tracked micro-label. Inline metadata (store count, country) should use `text-xs text-obsidian-400` at normal tracking. Only section headers that introduce new sections get the uppercase tracked treatment.

---

## Priority 4 — Fragrance/Product Page

**Current problems:**
- The notes section is three `NoteSection` components stacked in a bordered box. It shows top/heart/base notes as identical flat pills with no visual hierarchy between them. The top notes are the lightest and most distinctive — they should be visually primary.
- The "Scent Character" vibe section is a `h-3` colored strip with text below it. This is the most visually interesting thing about a fragrance and it gets a 12px tall bar.
- Price display: shows `$$` symbol AND `From $45 USD` as separate lines. Pick one — show the real price prominently, drop the symbol on the detail page.
- The "Compare Prices" section is good but the retailer names have no logos — just text.

**Changes:**

Notes pyramid — three tiers with different visual weight:
- Top notes: larger pills, full background fill in a light color
- Heart notes: medium pills, border only
- Base notes: small pills, lighter text

This is how Wikiparfum does it. Top notes are what you smell first and what sells a fragrance — they should be most prominent.

Vibe section: replace the `h-3` bar with a proper vibe card. Full-width, maybe `h-20`, with the gradient as a background, vibe name in large serif, and a "Explore this vibe →" link. Make it feel like a destination, not a metadata tag.

Price display: drop the symbol. Show:
```
From $45 USD      [Best price at Lattafa USA]
[──────────────────────────────────────────────]
[  Purchase Now →  ]
```

Add retailer logos in the compare prices table. The `retailers` table has `logo_url` — use it. A logo next to "Lattafa USA" is significantly more trustworthy than plain text.

---

## Priority 5 — Homepage

**Current problems:**
- The hero is `min-h-screen` — on a 1080p monitor that's 1080px of hero before users see any products. This is too tall for a catalog/discovery site.
- The stats strip (dark bar with "X+ Fragrances") sits between the hero and the vibe section, splitting what should be a continuous dark-to-light transition.
- No product filtering visible on the homepage. Users land, see "All Fragrances," and have no way to narrow without leaving the page.
- The vibe tiles are only 3 items in a `grid-cols-3`. On mobile this stacks to 1 column which is a very long scroll just for 3 vibes.
- The "About RareTrace" editorial strip at the bottom has fixed background attachment (`backgroundAttachment: 'fixed'`), which doesn't work on mobile Safari and looks broken there.

**Changes:**

Reduce hero to 80vh max: `className="relative min-h-[80vh] flex items-center..."`. Users should see the beginning of the product grid when they land.

Merge the stats into the hero section itself — a thin strip at the bottom of the hero before the cream section starts. Keeps the dark-mode context.

Add a filter bar above the product grid on the homepage — same component as the search page filter bar. Users shouldn't have to navigate to `/search` just to filter by country.

Expand the vibe tiles to show 6 (not 3) in a `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` layout. Six tiles at smaller size is more discoverable than three tiles at full width.

Remove `backgroundAttachment: 'fixed'` from the editorial strip and replace with a static background. Fixed attachment is broken on mobile and only creates a minor parallax effect on desktop that isn't worth the bug.

---

## Priority 6 — Navbar

**Current problems:**
- The search icon in the nav links to `/search` but doesn't open an inline search. Users expect a search icon to expand to an input, not navigate away.
- Nav has 5 links including "About" — that's low value nav real estate. "About" belongs in the footer.
- On scroll, the nav becomes `bg-obsidian-950/95` which is slightly lighter than `bg-obsidian-950` — the difference is almost invisible and doesn't justify the code complexity.

**Changes:**

Replace the search icon with an expanding search input. On click, the nav right side expands into a search input. On blur or Escape, it collapses. This keeps users on the current page and is how most good discovery sites handle search.

Replace "About" nav link with a search-priority item. Nav links:
```
Vibes  |  Origins  |  Brands  |  Browse  |  [search icon]
```

The mobile menu is already decent. Add a subtle slide-in animation (`translateX` from right, 200ms ease-out) instead of just appearing. It's a small thing but makes the mobile experience feel polished.

---

## Priority 7 — Note Pills (Global)

Note pills appear on product cards, product pages, note pages, and brand pages. Currently they're all identical: `text-xs text-obsidian-600 border border-obsidian-200 px-2.5 py-1`.

**Change:** Color-code note pills by ingredient category. Map common notes to soft background tints:

| Category | Color | Examples |
|---|---|---|
| Florals | Rose-tinted (`#fce8e8` bg, `#b04040` text) | Rose, Jasmine, Ylang ylang |
| Woods/Resins | Warm brown (`#f5ede0` bg, `#7a4f2a` text) | Oud, Sandalwood, Cedar |
| Spices | Amber/saffron (`#fdf0d8` bg, `#8a5c00` text) | Saffron, Cardamom, Pepper |
| Musks/Ambery | Soft warm gray (`#f0ede8` bg, `#5a5048` text) | Musk, Ambergris, Civet |
| Citrus/Fresh | Light green/yellow (`#f0f5e8` bg, `#4a6030` text) | Bergamot, Lemon, Neroli |
| Others | Default `obsidian-50` bg | Anything unmapped |

This makes the note pills informative at a glance — you can immediately see if a fragrance is floral-heavy vs woody vs spicy just from the color mix. No other data needed.

Create a `getNoteCategory()` utility in `src/lib/utils.ts` and a `NotePill` component that applies the color. Replace all current note pill rendering with `<NotePill note={note} />`.

---

## Priority 8 — Loading States

**Current problem:** When infinite scroll fires a request, there's no visual feedback. The page just sits there until the next batch loads. With a slower connection this looks broken.

**Change:** Add skeleton loading cards. When `loading === true` in `InfiniteScrollLoader`, render 4–8 skeleton cards in the same grid positions as real cards:

```tsx
function SkeletonCard() {
  return (
    <div className="border border-obsidian-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-obsidian-50" />
      <div className="p-4 space-y-2">
        <div className="h-2 bg-obsidian-100 w-1/2 rounded" />
        <div className="h-4 bg-obsidian-100 w-3/4 rounded" />
        <div className="h-3 bg-obsidian-100 w-1/3 rounded" />
      </div>
    </div>
  )
}
```

This makes loading feel intentional rather than broken.

---

## Priority 9 — Footer

**Current state:** Unknown — not in the components list, might be in layout.tsx or missing entirely.

**What's needed:** A proper footer with 3 columns:
- Column 1: RareTrace logotype + 1 sentence description + social links
- Column 2: Navigate links (Vibes, Origins, Brands, Browse, About)
- Column 3: Legal (Privacy, Terms, Affiliate Disclosure) + email capture

Background: `bg-obsidian-950`. Full-width, `py-16`. A thin gold line above (`border-t border-gold-500/20`) distinguishes it from page content without being loud.

The footer is the last thing users see on every page — it's also where users go specifically to find About and legal links. It needs to exist and be real.

---

## Priority 10 — Mobile Grid

**Current state:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`

On mobile (375px), 2 columns means each card is ~170px wide. At that size, the card info section (brand name + fragrance name + price) is very cramped, especially with Cormorant serif which renders wide.

**Change:** On mobile, make the product card info section more compact:
- Remove the "Price" overline label (already suggested in Priority 1)
- Truncate fragrance name to 1 line (`line-clamp-1`) on mobile, 2 lines on desktop
- Stack price and store count vertically instead of side by side (already what they do, but tighten the `pt-3` border spacing)

Also: the `gap-6` between cards (24px) is generous for mobile where the cards themselves are only 170px. Use `gap-3 sm:gap-6` — tighter on mobile, normal on desktop.

---

## What Not to Change

The following are working well and shouldn't be touched:
- The obsidian/cream/gold color palette — it's distinctive and right
- Cormorant serif for headings — premium and appropriate
- The brand page hero with atmospheric photo + dark overlay
- The country origin tiles (3:4 portrait grid with photo)
- The vibe gradient tiles
- The product detail page 55/45 layout
- The breadcrumb navigation on product pages
- The alphabetical brand listing with quick-nav letters

---

## Implementation Order

1. **Product card** — highest leverage, every page. Replace price display, add note pills, add vibe border accent. (~2 hours)
2. **Note pills** — color-coding utility. Affects cards + product pages. (~1 hour)
3. **Filter bar** — sticky horizontal pills for search and homepage. Replaces the modal. (~3 hours)
4. **Typography cleanup** — audit and fix overuse of uppercase tracked micro-labels. (~1 hour)
5. **Product page** — notes pyramid visual hierarchy, vibe card, price display, retailer logos. (~2 hours)
6. **Homepage** — reduce hero height, expand vibe tiles to 6, add filter bar, fix mobile parallax. (~1 hour)
7. **Navbar** — inline search expansion, remove About link. (~1 hour)
8. **Skeleton loaders** — add to InfiniteScrollLoader. (~30 mins)
9. **Footer** — build the component, add to layout. (~1 hour)
10. **Mobile grid** — tighten gap on mobile, fix card truncation. (~30 mins)

Total estimated time: ~13 hours of focused implementation.

---

*March 2026*
