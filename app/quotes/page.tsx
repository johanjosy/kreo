'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { money } from '@/lib/format';
import type { Campaign } from '@/lib/pricing/types';
import { priceOf, useStore } from '@/lib/state';

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function QuotesPage() {
  const { state, rates, dispatch } = useStore();
  const router = useRouter();
  const [removed, setRemoved] = useState<{ campaign: Campaign; index: number } | null>(null);
  if (!state.hydrated) return <main id="main" className="min-h-dvh" />;

  const open = (id: string) => {
    dispatch({ type: 'select', id });
    router.push('/');
  };
  const start = () => {
    dispatch({ type: 'new' });
    router.push('/');
  };
  const remove = (c: Campaign, index: number) => {
    dispatch({ type: 'remove', id: c.id });
    setRemoved({ campaign: c, index });
  };

  return (
    <main id="main" className="mx-auto max-w-[1120px] px-4 pb-24 pt-8 sm:px-6 min-[880px]:pt-14">
      <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-doc text-[34px] leading-tight sm:text-[40px]">Your quotes</h1>
        <button type="button" onClick={start} className="inline-flex h-12 items-center rounded-[2px] bg-note px-5 font-ui text-ui-lg font-semibold text-on-note hover:opacity-90">
          Start a new quote
        </button>
      </div>

      <p role="status" className="mb-4 font-ui text-ui empty:hidden">
        {removed && (
          <>
            Quote deleted.{' '}
            <button
              type="button"
              className="min-h-11 underline underline-offset-4"
              onClick={() => {
                dispatch({ type: 'restore', campaign: removed.campaign, index: removed.index });
                setRemoved(null);
              }}
            >
              Undo
            </button>
          </>
        )}
      </p>

      <ul className="max-w-[820px] font-ui">
        {state.campaigns.map((c, i) => {
          const r = priceOf(state.profile, c, rates);
          const title = [c.brand.trim(), c.name.trim()].filter(Boolean).join(', ') || 'Untitled quote';
          return (
            <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 border-t border-rule py-4">
              <button type="button" onClick={() => open(c.id)} className="text-left font-doc text-[22px] leading-snug hover:underline hover:underline-offset-4">
                {title}
              </button>
              <span className="figures text-right font-doc text-[22px]">{r.target ? money(r.target, state.profile.currency) : 'Not priced'}</span>
              <span className="text-ui-sm text-quiet">Edited {dateFormat.format(new Date(c.updatedAt))}</span>
              <span className="flex justify-end gap-4 text-ui">
                {r.target > 0 && (
                  <Link href={`/quote/${c.id}`} className="min-h-11 content-center underline underline-offset-4">
                    View quote
                  </Link>
                )}
                <button type="button" onClick={() => remove(c, i)} className="min-h-11 text-quiet underline underline-offset-4 hover:text-error">
                  Delete
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
