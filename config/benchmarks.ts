import type { DeliverableKind, Niche, Platform } from '../lib/pricing/types.ts';

/**
 * Every rate KREO uses. All values are editable starting points, not market facts.
 * `basis` says whether a value is sourced or an assumption; sources are listed in IMPLEMENTATION_PLAN.md.
 */

export interface FormatBenchmark {
  platform: Platform;
  /** Singular and plural labels used in sentences, line items and the quote. */
  label: { one: string; other: string };
  /** Euros per 1,000 expected views; converted to the creator's currency with config/currencies.ts. */
  ratePer1000: number;
  /** Expected views for this format as a share of the platform's average views. */
  viewShare: number;
}

export interface Benchmarks {
  formats: Record<DeliverableKind, FormatBenchmark>;
  /** Engagement bands: the first band whose `below` exceeds the rate applies. */
  engagement: { below: number; multiplier: number }[];
  niche: Record<Niche, number>;
  usagePerMonth: number;
  exclusivityPerMonth: number;
  revisionRate: number;
  includedRevisions: number;
  floorRatio: number;
  anchorRatio: number;
}

export const benchmarks: Benchmarks = {
  formats: {
    // Assumption: inside the 10–30 per 1,000 views lifestyle range cited by Stan (2026).
    tiktokVideo: { platform: 'tiktok', label: { one: 'TikTok video', other: 'TikTok videos' }, ratePer1000: 20, viewShare: 1 },
    igReel: { platform: 'instagram', label: { one: 'Instagram Reel', other: 'Instagram Reels' }, ratePer1000: 22, viewShare: 1 },
    // Assumption: Story frames reach roughly a third of Reel viewers; static posts about half.
    igStory: { platform: 'instagram', label: { one: 'Story frame', other: 'Story frames' }, ratePer1000: 10, viewShare: 0.3 },
    igPost: { platform: 'instagram', label: { one: 'static post', other: 'static posts' }, ratePer1000: 15, viewShare: 0.5 },
    youtubeVideo: { platform: 'youtube', label: { one: 'YouTube video', other: 'YouTube videos' }, ratePer1000: 30, viewShare: 1 },
  },
  // Assumption: engagement as a pricing signal is described by Stan (2026); the bands are KREO's.
  engagement: [
    { below: 2, multiplier: 0.85 },
    { below: 4, multiplier: 1 },
    { below: 6, multiplier: 1.1 },
    { below: Infinity, multiplier: 1.2 },
  ],
  // Assumption: higher-value niches (finance, tech) cited at 30–80 per 1,000 views by Stan (2026).
  niche: { beauty: 1.1, lifestyle: 1, fashion: 1.05, fitness: 1, food: 1, travel: 1.05, gaming: 0.9, tech: 1.4, finance: 1.5, education: 1.2, other: 1 },
  // Assumption: within +20–50% for 30–90 days (Stan); per-month formula from Sup's usage rights calculator.
  usagePerMonth: 0.15,
  exclusivityPerMonth: 0.1,
  // Assumption: revisions as a separate cost (Stan); first round included.
  revisionRate: 0.1,
  includedRevisions: 1,
  // Assumption: negotiation convention, not a market fact.
  floorRatio: 0.8,
  anchorRatio: 1.25,
};
