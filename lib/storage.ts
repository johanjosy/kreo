import { z } from 'zod';
import { CURRENCIES, DELIVERABLES, NICHES, PLATFORMS, type Campaign, type CreatorProfile } from './pricing/types.ts';

export const STORAGE_KEY = 'kreo:v1';
export const BACKUP_KEY = 'kreo:v1:backup';

const count = z.number().finite().min(0).max(999);
const stats = z.object({ followers: z.number().finite().min(0), avgViews: z.number().finite().min(0), engagementRate: z.number().finite().min(0).max(100) });

const profileSchema = z.object({
  name: z.string().max(120),
  niche: z.enum(NICHES),
  currency: z.enum(CURRENCIES),
  platforms: z.partialRecord(z.enum(PLATFORMS), stats),
});

const campaignSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(120),
  brand: z.string().max(120),
  deliverables: z.partialRecord(z.enum(DELIVERABLES), count),
  extras: z.array(z.object({ id: z.string().min(1), label: z.string().max(120), price: z.number().finite().min(0) })).max(20),
  usageMonths: count,
  exclusivityMonths: count,
  revisionRounds: count,
  createdAt: z.string(),
  updatedAt: z.string(),
});

const stateSchema = z.object({
  version: z.literal(1),
  profile: profileSchema,
  campaigns: z.array(campaignSchema).max(500),
  activeId: z.string().nullable(),
});

export interface StoredState {
  version: 1;
  profile: CreatorProfile;
  campaigns: Campaign[];
  activeId: string | null;
}

export type LoadResult = { status: 'empty' } | { status: 'ok'; state: StoredState } | { status: 'invalid' };

/** Parse stored JSON. Anything from storage is untrusted: it is validated before use. */
export function parseStored(raw: string | null): LoadResult {
  if (raw == null) return { status: 'empty' };
  try {
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? { status: 'ok', state: parsed.data as StoredState } : { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}

/** Read saved state. Unreadable data is copied to a backup key instead of being silently discarded. */
export function load(storage: Storage | undefined): LoadResult {
  if (!storage) return { status: 'empty' };
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const result = parseStored(raw);
    if (result.status === 'invalid' && raw != null) storage.setItem(BACKUP_KEY, raw);
    return result;
  } catch {
    return { status: 'empty' };
  }
}

export function save(storage: Storage | undefined, state: StoredState): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
