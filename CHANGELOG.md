# KREO — Changelog

Newest first. Records product decisions, architecture changes, milestones and significant fixes.
Related: [[TASKS]] · [[PROJECT_BRIEF]] · [[DESIGN_BRIEF]] · [[IMPLEMENTATION_PLAN]]

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
