# KREO — Project Brief

Status: MVP built, pre-deploy · Last updated: 2026-11-15
Related: [[DESIGN_BRIEF]] · [[IMPLEMENTATION_PLAN]] · [[TASKS]] · [[CHANGELOG]]

## Vision

KREO helps content creators put a defensible price on a brand partnership and send a quote a brand takes seriously. Every number explains itself.

## Problem

- Creators with growing audiences get inbound brand requests but price by guesswork, copying peers or accepting the brand's first offer.
- Usage rights, exclusivity and revisions are often given away because creators don't know they carry a price.
- A quote sent as a DM or a note on a phone looks informal and weakens the creator's negotiating position.

## Target audience

**Primary:** independent creators with roughly 5,000–500,000 followers on Instagram, TikTok or YouTube who handle their own brand deals.

**Secondary (not MVP):** talent managers handling a small roster of creators.

### Personas

| Persona | Situation | What they need from KREO |
| --- | --- | --- |
| **The first deal** — 12k TikTok, lifestyle | First brand emails arriving, no idea what to charge | A number they can justify and a professional document to send |
| **The undercharger** — 80k Instagram + TikTok, skincare | Regular deals, suspects they leave money on the table, gives usage rights away | Itemised pricing that shows what rights and exclusivity are worth |
| **The negotiator** — 300k YouTube, tech | Brands push back on price | A walk-away price, a target and an opening ask, with reasoning they can quote back |

## Core value proposition

A creator states their terms in plain language and gets:

1. A **range**, not a single "true" price: walk-away, target and opening ask.
2. A **transparent breakdown**: every line shows how it was calculated.
3. A **professional quote** as a PDF, ready to send.

## MVP features

### Creator profile
- Creator name, content niche.
- Platforms used (Instagram, TikTok, YouTube). Only the chosen platforms show their deliverables.
- Per platform: followers, average views, engagement rate.

### Campaign configuration
- Campaign name, brand name.
- Deliverables: Instagram Reels, TikTok videos, YouTube videos, Instagram Stories, static posts, additional custom deliverables (name + price).
- Usage rights (paid usage months), exclusivity (months), revision rounds.

### Pricing engine
- Considers audience size, average views, engagement, content format, deliverable count, usage rights, exclusivity and additional requirements.
- All rates live in one documented, editable configuration. Each value is labelled as sourced or assumed.

### Quote
- Review screen with itemised breakdown and the negotiation range.
- Quote preview, PDF download.
- Quotes and profile saved in the browser (no account).

## Future opportunities (not MVP)

- Saved rate card / media kit page per creator.
- Multiple currencies with conversion.
- Manager mode with several creator profiles.
- Deal tracking (sent, negotiating, won, lost) and rate history.
- Benchmarks updated from published industry data.

## Explicitly excluded from MVP

- Accounts, authentication, any backend or database.
- Connecting to social platforms or scraping statistics.
- Payments, invoicing, contracts or e-signatures.
- Paid APIs.

## Success criteria

- A first-time user produces a quote PDF in under 3 minutes.
- Every figure on the review screen can be traced to an input and a documented rate.
- No screen presents an estimate as a guaranteed market rate.
- Usable and polished at 375px and 1280px; passes WCAG 2.2 AA automated checks.
- Pricing engine covered by unit tests; main flow covered by one end-to-end test.

## Facts, assumptions, decisions

| Type | Item |
| --- | --- |
| Fact | View-based pricing (rate per 1,000 views) is a common method in published guides; per-follower rules are described as rough approximations. Sources in [[IMPLEMENTATION_PLAN#Pricing methodology]]. |
| Decision | Direction B "Terms" with the range from direction C (2026-11-15). |
| Decision | No backend, no auth; browser storage only. |
| Decision — 2026-11-15 | EUR default; 29 common currencies including AUD. Benchmarks are converted from euros with approximate static exchange rates (assumption: ignores local market differences). |
| Assumption — approved 2026-11-15 | English only for app and quote. |
| Assumption — approved 2026-11-15 | One creator profile, many saved quotes. |
| Assumption — approved 2026-11-15 | Starting rate values listed in [[IMPLEMENTATION_PLAN#Pricing methodology]]. |
