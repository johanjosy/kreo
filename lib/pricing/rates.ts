import type { Benchmarks } from '../../config/benchmarks.ts';
import { DELIVERABLES, type DeliverableKind } from './types.ts';

/**
 * The creator's own changes to KREO's starting rates. Rates per 1,000 views are stored in euros
 * (like the benchmarks) so they keep their meaning when the creator switches currency.
 */
export interface RateOverrides {
  ratePer1000?: Partial<Record<DeliverableKind, number>>;
  usagePerMonth?: number;
  exclusivityPerMonth?: number;
  revisionRate?: number;
  floorRatio?: number;
  anchorRatio?: number;
}

export type ScalarRate = Exclude<keyof RateOverrides, 'ratePer1000'>;

/** Benchmarks with the creator's overrides applied. */
export function withOverrides(b: Benchmarks, o: RateOverrides | undefined): Benchmarks {
  if (!o) return b;
  const formats = { ...b.formats };
  for (const k of DELIVERABLES) {
    const v = o.ratePer1000?.[k];
    if (v != null) formats[k] = { ...formats[k], ratePer1000: v };
  }
  return {
    ...b,
    formats,
    usagePerMonth: o.usagePerMonth ?? b.usagePerMonth,
    exclusivityPerMonth: o.exclusivityPerMonth ?? b.exclusivityPerMonth,
    revisionRate: o.revisionRate ?? b.revisionRate,
    floorRatio: o.floorRatio ?? b.floorRatio,
    anchorRatio: o.anchorRatio ?? b.anchorRatio,
  };
}

export function hasOverrides(o: RateOverrides | undefined): boolean {
  if (!o) return false;
  const { ratePer1000, ...rest } = o;
  return Object.values(rest).some((v) => v != null) || Object.values(ratePer1000 ?? {}).some((v) => v != null);
}
