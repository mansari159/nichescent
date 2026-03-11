# AUTONOMOUS_INSTRUCTION.md — First-Principles Review

Unbiased critique. Every issue is numbered, quoted, and given a concrete fix. Issues are ordered roughly by severity (build-breaking → logic errors → ambiguity → polish).

---

## 1. `$PROJECT` is never actually set as a shell variable

**Quoted:**
> "Locate the project root:
> ```bash
> find /sessions -name "package.json" -path "*/nichescent/*" -not -path "*/node_modules/*" 2>/dev/null | head -1 | xargs dirname
> ```
> Export this as `PROJECT` and use it for all subsequent paths."

**Problem:** The instruction says to "export this as PROJECT" but the bash command only *prints* the directory — it doesn't assign anything. The agent must know to run `export PROJECT=$(find ...)`. Since each Bash tool call in Cowork is a fresh shell, even a correct export from one call won't persist to the next. Every subsequent call using `$PROJECT` will silently get an empty string, causing every `cd $PROJECT`, `grep ... $PROJECT/src`, `cat $PROJECT/.env.local` to operate on the wrong path or fail silently.

**Fix:** Replace the instruction with:
```bash
export PROJECT=$(find /sessions -name "package.json" -path "*/nichescent/*" -not -path "*/node_modules/*" 2>/dev/null | head -1 | xargs dirname)
echo "PROJECT=$PROJECT"
[ -z "$PROJECT" ] && echo "ERROR: Could not locate project root" && exit 1
```
Then note: **every single Bash command block in the instruction that uses `$PROJECT` must prefix with `export PROJECT=<path> &&` or use the absolute path directly.** The safest fix is to resolve the path once, hardcode it as `/sessions/clever-brave-davinci/mnt/nichescent` throughout, and stop relying on a variable that can't persist.

---

## 2. `npm install 2>&1 | tail -5` silences critical output

**Quoted:**
> ```bash
> cd $PROJECT && npm install 2>&1 | tail -5
> ```

**Problem:** Showing only the last 5 lines of `npm install` output hides peer dependency warnings and deprecation errors. A failed peer dep resolution looks like a warning but can cause subtle runtime breakage. The `tail -5` means the agent will miss `WARN: found X vulnerabilities`, `npm WARN peer dep`, or `ERR!` lines that appear earlier.

**Fix:** Remove the `| tail -5`. If output verbosity is a concern, use `npm install --loglevel=error` to suppress noise while keeping actual errors visible.

---

## 3. Phase 1 "Do not proceed until you understand what needs fixing" is agent-stalling language

**Quoted:**
> "Categorise every error line. Do not proceed until you understand what needs fixing."

**Problem:** An autonomous agent cannot "understand" in any meaningful sense. If the build fails with an error that isn't in the listed categories (e.g., a missing env var, a misconfigured Tailwind plugin, a `Cannot use import statement` ESM error), the agent has no decision tree to follow. It will either stall, guess, or proceed blindly.

**Fix:** Replace with an explicit fallback: "If the error type isn't listed above, paste the exact error text into DONE.md under 'Known Remaining Issues' and continue to Phase 2. Do not attempt to fix errors not explicitly covered here." This converts an open-ended judgement call into a decision procedure.

---

## 4. `2.4` instructs a fix for a bug that doesn't exist in the file it's targeting

**Quoted:**
> "In the search API route, the query must use:
> ```ts
> .ilike('name', `%${query}%`)
> ```
> Not `.eq()`."

**Problem:** There is no separate "search API route" file. The search logic lives in `src/app/search/page.tsx` as a server component function `searchProducts()`. That file already uses `.textSearch('search_vector', q.trim(), { type: 'websearch', config: 'english' })` with an `.ilike()` fallback in a try/catch. The instruction directs the agent to a non-existent file and implies fixing a bug that was already handled. If the agent creates a new `/api/search` route with `.ilike()` to "fix" this, it will create orphaned dead code.

**Fix:** Either remove 2.4 entirely, or rewrite it to: "Verify `src/app/search/page.tsx` has `.ilike()` as fallback in the `searchProducts()` function catch block — it already does. If the `textSearch` call is missing the try/catch wrapper, add it. No other change needed."

---

## 5. `3.1` script uses `process.env.PROJECT` which is undefined unless shell var was exported

**Quoted:**
> ```js
> const env = readFileSync(process.env.PROJECT + '/.env.local', 'utf8')
> ```
> ```bash
> PROJECT=$PROJECT node /tmp/audit.mjs
> ```

**Problem:** The inline `PROJECT=$PROJECT` sets the env var for that process — but only if `$PROJECT` (the shell variable) was already set before this command. If issue #1 wasn't fixed, `$PROJECT` is empty, `process.env.PROJECT` is `undefined`, and the path becomes `"undefined/.env.local"`, causing a crash. The script silently fails to read Supabase credentials with a confusing ENOENT error instead of a clear "project path not found" message.

**Fix:** Hardcode the project path in the script, or add a guard: `const envPath = (process.env.PROJECT || '/sessions/clever-brave-davinci/mnt/nichescent') + '/.env.local'` with an existence check.

---

## 6. `2.3` says "Find the sentinel element" with no way to locate it

**Quoted:**
> "Open `src/components/InfiniteScrollLoader.tsx`. Find the sentinel element passed to `IntersectionObserver`. It must have non-zero height. Add `className="h-1"` if it has no class."

**Problem:** No grep command is given to locate the sentinel. The instruction assumes the agent can visually identify which `<div>` in an unfamiliar component is the IntersectionObserver sentinel. It also gives a correctness assertion ("Verify `loadMore` reads state via refs") without a way to check if the current implementation does or doesn't. An agent reading an 80-line component that uses `useRef`, `useCallback`, and `IntersectionObserver` can't reliably distinguish a ref-safe pattern from a stale-closure one without explicit guidance.

**Fix:** Add:
```bash
grep -n "sentinel\|IntersectionObserver\|ref={" $PROJECT/src/components/InfiniteScrollLoader.tsx
```
Then: "The line containing `ref={sentinelRef}` or similar is the sentinel element. Ensure the element has at least `className='h-1'`."

---

## 7. `6.5 Change 4` adds `<img>` directly in a server component — the exact bug already fixed

**Quoted:**
> ```tsx
> {price.retailer?.logo_url && (
>   // eslint-disable-next-line @next/next/no-img-element
>   <img src={price.retailer.logo_url} alt="" className="w-5 h-5 object-contain" />
> )}
> ```
> "Check: if the compare prices section is inside the server component, wrap it in a small `'use client'` component or just omit the logo if the page can't support it."

**Problem:** This adds an `<img>` without `onError` inside `src/app/fragrance/[slug]/page.tsx`, which is a server component. While it won't trigger the *specific* `onError` build error, it can still break prerendering if the image URL is invalid. More importantly: the instruction says "check if it's inside a server component" and "wrap in a client component if needed" — but then doesn't actually do either. The agent is left with a conditional instruction ("maybe wrap it, maybe omit it") that a 1-shot autonomous execution cannot resolve with judgment.

**Fix:** Make a definitive choice. The safest: create a `RetailerLogo.tsx` client component (analogous to `BrandLogoImage.tsx`) with `onError` fallback, and use that here. Remove the "check and maybe wrap" hedge.

---

## 8. `6.7 Change 4` — always-in-DOM overlay will intercept all page clicks when "closed"

**Quoted:**
> ```tsx
> <div className={`fixed inset-0 z-30 pt-16 bg-obsidian-950/98 backdrop-blur-sm md:hidden transition-transform duration-200 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
> ```
> "Change the conditional rendering `{menuOpen && (...)}` to always render but conditionally show via transform."

**Problem:** `fixed inset-0` means the element covers the entire viewport. `translate-x-full` moves it off-screen visually, but it is still in the DOM and still receives pointer events. Every click on the page (nav links, product cards, anything) when the mobile menu is visually "closed" will be silently intercepted by the invisible full-screen overlay. This will break all mobile interaction.

**Fix:** Add `pointer-events-none` when closed:
```tsx
className={`fixed inset-0 z-30 pt-16 bg-obsidian-950/98 backdrop-blur-sm md:hidden transition-transform duration-200
  ${menuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}
```

---

## 9. `6.8` uses `{loading && ...}` but `InfiniteScrollLoader` uses a ref, not state

**Quoted:**
> "Find where `loading` state is true and the next batch hasn't loaded yet. After the product grid (after the last `<ProductCard>`), add:
> ```tsx
> {loading && (
>   <div className="grid...">
>     {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
>   </div>
> )}
> ```"

**Problem:** `InfiniteScrollLoader` tracks loading state with `loadingRef.current` (a ref), not a `loading` state variable. React does not re-render when a ref changes. `{loading && ...}` will reference an undefined variable (TypeScript error) or a stale value, and the skeleton will never display. This internal inconsistency is even acknowledged in the Failure Mode Reference table at the bottom: "Skeleton cards don't show | loading state check is wrong | ensure skeleton renders when `loadingRef.current === true`" — but the instruction itself still says `{loading &&`.

**Fix:** The instruction must tell the agent to add a `const [isLoading, setIsLoading] = useState(false)` state variable alongside the ref, and set it with `setIsLoading(true)` when loading starts and `setIsLoading(false)` when it finishes. Then `{isLoading && ...}` will work. Or — and this is simpler — just use the ref but force a re-render via a dummy state update when the ref changes.

---

## 10. `6.9` ordering contradiction — it references Phase 7 which hasn't happened yet

**Quoted:**
> "Verify the legal page links (`/privacy`, `/terms`, `/affiliate-disclosure`) exist as pages before this phase. If they don't, create them (see Phase 7)."

**Problem:** Phase 6.9 is step 9 of Phase 6. Phase 7 (which creates the legal pages) comes after Phase 6. The instruction tells the agent to check for pages that won't exist yet and to "see Phase 7" for how to create them — but the agent is still in Phase 6. This creates a recursive dependency where completing Phase 6 requires jumping ahead to Phase 7 and then resuming.

**Fix:** Simply remove the verification step from 6.9. The footer links are hardcoded in `layout.tsx` regardless of whether the pages exist — they'll just 404 until Phase 7 is complete. The footer doesn't need to be gated on legal page existence. Change 6.9 to: "The footer is already complete. No action required here. Legal pages are created in Phase 7."

---

## 11. `7.3` modifies the fragrance page's `<a>` tag which `8.4` then replaces

**Quoted (7.3):**
> "In `src/app/fragrance/[slug]/page.tsx`, immediately after the 'Purchase Now' button `<a>`, add:
> ```tsx
> <p className="text-[10px] text-obsidian-400 mt-2 text-center">
>   We may earn a commission.{' '} ...
> </p>
> ```"

**Quoted (8.4):**
> "In `src/app/fragrance/[slug]/page.tsx`, find the 'Purchase Now' `<a>` tag. ... Replace the `<a>` purchase button in the fragrance page with `<BuyButton href={purchaseUrl} productName={product.name} />`."

**Problem:** These two instructions touch the same code block in sequence. 7.3 adds a `<p>` immediately after the `<a>`. Then 8.4 replaces the `<a>` with `<BuyButton>`. This will likely work if the edits are made sequentially — the `<p>` is a sibling and survives the `<a>` replacement. But the Edit tool's `old_string` match in 8.4 needs to exactly match whatever the code looks like *after* 7.3 ran. If 7.3 modifies JSX immediately after the `<a>`, the context lines for 8.4's match may differ. This is a fragile edit sequence.

**Fix:** Combine 7.3 and 8.4 into a single edit operation: create the `BuyButton` component AND include the disclosure `<p>` inside it (or immediately after it in one edit pass). Doing both in one Edit call eliminates the sequential-dependency fragility.

---

## 12. `5.2` — Clearbit domain in `BRAND_LOGO_MAP` is not the same as the Shopify store domain

**Quoted:**
> "Get domain from `BRAND_LOGO_MAP` in `src/lib/utils.ts` (domain is embedded in Clearbit URL). Fetch `https://[domain]/products.json?limit=1` — if it returns JSON with a `products` array, the brand is Shopify-compatible."

**Problem:** `getBrandLogoUrl()` returns URLs like `https://logo.clearbit.com/lattafa.com`. The domain embedded is the brand's *marketing website* (e.g., `lattafa.com`), not their *Shopify storefront* (which might be `lattafausa.com`, `shopify.lattafausa.com`, or a completely different domain). Testing `lattafa.com/products.json` will return 404 even if the brand has a perfectly functional Shopify store at a different URL. This will cause the agent to skip brands that are genuinely scrapeable.

**Fix:** Acknowledge this limitation explicitly: "The Clearbit domain is a starting point. If `[clearbit-domain]/products.json` returns 404, also try `[brand-slug].myshopify.com/products.json` and `shop.[clearbit-domain]/products.json`. If none work, skip this brand."

---

## 13. `6.3` FilterBar on the search page may drop the active `q` search query

**Quoted:**
> "Place `<Suspense fallback={null}><FilterBar /></Suspense>` immediately after the closing `</section>` of the search header. No `navigatesToSearch` prop — the search page updates its own URL params."

**Problem:** The `FilterBar` component updates URL search params when a filter is selected. If the FilterBar's `onChange` uses `router.replace` or `router.push` with only the filter params (e.g., `?vibe=warm-spicy`), it will silently drop the existing `?q=saffron` query string. The user would type "saffron", see 47 results, click "Woody" filter, and get results for all woody fragrances — not just woody "saffron" results. The instruction doesn't show the FilterBar implementation's URL-building logic, so this is unverifiable from the instruction alone.

**Fix:** The FilterBar implementation in the instruction must preserve existing URL params. Show explicitly: when building the new URL inside FilterBar, start from `new URLSearchParams(window.location.search)` to preserve `q` and other active params. Add a test case: verify that after applying a filter, the `q` param is still present in the URL.

---

## 14. `6.3` — "Remove or simplify the existing sort select" is unspecified

**Quoted:**
> "Remove or simplify the existing sort select and filter chips area since FilterBar now handles filters. Keep the result count line... and the existing active filter chips can remain as a secondary indicator if desired."

**Problem:** "Remove or simplify" and "can remain... if desired" are hedged, non-determinate instructions for an autonomous agent. The sort select is functional (Newest/Price Low-High/Price High-Low/A-Z) and not redundant with a vibe/country/price filter bar. Removing it is a regression. The instruction gives the agent permission to remove a working feature with no clear rule for what to keep.

**Fix:** Be specific: "Remove the `<FilterModal>` import and `<FilterModal>` JSX only. Keep the result count line, the active filter chips (for removing applied filters), and the sort `<select>`. FilterBar adds new filter access but does not replace the sort control."

---

## 15. `6.4` — "If count > 30, there are too many" is an arbitrary, potentially destructive threshold

**Quoted:**
> "If count > 30, there are too many. Audit the results and change any that appear as inline labels..."

**Problem:** The count of `text-[10px] tracking-widest uppercase` occurrences across a 15+ page codebase could easily be 35-50, all legitimately used as section overlines. The "30" threshold is invented with no basis in the actual codebase. If the real count is 32, the agent will audit and change 2 lines of working code to satisfy an arbitrary rule, potentially breaking correct usages.

**Fix:** Remove the threshold entirely. Instead, be explicit: "The following specific usages are wrong and must be changed: [list exactly which files/lines to change]. Everything else keeps the uppercase tracked style." If the intent was to catch overuse broadly, replace with: "Run the grep. Read each result. Only change usages that appear *inside* a card, table row, or inline data display — not standalone lines above content blocks."

---

## 16. `6.6 Change 3` hardcodes vibe slugs without verifying they're in `VIBE_MAP`

**Quoted:**
> ```ts
> const HERO_VIBES = ['warm-spicy', 'woody-earthy', 'floral-romantic', 'smoky-intense', 'sweet-gourmand', 'fresh-clean']
> ```

**Problem:** The three new slugs (`smoky-intense`, `sweet-gourmand`, `fresh-clean`) are added without verifying they exist in `VIBE_MAP` in `src/lib/utils.ts`. If any slug is absent from `VIBE_MAP`, `getVibeStyle(slug)` returns `null`, `vibeStyle.css` throws a null-reference error, or the tile renders as a blank box with no gradient. The agent has no instruction to verify the slugs before adding them.

**Fix:** Add before the change: "Run `grep -o "'[a-z-]*'" $PROJECT/src/lib/utils.ts | grep -E "warm|woody|floral|smoky|sweet|fresh|fresh"` to confirm which slugs exist in VIBE_MAP. Only add slugs that appear in the map. If a desired slug is missing, pick the next available one."

---

## 17. `6.6 Change 2` replaces the entire editorial strip `style` object rather than surgically removing one property

**Quoted:**
> "Remove the `backgroundAttachment: 'fixed'` line from the inline style. Replace the `style` object with just:
> ```tsx
> style={{
>   backgroundImage: 'url(https://images.unsplash.com/photo-1594035910387-fea47794261f...)',
>   backgroundSize: 'cover',
>   backgroundPosition: 'center',
> }}
> ```"

**Problem:** The instruction hardcodes a specific Unsplash photo URL that may not match what's currently in the codebase (the URL could have been changed). If the actual `page.tsx` uses a different image, the agent will silently swap the image while only intending to fix the `backgroundAttachment` bug. This is a destructive side effect of an instruction that should have been surgical.

**Fix:** "Find the `backgroundAttachment: 'fixed'` property in the editorial strip's `style` object and delete only that property. Do not change the `backgroundImage` URL or other style properties."

---

## 18. `8.2` metadata grep only catches one directory level deep

**Quoted:**
> ```bash
> grep -rL "generateMetadata\|export const metadata" $PROJECT/src/app/*/page.tsx 2>/dev/null
> ```

**Problem:** The glob `*/page.tsx` matches exactly one directory level: `src/app/page.tsx`, `src/app/search/page.tsx`, etc. It misses all nested dynamic routes: `src/app/fragrance/[slug]/page.tsx`, `src/app/brand/[slug]/page.tsx`, `src/app/vibe/[slug]/page.tsx`, `src/app/countries/[slug]/page.tsx`, `src/app/note/[slug]/page.tsx`. These nested routes are exactly the pages that most need `generateMetadata` for SEO (they generate the most URLs). The most important pages for the sitemap are silently excluded from the audit.

**Fix:**
```bash
find $PROJECT/src/app -name "page.tsx" | xargs grep -rL "generateMetadata\|export const metadata"
```

---

## 19. `DONE.md` template checkboxes are never checked off — will look like nothing was done

**Quoted:**
> ```markdown
> ### Bugs Fixed
> - [ ] Build error: onError in server components → BrandLogoImage
> - [ ] Infinite scroll sentinel height fix
> ...
> ```

**Problem:** The DONE.md is created at the end (Phase 10) with all checkboxes unchecked. The instruction never says to use `[x]` for completed items. An agent executing linearly arrives at Phase 10 after completing everything and creates a document where every item says "not done." The DONE.md becomes worse than useless — it actively misrepresents the build state.

**Fix:** Change the instruction: "Create DONE.md and mark every successfully completed item as `- [x]`. Mark only items that failed or required manual action as `- [ ]` with a brief note." The DONE.md should reflect reality, not a blank template.

---

## 20. `DONE.md` has unfilled placeholder values with no instruction to fill them

**Quoted:**
> ```markdown
> **Date:** [today's date]
> - Live products: [count]
> - Total brands: [count]
> ```

**Problem:** The template uses `[today's date]`, `[count]`, etc. The instruction never explicitly tells the agent to substitute these with actual values from Phase 3's audit query. A literal `[count]` in the final DONE.md tells you nothing.

**Fix:** Add: "Replace all `[...]` placeholders with actual values. Use the numbers from Phase 3's audit output for database stats. Use today's date for the Date field. Use 'PASS' or 'FAIL' for Final build status based on Phase 9's exit code."

---

## 21. `5.3` scraper template is opaque — agent reads an arbitrary file and infers structure

**Quoted:**
> ```bash
> cat $PROJECT/scripts/scrapers/$(ls $PROJECT/scripts/scrapers/ | head -1)
> ```
> "Copy the template, change `domain`, `brandSlug`, `retailerSlug`."

**Problem:** The agent reads whatever the first file alphabetically is in the scrapers directory and is expected to infer which fields to change. The instruction doesn't document what fields a scraper file contains, what format `brandSlug` vs `retailerSlug` is (is it the Supabase `slug` column? or the `id`?), or what to do if the template has additional config fields (scrape depth, product count limit, etc.). If the first file has brand-specific config beyond just `domain/brandSlug/retailerSlug`, the agent has no guidance on what to preserve.

**Fix:** Document the scraper template fields inline, or point to a known-clean template file: "Use `scripts/scrapers/scrape-lattafa.js` as the template. The fields to change are at the top of the file: `const BRAND_SLUG`, `const RETAILER_SLUG`, `const DOMAIN`. Leave all other config unchanged."

---

## 22. No timeout on the scraper — could run indefinitely

**Quoted:**
> ```bash
> cd $PROJECT && node scripts/scrape-tier1.js 2>&1 | tee /tmp/scrape.txt
> ```

**Problem:** No timeout is specified. If a brand's `/products.json` endpoint hangs, or the Supabase upsert stalls, or there's a network issue, this command has no exit condition other than process completion. A Cowork session has a finite execution window. An indefinitely-running scraper will exhaust the session without completing downstream phases.

**Fix:** Add a timeout: `timeout 300 node scripts/scrape-tier1.js 2>&1 | tee /tmp/scrape.txt; echo "Scraper exit: $?"`. 5 minutes is sufficient for any Shopify `/products.json` scrape.

---

## 23. `6.1 Change 4` adds inline `<span>` note pills that `6.2 Step C` immediately replaces with `<NotePill>`

**Quoted (6.1 Change 4):**
> "After the fragrance name `<h3>`, insert a row of the first three notes as small pills using inline spans..."

**Quoted (6.2):**
> "Step C: Go back to `ProductCard.tsx`. Replace the inline `<span>` note pills added in 6.1 with `<NotePill note={note} size='sm' />`."

**Problem:** 6.1 deliberately adds temporary `<span>` elements only to immediately remove and replace them in 6.2. This is two Edit calls on the same file to accomplish what could be one. There's no reason to add intermediate `<span>` elements that will be discarded.

**Fix:** In 6.1 Change 4, don't add the spans yet — just add a comment placeholder or leave a note. In 6.2, add the `<NotePill>` elements directly in a single edit pass. Or: merge the two steps and add `<NotePill>` directly in 6.1 after `NotePill.tsx` has been created in 6.2. The ordering just needs to be: create `NotePill.tsx` first, then use it in `ProductCard.tsx`.

---

## 24. `4.1` says "Query via Supabase MCP or `/tmp/audit.mjs` extension" — "extension" is meaningless

**Quoted:**
> "Query via Supabase MCP or `/tmp/audit.mjs` extension"

**Problem:** "Extension" in this context is undefined jargon. The audit script was created in Phase 3.1 — calling it an "extension" implies it can be extended/modified, but there's no guidance on how. The agent may interpret "extension" as a browser extension, a Node.js extension, or something else.

**Fix:** Replace with: "Query via Supabase MCP tools, or modify and re-run `/tmp/audit.mjs` with updated queries."

---

## 25. Failure Mode Reference table acknowledges `translate-x-full` issue but the fix it gives still doesn't prevent click interception

**Quoted:**
> "Mobile menu animation broken | Conditional render removed but transform not applied | The element must always be in the DOM with conditional transform, not conditionally rendered"

**Problem:** The table describes the correct approach (always in DOM, conditional transform) but the fix it prescribes (matching what 6.7 Change 4 says) still creates an invisible full-screen overlay that intercepts clicks (see Issue #8 above). The table treats the symptom ("animation broken") but the real bug that will manifest is "nothing on mobile is clickable when menu is closed." The table won't help the agent find this because the *visible* symptom (animation) will appear correct.

**Fix:** Update the failure table entry: "Mobile menu animation broken OR nothing clickable on mobile | translate-x-full without pointer-events-none | Add `pointer-events-none` to the closed state: `${menuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`"

---

## Summary

**Build-breaking / definite failures:** Issues 1, 2 (env var problems that cascade), 3 (stall risk), 7, 8, 9, 18 (misses all important metadata pages)
**Logic errors / silent regressions:** Issues 4, 5, 6, 10, 13, 15, 17, 23
**Ambiguous or incomplete guidance:** Issues 11, 12, 14, 16, 20, 21, 24
**Polish / documentation gaps:** Issues 2, 19, 22, 25

The instructions are solid in structure and intent. The primary risk is the `$PROJECT` persistence issue (Issue 1) — it will silently break almost every bash command. Issues 8 and 9 together will leave the mobile nav broken in a way that's hard to debug. Issues 7 and 9's internal contradiction (the Failure Table gives the right answer but the instruction gives the wrong one) is a specific smell — the document was written iteratively and the instruction and fallback table fell out of sync.

Recommend: Fix issues 1, 7, 8, 9 before executing. The rest can be addressed reactively since Phase 9's build step will surface most TypeScript errors.
