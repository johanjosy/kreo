import { benchmarks } from '../config/benchmarks.ts';
import { label } from './pricing/engine.ts';
import { DELIVERABLES, type Campaign, type CreatorProfile, type PriceResult } from './pricing/types.ts';
import { money } from './format.ts';

export const QUOTE_VALID_DAYS = 14;

export interface QuoteContent {
  title: string;
  creator: string;
  brand: string;
  campaign: string;
  issued: string;
  validUntil: string;
  scope: string;
  rows: { item: string; amount: string }[];
  total: string;
  terms: string[];
  footer: string;
  fileName: string;
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const join = (parts: string[]) => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`);
const months = (n: number) => `${n} ${n === 1 ? 'month' : 'months'}`;

/** Everything the quote shows, shared by the on-screen preview and the PDF so they never disagree. The negotiation range is deliberately absent. */
export function quoteContent(profile: CreatorProfile, c: Campaign, r: PriceResult, today = new Date()): QuoteContent {
  const cur = profile.currency;
  const creator = profile.name.trim() || 'The creator';
  const brand = c.brand.trim() || 'the brand';
  const priced = new Set(r.lines.map((l) => l.kind));
  const items = [
    ...DELIVERABLES.filter((k) => priced.has(k)).map((k) => {
      const n = c.deliverables[k] ?? 0;
      return `${n} ${label(k, n, benchmarks)}`;
    }),
    ...c.extras.filter((e) => e.label.trim() && e.price > 0).map((e) => e.label.trim()),
  ];
  const valid = new Date(today);
  valid.setDate(valid.getDate() + QUOTE_VALID_DAYS);

  const terms = [
    c.usageMonths > 0 ? `Paid usage: ${brand} may run the content as paid ads for ${months(c.usageMonths)}.` : 'Paid usage: not included. Organic posting on my channels only.',
    c.exclusivityMonths > 0 ? `Exclusivity: I won’t work with competing brands for ${months(c.exclusivityMonths)}.` : 'Exclusivity: not included.',
    `Revisions: ${c.revisionRounds} ${c.revisionRounds === 1 ? 'round' : 'rounds'} included.`,
    `This quote is valid until ${dateFormat.format(valid)}.`,
  ];

  return {
    title: `Partnership proposal for ${c.brand.trim() || 'your brand'}`,
    creator,
    brand: c.brand.trim(),
    campaign: c.name.trim(),
    issued: dateFormat.format(today),
    validUntil: dateFormat.format(valid),
    scope: items.length ? `For this campaign I’ll create ${join(items)}.` : '',
    rows: r.lines.map((l) => ({ item: l.kind === 'usage' || l.kind === 'exclusivity' || l.kind === 'revisions' ? l.label : `${l.count} × ${l.label}`, amount: money(l.total, cur) })),
    total: money(r.target, cur),
    terms,
    footer: 'Prices are my proposed rates for the work described. Final terms are agreed in a separate contract.',
    fileName: `${[creator, c.brand, 'proposal'].filter(Boolean).join(' ').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'proposal'}.pdf`,
  };
}
