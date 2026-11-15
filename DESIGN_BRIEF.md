# KREO — Design Brief

Status: direction approved 2026-11-15 (B "Terms" + C's range) · Tokens final pending build review
Related: [[PROJECT_BRIEF]] · [[IMPLEMENTATION_PLAN]] · [[CHANGELOG]]
Prototypes: `explorations/b-terms.html` (chosen), `explorations/c-spread.html` (range source), `explorations/a-instrument.html` (rejected)

KREO's identity is independent of the portfolio project: no shared colours, typefaces, components, layouts or motion decisions.

## Concept: state your terms

The creator writes their deal as a sentence, the way they would explain it to a friend:

> I'm Maya Okafor, and I make skincare videos. My videos reach about 31,000 people, and 6.2% of them engage. For Fieldnote Skincare I'll make 2 TikTok videos…

The highlighted blanks are the inputs. Beside the sentence, a margin note works out the rate in real time, like an editor marking up a contract. The quote PDF is the same document, finished.

### Why this fits

- **Brand credibility.** The thing a brand receives is a document. Making the whole app that document means the quote and the product look the same, and both look like business paperwork, not an app screenshot.
- **Creator clarity.** Creators think about deals in sentences ("two TikToks and some stories"), not in form fields. The sentence also teaches what each input means in context.
- **Transparency.** The margin shows every line of the price next to the words that caused it.
- **Distinctiveness.** It is not a dashboard, so it cannot be mistaken for one.

### What we took from direction C

Negotiation happens in ranges. The margin shows three numbers on a ruler: **walk-away**, **target** and **opening ask**. This is a product feature, not decoration.

### References and what we learned

| Reference | What works | What KREO takes |
| --- | --- | --- |
| An editor's marked-up contract | Margin notes sit beside the text they explain | Live price in the margin, aligned to the document |
| Stripe quotes and invoices | Business documents with calm hierarchy and exact figures | Quote PDF layout, line-item rows, figure alignment |
| Typeform conversational forms | One idea at a time, in natural language | Sentence-based inputs |
| FT and The Pudding data graphics | One chart answering one question | The range ruler, nothing more |
| Linear | Restraint, keyboard flow, one accent | Single accent colour, no decorative surfaces |

Referenced for reasoning, not copied.

## Colour

Colour comes from the material of the concept: paper, ink, a highlighter, and the green of banknotes and signed agreements. No gradients, no tints used as decoration.

### Light (default)

| Token | Hex | Role | Contrast on paper |
| --- | --- | --- | --- |
| `paper` | `#FFFFFF` | Page and document | — |
| `ink` | `#14231D` | Body text, blank underlines | 16.3:1 |
| `quiet` | `#55625C` | Helper text, labels, walk-away marker | 6.4:1 |
| `note` | `#0E5A43` | Margin note, primary button, target marker | 8.2:1 |
| `mark` | `#EEF5A2` | Highlight behind blanks only | ink on mark 14.2:1 |
| `ask` | `#9C4508` | Opening-ask marker | 6.4:1 |
| `rule` | `#D9DFDB` | Dividers between line items | decorative |
| `estimate-bg` / `estimate-fg` | `#FFF6DB` / `#7A4F00` | "Estimate, not a guaranteed rate" notices | 6.6:1 |
| `error` | `#B42318` | Validation messages | 6.6:1 |

### Dark

Designed together with light, not inverted.

| Token | Hex | Contrast on paper |
| --- | --- | --- |
| `paper` | `#0F1A16` | — |
| `ink` | `#E8EFEA` | 15.2:1 |
| `quiet` | `#9DAAA3` | 7.4:1 |
| `note` | `#6FCBA5` (button text `#0F1A16`) | 9.1:1 |
| `mark` | `#3A4214` | ink on mark 9.1:1 |
| `ask` | `#E8945A` | 7.5:1 |
| `rule` | `#3A4A43` | decorative |
| `estimate-fg` | `#F2C46D` | 10.9:1 |
| `error` | `#F97066` | 6.4:1 |

Theme follows the system setting, with a manual toggle remembered in browser storage. The PDF is always light.

## Typography

Two families, clearly distinct in role.

| Role | Typeface | Why |
| --- | --- | --- |
| Document (the sentence, totals, quote) | **Newsreader** (variable, optical sizing) | A text serif designed for reading on screen; optical sizing keeps large totals elegant and small text sturdy; lining figures for money |
| Interface (labels, buttons, helper text, line items) | **Hanken Grotesk** | Quiet, open grotesque that stays out of the document's way |

Both free on Google Fonts, loaded with `next/font` (self-hosted, no layout shift).

### Scale (ratio 1.25)

| Token | Size / line height | Use |
| --- | --- | --- |
| `ui-sm` | 13 / 1.5 | Caveats, captions |
| `ui` | 15 / 1.5 | Line items, labels |
| `ui-lg` | 16 / 1.5 | Buttons, helper text |
| `doc` | 22 / 1.75 mobile, 27 / 1.75 desktop | The sentence |
| `total` | 34 mobile, 56 desktop / 1.05 | Running total |
| `title` | 40 / 1.1 | Quote title |

Rules: sentence case everywhere; no all-caps labels; no monospace; money in Newsreader lining tabular figures; document line length under 70 characters.

## Spacing and layout

- 4px base. Steps: 4, 8, 12, 16, 24, 32, 48, 72.
- **Desktop (≥ 880px):** document column (max 640px) left-aligned, margin note column beside it, 72px gutter. Margin note is sticky.
- **Mobile (< 880px):** one column. The total and the main action sit in a bar fixed to the bottom; tapping the total opens the full breakdown in a bottom sheet.
- Left-aligned text throughout. No card grids. Structure comes from the document, rules and the margin.

```
Desktop
┌───────────────────────────────────────────────────────────┐
│ KREO                                   Quotes   Theme     │
│                                                           │
│ I'm [Maya Okafor], and I make     │ Your rate             │
│ [skincare] videos. My videos      │ €3,410                │
│ reach about [31,000] people…      │ ├──────■────┤ ruler   │
│                                   │ 2 × TikTok    €1,640  │
│ For [Fieldnote] I'll make [2]     │ Paid usage      €410  │
│ TikTok videos…                    │ [Turn into a quote]   │
└───────────────────────────────────────────────────────────┘

Mobile
┌─────────────────────┐
│ KREO                │
│ I'm [Maya Okafor],  │
│ and I make …        │
│                     │
├─────────────────────┤
│ €3,410  [Quote]     │  ← fixed bar, tap total for sheet
└─────────────────────┘
```

## Components

| Component | Spec |
| --- | --- |
| **Blank** (inline input) | Inherits document type. Ink underline 1.5px, `mark` highlight on the lower 42% of the line; full `mark` background on focus. Sizes to its content. Numbers format with thousands separators on blur. Each has an accessible label. Errors appear in `error` beneath the sentence, linked with `aria-describedby`. |
| **Choice blank** | Same look as a blank; opens a native select (desktop) or bottom sheet (mobile) for niche and platform choices. |
| **Platform toggle** | "I post on [Instagram] [TikTok] [YouTube]": toggles inside the sentence; deselected platforms remove their sentence clauses. |
| **Margin note** | 1.5px `note` rule on the left, total, range ruler, line items, primary action, estimate caveat. |
| **Range ruler** | Horizontal line with ticks; three markers (walk-away `quiet`, target `note`, ask `ask`), each labelled with text so colour is never the only signal. |
| **Line item** | Label left in `quiet`, amount right in `ink`; `rule` divider; an expand control reveals the calculation ("31,000 views × €20 per 1,000 × 1.2 engagement × 1.1 niche"). |
| **Primary button** | `note` fill, white text, 48px tall, 2px radius, one per screen. |
| **Secondary action** | Text button with underline in `ink`. |
| **Estimate notice** | `estimate-bg` / `estimate-fg`, 13px, always beside a total. |
| **Bottom sheet** (mobile) | Slides from the bottom, scrim, drag handle plus close button, focus trapped. |

Corners: 2px on buttons and sheets, 0 elsewhere. No shadows except the bottom sheet. Icons: Lucide, 1.5px stroke, 18px, only where they add meaning (close, expand, download).

## Navigation

Top bar only: wordmark, "Quotes", theme toggle. Three routes: the terms document, a quote preview, the saved quotes list. No sidebar, no tabs.

## Motion

Motion only answers the user's input.

| Moment | Motion | Timing |
| --- | --- | --- |
| Total changes | Figures count to the new value | 240ms ease-out `cubic-bezier(.2,.8,.2,1)` |
| Range markers move | Slide along the ruler | 240ms, same curve, interruptible |
| Blank focus | Highlight fills from the underline up | 120ms |
| Line item expand | Height reveal with fade | 200ms in / 140ms out |
| Bottom sheet | Slides from the bottom | 280ms in / 180ms out |
| Clause added/removed (platform toggle) | Fade and reflow | 200ms |

No page-load animation, no scroll effects. `prefers-reduced-motion`: values change instantly. Implemented with `motion`.

## Quote document (PDF)

A4, light only. Newsreader title ("Partnership proposal: Fieldnote Skincare × Maya Okafor"), creator and brand details, the deliverables in sentence form, itemised table, total, terms (usage, exclusivity, revisions, validity 14 days), and a footer stating that rates are the creator's proposal. The negotiation range is never printed: it is private to the creator.

## Voice

Plain, direct, first person in the document ("I'll make…"), second person in the interface ("Your rate"). Buttons say what happens ("Turn into a quote", "Download PDF"). Estimates are always called estimates.

## Avoid

Gradients, glass effects, card grids, decorative illustrations, emoji, all-caps labels, monospace labels, middle-dot meta strings, arrows appended to button text, cream backgrounds, terracotta accents, more than one primary button per screen.
