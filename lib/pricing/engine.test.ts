import { test } from 'node:test';
import assert from 'node:assert/strict';
import { benchmarks as b } from '../../config/benchmarks.ts';
import { engagementMultiplier, price } from './engine.ts';
import type { Campaign, CreatorProfile } from './types.ts';

const maya: CreatorProfile = {
  name: 'Maya Okafor',
  niche: 'beauty',
  currency: 'EUR',
  platforms: {
    tiktok: { followers: 48000, avgViews: 31000, engagementRate: 6.2 },
    instagram: { followers: 22000, avgViews: 24000, engagementRate: 4.1 },
  },
};

const campaign = (over: Partial<Campaign> = {}): Campaign => ({
  id: 'c1', name: 'Spring launch', brand: 'Fieldnote Skincare',
  deliverables: { tiktokVideo: 2, igReel: 1, igStory: 3 }, extras: [],
  usageMonths: 1, exclusivityMonths: 1, revisionRounds: 1,
  createdAt: '', updatedAt: '', ...over,
});

test('prices a deliverable from views, rate, engagement and niche', () => {
  const r = price(maya, campaign({ deliverables: { tiktokVideo: 1 }, usageMonths: 0, exclusivityMonths: 0 }), b);
  // 31,000 / 1,000 × 20 × 1.2 (≥6% engagement) × 1.1 (beauty) = 818.4
  assert.equal(r.lines[0].unit, 818);
  assert.equal(r.target, 818);
});

test('lines always add up to the target', () => {
  const r = price(maya, campaign({ revisionRounds: 3, extras: [{ id: 'e', label: 'Behind-the-scenes photo', price: 150 }] }), b);
  assert.equal(r.lines.reduce((s, l) => s + l.total, 0), r.target);
});

test('usage and exclusivity scale with months and apply to the base', () => {
  const one = price(maya, campaign({ exclusivityMonths: 0 }), b);
  const three = price(maya, campaign({ usageMonths: 3, exclusivityMonths: 0 }), b);
  const usage = (r: typeof one) => r.lines.find((l) => l.kind === 'usage')!.total;
  assert.equal(usage(one), Math.round(one.base * 0.15));
  assert.equal(usage(three), Math.round(three.base * 0.15 * 3));
});

test('first revision round is included', () => {
  assert.equal(price(maya, campaign({ revisionRounds: 1 }), b).lines.some((l) => l.kind === 'revisions'), false);
  assert.equal(price(maya, campaign({ revisionRounds: 2 }), b).lines.some((l) => l.kind === 'revisions'), true);
});

test('range is ordered walk-away < target < ask', () => {
  const r = price(maya, campaign(), b);
  assert.ok(r.floor < r.target && r.target < r.anchor);
});

test('deliverables on a platform without views are flagged, never invented', () => {
  const r = price(maya, campaign({ deliverables: { youtubeVideo: 1, tiktokVideo: 1 } }), b);
  assert.deepEqual(r.missingViews, ['youtubeVideo']);
  assert.ok(r.lines.every((l) => l.kind !== 'youtubeVideo'));
});

test('empty campaign prices to zero without add-ons', () => {
  const r = price(maya, campaign({ deliverables: {} }), b);
  assert.equal(r.target, 0);
  assert.equal(r.lines.length, 0);
});

test('negative and fractional inputs are clamped', () => {
  const r = price(maya, campaign({ deliverables: { tiktokVideo: -2, igReel: 1.7 }, usageMonths: -1, exclusivityMonths: 0 }), b);
  assert.deepEqual(r.lines.map((l) => [l.kind, l.count]), [['igReel', 1]]);
});

test('extras without a label or price are ignored', () => {
  const r = price(maya, campaign({ deliverables: {}, usageMonths: 0, exclusivityMonths: 0, extras: [{ id: 'a', label: '', price: 100 }, { id: 'b', label: 'Raw footage', price: 0 }, { id: 'c', label: 'Raw footage', price: 200 }] }), b);
  assert.equal(r.target, 200);
});

test('engagement bands', () => {
  assert.equal(engagementMultiplier(1.5, b), 0.85);
  assert.equal(engagementMultiplier(2, b), 1);
  assert.equal(engagementMultiplier(5.9, b), 1.1);
  assert.equal(engagementMultiplier(40, b), 1.2);
});

test('benchmarks convert into the creator\'s currency', () => {
  const c = campaign({ deliverables: { tiktokVideo: 1 }, usageMonths: 0, exclusivityMonths: 0 });
  const aud = price({ ...maya, currency: 'AUD' }, c, b);
  const jpy = price({ ...maya, currency: 'JPY' }, c, b);
  // 31 × €20 × 1.65 AUD/EUR × 1.2 × 1.1 = 1,350.36
  assert.equal(aud.target, 1350);
  assert.match(aud.lines[0].explanation, /A\$33 per 1,000/);
  assert.ok(jpy.target > 100_000, 'yen rates must not stay at euro face value');
});

test('extras are taken at face value in any currency', () => {
  const r = price({ ...maya, currency: 'AUD' }, campaign({ deliverables: {}, usageMonths: 0, exclusivityMonths: 0, extras: [{ id: 'e', label: 'Raw footage', price: 300 }] }), b);
  assert.equal(r.target, 300);
});

test('creator rate overrides replace the starting rates', async () => {
  const { withOverrides, hasOverrides } = await import('./rates.ts');
  const c = campaign({ deliverables: { tiktokVideo: 1 }, usageMonths: 1, exclusivityMonths: 0 });
  const mine = withOverrides(b, { ratePer1000: { tiktokVideo: 30 }, usagePerMonth: 0.25, floorRatio: 0.9 });
  const r = price(maya, c, mine);
  // 31 × €30 × 1.2 × 1.1 = 1,227.6 → 1,228; usage 25% → 307
  assert.equal(r.lines[0].unit, 1228);
  assert.equal(r.lines.find((l) => l.kind === 'usage')!.total, 307);
  assert.equal(r.floor, Math.round((r.target * 0.9) / 10) * 10);
  assert.equal(b.formats.tiktokVideo.ratePer1000, 20, 'starting benchmarks are not mutated');
  assert.equal(hasOverrides({}), false);
  assert.equal(hasOverrides({ ratePer1000: {} }), false);
  assert.equal(hasOverrides({ anchorRatio: 1.3 }), true);
});
