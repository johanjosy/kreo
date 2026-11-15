# KREO — Changelog

Newest first. Records product decisions, architecture changes, milestones and significant fixes.
Related: [[TASKS]] · [[PROJECT_BRIEF]] · [[DESIGN_BRIEF]] · [[IMPLEMENTATION_PLAN]]

## 2026-11-15 — Your rates

### Milestones
- New "Your rates" page (`/rates`, in the top bar as "Rates"): creators can change the rate per 1,000 views for each format, the usage, exclusivity and revision percentages, and the walk-away and opening-ask percentages. Each changed value shows KREO's starting value with a one-click reset; "Go back to KREO's starting rates" resets everything.
- Every price (terms, quote, PDF, quotes list) uses the creator's rates. The estimate notice now says "your rates" and links to the page, closing the gap where it promised editable benchmarks that couldn't be edited.

### Architecture
- Overrides are stored in euros, like the benchmarks, so they keep their meaning when the currency changes. Saved as optional `rates` in `kreo:v1`; older saved data loads unchanged. Validated with zod (walk-away 50–99%, ask 101–200%).
- Tests: 20 unit tests, 11 browser tests (new: change a rate, see the total change, reset; axe on `/rates`).

## 2026-11-15 — More currencies

### Decisions
- Currency picker expanded from 3 to 29 common currencies, including AUD, NZD, CAD, SGD, INR and JPY, listed by name.
- Benchmarks stay in euros and are converted with approximate static exchange rates (`config/currencies.ts`), so prices aren't wrong by the exchange rate in currencies like yen or rupees. Extras are taken at face value.
- Assumption flagged: exchange-rate conversion ignores local market differences.

## 2026-11-15 — Brand adjustments

### Decisions
- Wordmark is now lowercase with a full stop: `kreo.`, set in Newsreader.
- Accent changed from banknote green to navy (`#1C2D5A`); ink and greys shifted to match (`#131A2E`, `#545D70`, `#D8DCE3`). All text still passes WCAG AA (lowest 6.6:1).
- Dark mode removed: no theme toggle, always a white page. The screenshot test now runs on a dark-mode device and checks the background stays white.

## 2026-11-15 — MVP build

### Milestones
- App built: terms document with inline blanks, platform toggles, extras; live margin note with count-up total, walk-away / target / ask ruler and expandable line-item calculations; mobile bottom bar and breakdown sheet; quote preview; PDF download; saved quotes list with undo; light and dark themes.
- Tests: 15 unit tests (pricing engine, storage), 6 Playwright tests (main flow including PDF download and axe on terms, quote and quotes pages, desktop and mobile), 8 screenshot and overflow checks (375 / 768 / 1280 / 1440, light and dark). Production build passes.

### Architecture
- Next.js app set up by hand (no scaffolder) to keep dependencies minimal.
- Only `@radix-ui/react-dialog` added from the Radix set; niche and currency use a native select, no tooltips needed.
- PDF fonts: static WOFF files in `public/fonts/` (react-pdf can't use variable fonts). Confirmed rendering with embedded Newsreader and Hanken Grotesk.
- Browser storage flushes on `pagehide` as well as the 300ms debounce, so the last edits aren't lost.

### Fixes
- Range ruler markers widened the page on desktop; ruler now clips horizontally.
- Range labels overlapped when the range was narrow; the scale now frames the range and labels sit on alternating sides.

### Decisions
- Starting assumptions approved: EUR default with currency picker, English only, one creator profile with many saved quotes, starting rates as documented.

## 2026-11-15 — Planning

### Decisions
- Visual direction: **B "Terms"** (the deal written as a sentence, live quote in the margin) with **C's negotiation range** (walk-away, target, opening ask). Directions A "Instrument" and C "Spread" kept in `explorations/` as reference.
- First design proposal ("Rate receipt", ink + coral) rejected as generic.
- Pricing is view-based (rate per 1,000 views) with engagement and niche multipliers; usage and exclusivity priced per month as a percentage of base. All starting rates are assumptions pending approval.
- Results are always presented as a range and labelled as estimates.
- Scope: no backend, no auth, no paid APIs; browser storage only.

### Architecture
- Planned stack: Next.js 16, React 19, TypeScript 7, Tailwind 4, `motion`, `lucide-react`, `@react-pdf/renderer` (lazy), `zod`, three Radix primitives via shadcn/ui. Engine tests with `node --test`; Playwright and axe for browser QA.

### Milestones
- Environment audit done. KREO given its own project skills: Emil Kowalski's 8 (reinstalled from source, `skills-lock.json`) and UI UX Pro Max + 6 claudekit skills (copied from the portfolio project, verified identical). Firecrawl CLI installed and authenticated.
- Planning documents created: project brief, design brief, implementation plan, tasks, changelog.
