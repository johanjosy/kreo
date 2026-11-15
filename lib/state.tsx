'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { benchmarks } from '@/config/benchmarks';
import { price } from './pricing/engine';
import type { Campaign, CreatorProfile, DeliverableKind, Extra, Platform, PlatformStats, PriceResult } from './pricing/types';
import { load, save, type StoredState } from './storage';

const now = () => new Date().toISOString();
const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function newCampaign(): Campaign {
  const t = now();
  return { id: uid(), name: '', brand: '', deliverables: {}, extras: [], usageMonths: 0, exclusivityMonths: 0, revisionRounds: 1, createdAt: t, updatedAt: t };
}

const emptyProfile: CreatorProfile = { name: '', niche: 'lifestyle', currency: 'EUR', platforms: {} };

interface State extends StoredState {
  hydrated: boolean;
  loadFailed: boolean;
}

type Action =
  | { type: 'hydrate'; state: StoredState | null; failed: boolean }
  | { type: 'profile'; patch: Partial<Omit<CreatorProfile, 'platforms'>> }
  | { type: 'togglePlatform'; platform: Platform }
  | { type: 'stats'; platform: Platform; patch: Partial<PlatformStats> }
  | { type: 'campaign'; patch: Partial<Pick<Campaign, 'name' | 'brand' | 'usageMonths' | 'exclusivityMonths' | 'revisionRounds'>> }
  | { type: 'deliverable'; kind: DeliverableKind; count: number }
  | { type: 'addExtra' }
  | { type: 'extra'; id: string; patch: Partial<Omit<Extra, 'id'>> }
  | { type: 'removeExtra'; id: string }
  | { type: 'new' }
  | { type: 'select'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'restore'; campaign: Campaign; index: number };

function active(state: State): Campaign {
  return state.campaigns.find((c) => c.id === state.activeId) ?? state.campaigns[0];
}

function updateActive(state: State, fn: (c: Campaign) => Campaign): State {
  const current = active(state);
  return { ...state, campaigns: state.campaigns.map((c) => (c.id === current.id ? { ...fn(c), updatedAt: now() } : c)) };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate': {
      if (!action.state || action.state.campaigns.length === 0) {
        const c = newCampaign();
        return { ...state, ...(action.state ?? {}), campaigns: [c], activeId: c.id, hydrated: true, loadFailed: action.failed };
      }
      return { ...state, ...action.state, hydrated: true, loadFailed: action.failed };
    }
    case 'profile':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'togglePlatform': {
      const platforms = { ...state.profile.platforms };
      if (platforms[action.platform]) delete platforms[action.platform];
      else platforms[action.platform] = { followers: 0, avgViews: 0, engagementRate: 0 };
      return { ...state, profile: { ...state.profile, platforms } };
    }
    case 'stats': {
      const current = state.profile.platforms[action.platform];
      if (!current) return state;
      return { ...state, profile: { ...state.profile, platforms: { ...state.profile.platforms, [action.platform]: { ...current, ...action.patch } } } };
    }
    case 'campaign':
      return updateActive(state, (c) => ({ ...c, ...action.patch }));
    case 'deliverable':
      return updateActive(state, (c) => ({ ...c, deliverables: { ...c.deliverables, [action.kind]: action.count } }));
    case 'addExtra':
      return updateActive(state, (c) => ({ ...c, extras: [...c.extras, { id: uid(), label: '', price: 0 }] }));
    case 'extra':
      return updateActive(state, (c) => ({ ...c, extras: c.extras.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)) }));
    case 'removeExtra':
      return updateActive(state, (c) => ({ ...c, extras: c.extras.filter((e) => e.id !== action.id) }));
    case 'new': {
      const c = newCampaign();
      return { ...state, campaigns: [c, ...state.campaigns], activeId: c.id };
    }
    case 'select':
      return state.campaigns.some((c) => c.id === action.id) ? { ...state, activeId: action.id } : state;
    case 'remove': {
      const campaigns = state.campaigns.filter((c) => c.id !== action.id);
      if (campaigns.length === 0) {
        const c = newCampaign();
        return { ...state, campaigns: [c], activeId: c.id };
      }
      return { ...state, campaigns, activeId: state.activeId === action.id ? campaigns[0].id : state.activeId };
    }
    case 'restore': {
      const campaigns = [...state.campaigns];
      campaigns.splice(Math.min(action.index, campaigns.length), 0, action.campaign);
      return { ...state, campaigns };
    }
  }
}

interface Store {
  state: State;
  campaign: Campaign;
  result: PriceResult;
  dispatch: (a: Action) => void;
}

const StoreContext = createContext<Store | null>(null);

const browserStorage = () => (typeof window === 'undefined' ? undefined : window.localStorage);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const c = newCampaign();
    return { version: 1, profile: emptyProfile, campaigns: [c], activeId: c.id, hydrated: false, loadFailed: false } satisfies State;
  });

  useEffect(() => {
    const result = load(browserStorage());
    dispatch({ type: 'hydrate', state: result.status === 'ok' ? result.state : null, failed: result.status === 'invalid' });
  }, []);

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!state.hydrated) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save(browserStorage(), { version: 1, profile: state.profile, campaigns: state.campaigns, activeId: state.activeId });
    }, 300);
    return () => clearTimeout(timer.current);
  }, [state]);

  // Flush the pending debounced save when the tab is hidden or closed, so the last keystrokes aren't lost.
  const latest = useRef(state);
  latest.current = state;
  useEffect(() => {
    const flush = () => {
      const s = latest.current;
      if (s.hydrated) save(browserStorage(), { version: 1, profile: s.profile, campaigns: s.campaigns, activeId: s.activeId });
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, []);

  const campaign = active(state);
  const result = useMemo(() => price(state.profile, campaign, benchmarks), [state.profile, campaign]);
  const value = useMemo(() => ({ state, campaign, result, dispatch }), [state, campaign, result]);
  return <StoreContext value={value}>{children}</StoreContext>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

/** Price any saved campaign (used by the quotes list and quote page). */
export function priceOf(profile: CreatorProfile, c: Campaign) {
  return price(profile, c, benchmarks);
}
