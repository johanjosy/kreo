# KREO — Implementation Plan

Status: MVP built, pre-deploy · Last updated: 2026-11-15
Related: [[PROJECT_BRIEF]] · [[DESIGN_BRIEF]] · [[TASKS]] · [[CHANGELOG]]

## Principles

- Client-only app. No backend, no auth, no paid APIs.
- Smallest dependency set that does the job; every dependency below has a reason.
- The pricing engine is pure TypeScript with no React, so it can be tested alone and reused later (e.g. a server or a shared rate card).
- Build on verified tools from the environment audit; no reinstalls.

## Technology stack

Versions checked against npm on 2026-11-15.

| Package | Version | Why |
| --- | --- | --- |
| `next` | 16.4.x | App Router, static output, Vercel-native |
| `react`, `react-dom` | 19.3.x | — |
| `typescript` | 7.0.x | — |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.x | Tokens as CSS variables via `@theme` |
| `motion` | 14.x | Count-up totals, range markers, sheet; reduced-motion support |
| `lucide-react` | 1.x | A handful of icons (close, expand, download) |
| `@react-pdf/renderer` | 4.9.x | Real vector PDF with selectable text; loaded only on download |
| `zod` | 4.x | One schema for form input and for data read back from browser storage |
| `@radix-ui/react-dialog` | 1.3.x | Accessible bottom sheet (focus trap, escape, scrim). Select and Tooltip turned out unnecessary |
| Dev: `@playwright/test`, `@axe-core/playwright` | 1.65.x, 4.14.x | End-to-end, screenshots, accessibility |

Not used, with reasons: Zustand / react-hook-form (one reducer is enough), GSAP / Lenis / anime.js (no choreography or scroll effects in the design), a component kit beyond the three primitives (the design is custom).

Tests for the pricing engine run with Node's built-in `node --test` (Node 26 runs TypeScript directly), so no test framework dependency.

### Recommended changes to the proposed stack

- **Add `@react-pdf/renderer`** for the PDF (not `window.print()`, which varies by browser, and not html2canvas, which produces blurry images).
- **Add `zod`** to validate data read from browser storage, which is untrusted input.
- **No shadcn/ui kit**: only the Radix Dialog primitive is used; the custom components in the design brief replace the rest.

## Project structure

```
kreo/
├── app/
│   ├── layout.tsx            fonts, theme, top bar
│   ├── page.tsx              the terms document (main screen)
│   ├── quote/[id]/page.tsx   quote preview + PDF download
│   └── quotes/page.tsx       saved quotes
├── components/
│   ├── terms/                TermsDocument, Blank, ChoiceBlank, PlatformToggle, Clause
│   ├── margin/               MarginNote, RangeRuler, LineItem, Total, EstimateNotice
│   ├── quote/                QuotePreview, QuotePdf (react-pdf, lazy)
│   └── ui/                   Button, BottomSheet, Select, Tooltip
├── lib/
│   ├── pricing/              engine.ts, types.ts, engine.test.ts
│   ├── storage.ts            versioned load/save + zod validation
│   ├── state.ts              reducer + context
│   └── format.ts             currency and number formatting (Intl)
├── config/
│   └── benchmarks.ts         every rate, with source or "assumption" label
├── tests/                    Playwright specs: flow, screenshots, a11y
└── explorations/             design prototypes (reference only, not shipped)
```

## Component hierarchy

```
RootLayout
├── TopBar (wordmark, Quotes link, ThemeToggle)
└── TermsPage
    ├── TermsDocument
    │   ├── Clause: profile      (Blank ×n, ChoiceBlank niche, PlatformToggle)
    │   ├── Clause: per platform (Blank followers, views, engagement)
    │   ├── Clause: campaign     (Blank brand, campaign, deliverable counts)
    │   ├── Clause: terms        (Blank usage, exclusivity, revisions)
    │   └── ExtraDeliverables    (name + price rows)
    └── MarginNote  (desktop: sticky column · mobile: fixed bar + BottomSheet)
        ├── Total
        ├── RangeRuler
        ├── LineItem ×n (expandable calculation)
        ├── EstimateNotice
        └── Button "Turn into a quote"
QuotePage
├── QuotePreview (same components, read-only)
└── DownloadPdfButton → dynamic import of QuotePdf
```

## Data structures

```ts
type Platform = 'instagram' | 'tiktok' | 'youtube';
type Niche = 'beauty' | 'lifestyle' | 'fashion' | 'fitness' | 'food' | 'travel' | 'gaming' | 'tech' | 'finance' | 'education' | 'other';
type DeliverableKind = 'igReel' | 'igStory' | 'igPost' | 'tiktokVideo' | 'youtubeVideo';

interface PlatformStats { followers: number; avgViews: number; engagementRate: number } // engagement in %

interface CreatorProfile {
  name: string;
  niche: Niche;
  platforms: Partial<Record<Platform, PlatformStats>>; // only platforms the creator uses
  currency: 'EUR' | 'GBP' | 'USD';                     // display only, no conversion
}

interface Campaign {
  id: string;
  name: string;
  brand: string;
  deliverables: Partial<Record<DeliverableKind, number>>;
  extras: { label: string; price: number }[];
  usageMonths: number;
  exclusivityMonths: number;
  revisionRounds: number;
  createdAt: string;
  updatedAt: string;
}

interface LineItem { kind: DeliverableKind | 'extra' | 'usage' | 'exclusivity' | 'revisions'; label: string; count: number; unit: number; total: number; explanation: string }

interface PriceResult { lines: LineItem[]; base: number; target: number; floor: number; anchor: number }

interface StoredState { version: 1; profile: CreatorProfile | null; campaigns: Campaign[]; benchmarkOverrides?: Partial<Benchmarks> }
```

## Pricing methodology

### Formula

For each deliverable:

```
expected views = platform avgViews × format view share
unit price     = expected views ÷ 1,000 × rate per 1,000 views × engagement multiplier × niche multiplier
line total     = unit price × count
```

Then:

```
base         = sum of deliverable lines + extras
usage        = base × usage rate per month × usage months
exclusivity  = base × exclusivity rate per month × exclusivity months
revisions    = base × revision rate × (revision rounds − included rounds)
target       = base + usage + exclusivity + revisions
walk-away    = target × floor ratio
opening ask  = target × anchor ratio
```

Every line carries a plain-language explanation built from these numbers. If a platform's views are missing, its deliverables are disabled with a prompt to add them; followers alone are never used to invent views.

### Starting values (all in `config/benchmarks.ts`, all editable)

| Value | Starting point | Status |
| --- | --- | --- |
| Rate per 1,000 views: TikTok video | €20 | Assumption, within the €10–30 lifestyle range cited by [1] |
| Rate per 1,000 views: Instagram Reel | €22 | Assumption, same basis |
| Rate per 1,000 views: YouTube video | €30 | Assumption, same basis |
| Rate per 1,000 views: Instagram Story frame / static post | €10 / €15 | Assumption |
| View share: Reel / Story / static post vs. avg views | 1.0 / 0.3 / 0.5 | Assumption |
| Engagement multiplier | <2%: 0.85 · 2–4%: 1.0 · 4–6%: 1.1 · ≥6%: 1.2 | Assumption; engagement as a pricing signal described in [1] |
| Niche multiplier | 0.9 (gaming) to 1.5 (finance) | Assumption; higher-value niches (finance, tech) cited at €30–80 per 1,000 in [1] |
| Paid usage | 15% of base per month | Assumption, inside the +20–50% for 30–90 days cited in [1]; per-month formula from [2] |
| Exclusivity | 10% of base per month | Assumption; same formula [2] |
| Revisions | 1 round included, then 10% of base per round | Assumption; revisions as a separate cost described in [1] |
| Walk-away / opening ask | 80% / 125% of target | Assumption (negotiation convention, not a market fact) |

### Sources

1. Stan, "Influencer rates" (2026): https://stan.store/blog/influencer-rates/ — CPM ranges by niche, usage and revision surcharges, engagement as a pricing factor.
2. Sup, "Usage rights calculator": https://sup.co/tools/usage-rights-calculator — usage fee = base fee × monthly rate × months.
3. Kreatory, "Influencer marketing costs 2026": https://www.kreatory.com/en/post/influencer-marketing-kosten — CPM formula; per-follower rules are rough approximations.

Retrieved 2026-11-15 via Firecrawl. These are vendor guides, not neutral studies: KREO presents every result as an estimate.

## State management

- One `useReducer` in a context provider holds `StoredState` plus the active campaign id.
- Price is derived (`useMemo(() => price(profile, campaign, benchmarks))`), never stored.
- Inputs update state on change; formatting (thousands separators) applies on blur.

## Browser storage

- Key `kreo:v1`; writes debounced (300ms).
- On load: parse, validate with zod, migrate by `version`. Invalid data is not thrown away silently: it is kept under `kreo:v1:backup` and the user is told their saved data could not be read.
- All storage access wrapped in try/catch (private windows, blocked storage); the app works without it.
- Export / import as a JSON file is a small follow-up, not MVP.

## PDF generation

- `QuotePdf` built with `@react-pdf/renderer`, imported with `next/dynamic` / `import()` only when the user clicks "Download PDF".
- `pdf(<QuotePdf />).toBlob()` then a download link; no server.
- Fonts: static Newsreader and Hanken Grotesk WOFF files in `public/fonts/`, registered with `Font.register`. Confirmed working (react-pdf can't use the variable fonts).
- The negotiation range never appears in the PDF.

## Responsive implementation

- Breakpoint at 880px (document + margin vs. single column), checked at 375, 768, 1280 and 1440px.
- Mobile: fixed bottom bar with safe-area padding, bottom sheet for the breakdown, 16px minimum input text (no iOS zoom), 44px touch targets, `min-h-dvh`.
- No horizontal scroll at any width.

## Testing strategy

| Layer | Tool | Covers |
| --- | --- | --- |
| Pricing engine | `node --test` | Formula, edge cases (zero views, no platforms, extras only), floor < target < anchor, rounding |
| Storage | `node --test` | Corrupt data, old version, missing fields |
| Main flow | Playwright | Fill the sentence, see the total, open quote, download PDF |
| Visual | Playwright screenshots | 375 / 768 / 1280 / 1440px, light and dark, overflow check |
| Accessibility | axe via Playwright | WCAG 2.2 AA on every route |
| Design quality | Impeccable (hooks + critique), UI UX Pro Max checklist | Hierarchy, contrast, anti-patterns |
| Security | Security Guidance plugin (once installed) | Review of storage parsing, PDF input, dependencies |

A passing build is not the finish line: each milestone ends with a screenshot review at mobile and desktop.

## Deployment

- Vercel, connected to a new GitHub repository for KREO.
- Static where possible; no environment variables needed.
- Preview deployment per pull request; production on `main`.

## Development sequence

1. Docs approved → `git init`, Next.js app, Tailwind tokens from [[DESIGN_BRIEF]], fonts.
2. Pricing engine + benchmarks + tests (no UI).
3. Terms document with blanks, platform toggle, state, storage.
4. Margin note: total, line items with explanations, range ruler.
5. Mobile: fixed bar and bottom sheet.
6. Quote preview, PDF spike, then full PDF.
7. Saved quotes list.
8. Dark mode, motion, empty and error states.
9. QA pass (Playwright, axe, Impeccable, Security Guidance), fixes, deploy.
