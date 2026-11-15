export const PLATFORMS = ['instagram', 'tiktok', 'youtube'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const NICHES = ['beauty', 'lifestyle', 'fashion', 'fitness', 'food', 'travel', 'gaming', 'tech', 'finance', 'education', 'other'] as const;
export type Niche = (typeof NICHES)[number];

export const DELIVERABLES = ['tiktokVideo', 'igReel', 'igStory', 'igPost', 'youtubeVideo'] as const;
export type DeliverableKind = (typeof DELIVERABLES)[number];

export const CURRENCIES = ['EUR', 'GBP', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface PlatformStats {
  followers: number;
  avgViews: number;
  /** Percent, e.g. 6.2 */
  engagementRate: number;
}

export interface CreatorProfile {
  name: string;
  niche: Niche;
  platforms: Partial<Record<Platform, PlatformStats>>;
  currency: Currency;
}

export interface Extra {
  id: string;
  label: string;
  price: number;
}

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  deliverables: Partial<Record<DeliverableKind, number>>;
  extras: Extra[];
  usageMonths: number;
  exclusivityMonths: number;
  revisionRounds: number;
  createdAt: string;
  updatedAt: string;
}

export type LineKind = DeliverableKind | 'extra' | 'usage' | 'exclusivity' | 'revisions';

export interface LineItem {
  kind: LineKind;
  label: string;
  count: number;
  unit: number;
  total: number;
  explanation: string;
}

export interface PriceResult {
  lines: LineItem[];
  base: number;
  target: number;
  floor: number;
  anchor: number;
  /** Deliverables that were requested but can't be priced because the platform has no average views. */
  missingViews: DeliverableKind[];
}
