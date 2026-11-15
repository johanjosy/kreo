import type { Benchmarks } from '../../config/benchmarks.ts';
import { money, num } from '../format.ts';
import { DELIVERABLES, type Campaign, type CreatorProfile, type DeliverableKind, type LineItem, type PriceResult } from './types.ts';

export function engagementMultiplier(rate: number, b: Benchmarks): number {
  return (b.engagement.find((band) => rate < band.below) ?? b.engagement[b.engagement.length - 1]).multiplier;
}

export function label(kind: DeliverableKind, count: number, b: Benchmarks): string {
  return count === 1 ? b.formats[kind].label.one : b.formats[kind].label.other;
}

const round10 = (n: number) => Math.round(n / 10) * 10;

/**
 * Price a campaign. Every line total is rounded to whole currency units so the lines always add up to the target.
 */
export function price(profile: CreatorProfile, campaign: Campaign, b: Benchmarks): PriceResult {
  const cur = profile.currency;
  const nicheMult = b.niche[profile.niche] ?? 1;
  const lines: LineItem[] = [];
  const missingViews: DeliverableKind[] = [];

  for (const kind of DELIVERABLES) {
    const count = Math.max(0, Math.floor(campaign.deliverables[kind] ?? 0));
    if (!count) continue;
    const f = b.formats[kind];
    const stats = profile.platforms[f.platform];
    if (!stats || stats.avgViews <= 0) {
      missingViews.push(kind);
      continue;
    }
    const views = stats.avgViews * f.viewShare;
    const eng = engagementMultiplier(stats.engagementRate, b);
    const unit = Math.round((views / 1000) * f.ratePer1000 * eng * nicheMult);
    lines.push({
      kind,
      label: label(kind, count, b),
      count,
      unit,
      total: unit * count,
      explanation: `${num(Math.round(views))} expected views × ${money(f.ratePer1000, cur)} per 1,000 × ${eng} for engagement × ${nicheMult} for niche`,
    });
  }

  for (const extra of campaign.extras) {
    const p = Math.max(0, Math.round(extra.price));
    if (!p || !extra.label.trim()) continue;
    lines.push({ kind: 'extra', label: extra.label.trim(), count: 1, unit: p, total: p, explanation: 'Your price for this deliverable' });
  }

  const base = lines.reduce((s, l) => s + l.total, 0);
  const addOn = (kind: 'usage' | 'exclusivity' | 'revisions', label: string, rate: number, units: number, unitName: string) => {
    if (base <= 0 || units <= 0) return;
    const total = Math.round(base * rate * units);
    lines.push({ kind, label, count: units, unit: Math.round(base * rate), total, explanation: `${Math.round(rate * 100)}% of ${money(base, cur)} × ${units} ${unitName}` });
  };
  const usageMonths = Math.max(0, Math.floor(campaign.usageMonths));
  const exclMonths = Math.max(0, Math.floor(campaign.exclusivityMonths));
  const extraRounds = Math.max(0, Math.floor(campaign.revisionRounds) - b.includedRevisions);
  addOn('usage', 'Paid usage', b.usagePerMonth, usageMonths, usageMonths === 1 ? 'month' : 'months');
  addOn('exclusivity', 'Exclusivity', b.exclusivityPerMonth, exclMonths, exclMonths === 1 ? 'month' : 'months');
  addOn('revisions', 'Extra revisions', b.revisionRate, extraRounds, extraRounds === 1 ? 'extra round' : 'extra rounds');

  const target = lines.reduce((s, l) => s + l.total, 0);
  return { lines, base, target, floor: round10(target * b.floorRatio), anchor: round10(target * b.anchorRatio), missingViews };
}
