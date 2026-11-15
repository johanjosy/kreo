'use client';

import { Fragment, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { benchmarks } from '@/config/benchmarks';
import { label } from '@/lib/pricing/engine';
import { CURRENCIES, DELIVERABLES, PLATFORMS, type Currency, type DeliverableKind, type Niche, type Platform } from '@/lib/pricing/types';
import { CURRENCY_NAMES } from '@/lib/format';
import { useStore } from '@/lib/state';
import { ChoiceBlank, NumberBlank, TextBlank } from './blanks';

const PLATFORM_NAMES: Record<Platform, string> = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };
const VIEWS_NOUN: Record<Platform, string> = { instagram: 'Reels', tiktok: 'videos', youtube: 'videos' };
const NICHE_OPTIONS: { value: Niche; text: string }[] = [
  { value: 'beauty', text: 'beauty and skincare' },
  { value: 'lifestyle', text: 'lifestyle' },
  { value: 'fashion', text: 'fashion' },
  { value: 'fitness', text: 'fitness' },
  { value: 'food', text: 'food' },
  { value: 'travel', text: 'travel' },
  { value: 'gaming', text: 'gaming' },
  { value: 'tech', text: 'tech' },
  { value: 'finance', text: 'finance' },
  { value: 'education', text: 'education' },
  { value: 'other', text: 'other' },
];
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, text: CURRENCY_NAMES[c] }));

/** Join clauses as "a, b and c". */
function joinClauses(parts: ReactNode[]): ReactNode {
  return parts.map((p, i) => (
    <Fragment key={i}>
      {i > 0 && (i === parts.length - 1 ? ' and ' : ', ')}
      {p}
    </Fragment>
  ));
}

function Help({ children }: { children: ReactNode }) {
  return <span className="mb-8 mt-[-0.5em] block max-w-[56ch] font-ui text-ui leading-normal text-quiet">{children}</span>;
}

export function TermsDocument() {
  const { state, campaign, dispatch } = useStore();
  const { profile } = state;
  const enabled = PLATFORMS.filter((p) => profile.platforms[p]);
  const kinds = DELIVERABLES.filter((k) => enabled.includes(benchmarks.formats[k].platform));
  const brand = campaign.brand.trim() || 'The brand';

  return (
    <form id="main" className="font-doc text-[22px] leading-[1.75] sm:text-[27px]" onSubmit={(e) => e.preventDefault()} aria-label="Your terms">
      <h1 className="sr-only">Your terms for this brand deal</h1>

      <p className="mb-6">
        I’m <TextBlank value={profile.name} onChange={(name) => dispatch({ type: 'profile', patch: { name } })} label="Your name" placeholder="your name" />, and I make{' '}
        <ChoiceBlank value={profile.niche} options={NICHE_OPTIONS} onChange={(niche) => dispatch({ type: 'profile', patch: { niche } })} label="Content niche" /> content. I price in{' '}
        <ChoiceBlank<Currency> value={profile.currency} options={CURRENCY_OPTIONS} onChange={(currency) => dispatch({ type: 'profile', patch: { currency } })} label="Currency" />.
      </p>

      <p className="mb-6">
        I post on{' '}
        {joinClauses(
          PLATFORMS.map((p) => {
            const on = !!profile.platforms[p];
            return (
              <button
                key={p}
                type="button"
                aria-pressed={on}
                onClick={() => dispatch({ type: 'togglePlatform', platform: p })}
                className={on ? 'border-b-[1.5px] border-ink bg-[linear-gradient(transparent_58%,var(--mark)_58%)] px-0.5' : 'border-b-[1.5px] border-dashed border-quiet px-0.5 text-quiet hover:text-ink'}
              >
                {PLATFORM_NAMES[p]}
              </button>
            );
          }),
        )}
        .
      </p>
      {enabled.length === 0 ? (
        <Help>Tap the platforms you post on. Each one adds its own line for your numbers.</Help>
      ) : (
        <>
          {enabled.map((p) => {
            const s = profile.platforms[p]!;
            const set = (patch: Partial<typeof s>) => dispatch({ type: 'stats', platform: p, patch });
            return (
              <p key={p} className="mb-6">
                On {PLATFORM_NAMES[p]} I have <NumberBlank value={s.followers} onChange={(followers) => set({ followers })} label={`${PLATFORM_NAMES[p]} followers`} max={500_000_000} minCh={5} /> followers. My {VIEWS_NOUN[p]} average{' '}
                <NumberBlank value={s.avgViews} onChange={(avgViews) => set({ avgViews })} label={`${PLATFORM_NAMES[p]} average views`} max={500_000_000} minCh={5} /> views, and{' '}
                <NumberBlank value={s.engagementRate} onChange={(engagementRate) => set({ engagementRate })} label={`${PLATFORM_NAMES[p]} engagement rate, percent`} max={100} decimals minCh={3} />% of viewers engage.
              </p>
            );
          })}
          <Help>Use your average over your last 10 posts. Your rate is worked out from views; followers are for context.</Help>
        </>
      )}

      <p className="mb-6">
        This quote is for <TextBlank value={campaign.brand} onChange={(brand) => dispatch({ type: 'campaign', patch: { brand } })} label="Brand name" placeholder="the brand" />’s{' '}
        <TextBlank value={campaign.name} onChange={(name) => dispatch({ type: 'campaign', patch: { name } })} label="Campaign name" placeholder="campaign name" /> campaign.
      </p>

      {kinds.length > 0 && (
        <p className="mb-6">
          I’ll make{' '}
          {joinClauses(
            kinds.map((k: DeliverableKind) => {
              const n = campaign.deliverables[k] ?? 0;
              return (
                <Fragment key={k}>
                  <NumberBlank value={n} onChange={(count) => dispatch({ type: 'deliverable', kind: k, count })} label={benchmarks.formats[k].label.other} max={99} /> {label(k, n, benchmarks)}
                </Fragment>
              );
            }),
          )}
          , with <NumberBlank value={campaign.revisionRounds} onChange={(revisionRounds) => dispatch({ type: 'campaign', patch: { revisionRounds } })} label="Revision rounds" min={1} max={10} placeholder="1" />{' '}
          {campaign.revisionRounds === 1 ? 'round' : 'rounds'} of revisions.
        </p>
      )}

      {campaign.extras.length > 0 && (
        <div className="mb-6">
          <p>I’m also including:</p>
          <ul>
            {campaign.extras.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-2">
                <TextBlank value={e.label} onChange={(l) => dispatch({ type: 'extra', id: e.id, patch: { label: l } })} label="Extra deliverable" placeholder="what it is" minCh={10} />
                <span>for</span>
                <NumberBlank value={e.price} onChange={(price) => dispatch({ type: 'extra', id: e.id, patch: { price } })} label={`Price for ${e.label || 'extra deliverable'}`} max={10_000_000} minCh={4} />
                <button type="button" onClick={() => dispatch({ type: 'removeExtra', id: e.id })} aria-label={`Remove ${e.label || 'extra deliverable'}`} className="grid size-11 place-items-center self-center text-quiet hover:text-ink">
                  <X size={18} strokeWidth={1.5} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" onClick={() => dispatch({ type: 'addExtra' })} className="mb-8 min-h-11 font-ui text-ui-lg text-ink underline underline-offset-4 hover:text-note">
        Add another deliverable
      </button>

      <p className="mb-6">
        {brand} can run my content as paid ads for{' '}
        <NumberBlank value={campaign.usageMonths} onChange={(usageMonths) => dispatch({ type: 'campaign', patch: { usageMonths } })} label="Paid usage, months" max={36} /> {campaign.usageMonths === 1 ? 'month' : 'months'}, and I won’t work with competing brands for{' '}
        <NumberBlank value={campaign.exclusivityMonths} onChange={(exclusivityMonths) => dispatch({ type: 'campaign', patch: { exclusivityMonths } })} label="Exclusivity, months" max={36} />{' '}
        {campaign.exclusivityMonths === 1 ? 'month' : 'months'}.
      </p>
      <Help>Paid usage means the brand puts ad spend behind your content. Exclusivity stops you working with their competitors. Both cost you future income, so both are priced.</Help>
    </form>
  );
}
