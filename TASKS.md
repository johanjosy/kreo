# KREO — Tasks

Central progress tracker. Tick tasks as they finish and log milestones in [[CHANGELOG]].
Related: [[PROJECT_BRIEF]] · [[DESIGN_BRIEF]] · [[IMPLEMENTATION_PLAN]]

`needs:` lists tasks that must be done first.

## 1. Planning

- [x] P1 Audit development environment and give KREO its project skills
- [x] P2 Research pricing methodology and capture sources
- [x] P3 Write project brief, implementation plan, tasks, changelog
- [x] P4 Approve open assumptions: currency, language, single profile, starting rates — needs: P3
- [x] P5 Install Security Guidance plugin (user action via plugin card)

## 2. Design

- [x] D1 Explore three directions as working prototypes (`explorations/`)
- [x] D2 Select direction: B "Terms" + C's range
- [x] D3 Write design brief with tokens, type, components, motion
- [x] D4 ~~Prototype the range ruler in `b-terms.html`~~ Built and reviewed directly in the app instead
- [x] D5 Design the quote document (screen + PDF) — needs: D3
- [x] D6 Design empty, error and first-run states — needs: D3
- [ ] D7 Impeccable full critique of the built app (detector run is clean; written critique not yet done) — needs: D4, D5, D6

## 3. Initialisation

- [x] I1 `git init`, `.gitignore` (incl. `.firecrawl/`, `node_modules/`) — needs: P4
- [x] I2 Create Next.js app (set up by hand instead of the scaffolder; docs stay at root) — needs: I1
- [x] I3 Tailwind 4 tokens for light and dark from [[DESIGN_BRIEF]] — needs: I2
- [x] I4 Fonts via `next/font` (Newsreader, Hanken Grotesk) — needs: I2
- [x] I5 Add Radix Dialog for the bottom sheet (Select and Tooltip not needed: native select, no tooltips) — needs: I2
- [x] I6 `.claude/launch.json` for KREO dev and production servers — needs: I2
- [x] I7 Playwright + axe setup, screenshot script — needs: I2

## 4. Core development

- [x] C1 Types and `config/benchmarks.ts` with source/assumption labels — needs: P4
- [x] C2 Pricing engine with explanations — needs: C1
- [x] C3 Engine tests (formula, edge cases, range order, rounding) — needs: C2
- [x] C4 Reducer, context, derived price — needs: C2, I2
- [x] C5 Browser storage with zod validation, versioning, backup on failure — needs: C4
- [x] C6 Storage tests — needs: C5

## 5. Feature development

- [x] F1 Blank and ChoiceBlank components (labels, formatting on blur, errors) — needs: I3, I4
- [x] F2 Terms document clauses and platform toggle — needs: F1, C4
- [x] F3 Extra deliverables (name + price) — needs: F2
- [x] F4 Margin note: total, line items with expandable calculation — needs: C2, F2
- [x] F5 Range ruler — needs: F4
- [x] F6 Mobile fixed bar and bottom sheet — needs: F4, I5
- [x] F7 Quote preview route — needs: F4
- [x] F8 PDF spike: static fonts in react-pdf — needs: I4
- [x] F9 Quote PDF and download — needs: F7, F8
- [x] F10 Saved quotes list (open, view, delete with undo). Duplicate not built yet — needs: C5
- [x] F11 ~~Dark mode and theme toggle~~ Removed 2026-11-15: light only, by decision — needs: I3
- [x] F12 Motion: totals, markers, sheet, reduced motion — needs: F5, F6
- [x] F13 Your rates page: edit every starting rate, per-value and full reset — needs: C2
- [x] F14 29 currencies with converted benchmarks — needs: C2
- [ ] F15 Default currency from the visitor's browser region
- [ ] F16 Back up quotes to a file and restore them

## 6. Quality assurance

- [x] Q1 End-to-end test of the main flow — needs: F9
- [x] Q2 Screenshots at 375 / 768 / 1280 / 1440, white page even on dark-mode devices, no overflow — needs: F11
- [x] Q3 axe WCAG 2.2 AA on all routes — needs: F10
- [ ] Q4 Impeccable critique and fixes (detector clean on pages and source) — needs: Q2
- [ ] Q5 UI UX Pro Max pre-delivery checklist — needs: Q2
- [ ] Q6 Security Guidance review (plugin hooks active during build; full diff review not yet run) — needs: P5, F10
- [x] Q7 Check every estimate is labelled as an estimate — needs: F9
- [ ] Q8 Manual check on a real phone — needs: F6

## 7. Deployment

- [x] R1 GitHub repository (public: github.com/johanjosy/kreo) and Vercel project — needs: I1
- [x] R2 Production deploy: https://kreoapp.vercel.app (Q4–Q6 and Q8 still open) — needs: Q1–Q8
- [x] R3 Smoke test the production URL (full Playwright suite with `BASE_URL`) — needs: R2
- [x] R4 Changelog entry for MVP release — needs: R3
