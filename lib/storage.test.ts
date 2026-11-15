import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BACKUP_KEY, STORAGE_KEY, load, parseStored, save, type StoredState } from './storage.ts';

const valid: StoredState = {
  version: 1,
  activeId: 'c1',
  profile: { name: 'Maya', niche: 'beauty', currency: 'EUR', platforms: { tiktok: { followers: 1, avgViews: 2, engagementRate: 3 } } },
  campaigns: [{ id: 'c1', name: '', brand: '', deliverables: { tiktokVideo: 1 }, extras: [], usageMonths: 0, exclusivityMonths: 0, revisionRounds: 1, createdAt: 'x', updatedAt: 'x' }],
};

function memory(initial: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(initial));
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), clear: () => m.clear(), key: () => null, get length() { return m.size; } };
}

test('round-trips valid state', () => {
  const s = memory();
  assert.equal(save(s, valid), true);
  assert.deepEqual(load(s), { status: 'ok', state: valid });
});

test('missing data is empty, not an error', () => {
  assert.deepEqual(parseStored(null), { status: 'empty' });
});

test('corrupt JSON and wrong shapes are invalid and backed up', () => {
  for (const raw of ['{not json', JSON.stringify({ version: 2 }), JSON.stringify({ ...valid, profile: { ...valid.profile, niche: 'crypto' } })]) {
    const s = memory({ [STORAGE_KEY]: raw });
    assert.deepEqual(load(s), { status: 'invalid' });
    assert.equal(s.getItem(BACKUP_KEY), raw);
  }
});

test('rejects negative counts and absurd engagement', () => {
  const bad = structuredClone(valid);
  bad.campaigns[0].deliverables.tiktokVideo = -1;
  assert.equal(parseStored(JSON.stringify(bad)).status, 'invalid');
  const bad2 = structuredClone(valid);
  bad2.profile.platforms.tiktok!.engagementRate = 400;
  assert.equal(parseStored(JSON.stringify(bad2)).status, 'invalid');
});

test('storage that throws (private mode) does not crash', () => {
  const throwing = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } } as unknown as Storage;
  assert.deepEqual(load(throwing), { status: 'empty' });
  assert.equal(save(throwing, valid), false);
});

test('accepts newly added currencies such as AUD', () => {
  const aud = { ...valid, profile: { ...valid.profile, currency: 'AUD' } };
  assert.equal(parseStored(JSON.stringify(aud)).status, 'ok');
});

test('saved rate overrides round-trip and are validated', () => {
  const withRates = { ...valid, rates: { ratePer1000: { tiktokVideo: 25 }, usagePerMonth: 0.2, anchorRatio: 1.3 } };
  assert.deepEqual(parseStored(JSON.stringify(withRates)), { status: 'ok', state: withRates });
  assert.equal(parseStored(JSON.stringify({ ...valid, rates: { floorRatio: 1.5 } })).status, 'invalid');
  assert.equal(parseStored(JSON.stringify({ ...valid, rates: { ratePer1000: { tiktokVideo: -1 } } })).status, 'invalid');
});
