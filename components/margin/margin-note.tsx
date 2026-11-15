'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronDown, X } from 'lucide-react';
import { benchmarks } from '@/config/benchmarks';
import { money } from '@/lib/format';
import type { Currency, PriceResult } from '@/lib/pricing/types';
import { useStore } from '@/lib/state';

const PLATFORM_OF = (k: keyof typeof benchmarks.formats) => ({ instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' })[benchmarks.formats[k].platform];

/** The running total counts to its new value; with reduced motion it changes instantly. */
export function Total({ value, currency, className }: { value: number; currency: Currency; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, { duration: 0.24, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setShown(Math.round(v)) });
    from.current = value;
    return () => controls.stop();
  }, [value, reduce]);
  return <span className={`figures font-doc ${className ?? ''}`}>{money(shown, currency)}</span>;
}

export function RangeRuler({ result, currency }: { result: PriceResult; currency: Currency }) {
  // The scale frames the negotiation range with equal room either side, so outer labels always fit.
  const pad = (result.anchor - result.floor) * 1.2;
  const lo = Math.max(0, result.floor - pad);
  const span = result.anchor + pad - lo || 1;
  const at = (v: number) => ({ transform: `translateX(${((v - lo) / span) * 100}%)` });
  const pin = 'absolute inset-x-0 bottom-0 transition-transform duration-[240ms] ease-[var(--ease-settle)]';
  return (
    <figure className="mt-5">
      <figcaption className="sr-only">
        Walk-away {money(result.floor, currency)}, target {money(result.target, currency)}, opening ask {money(result.anchor, currency)}.
      </figcaption>
      <div className="relative h-[104px] overflow-x-clip" aria-hidden>
        <div className="absolute inset-x-0 bottom-0 h-3 border-b border-ink bg-[repeating-linear-gradient(90deg,var(--rule)_0_1px,transparent_1px_10%)]" />
        {(
          [
            // Walk-away label hangs left of its pin, ask label right of its pin, target sits above both: they never collide.
            ['Walk-away', result.floor, 'text-quiet', 'bottom-[26px] -translate-x-full pr-1 text-right'],
            ['Target', result.target, 'text-note', 'bottom-[66px] -translate-x-1/2 text-center'],
            ['Ask', result.anchor, 'text-ask', 'bottom-[26px] pl-1'],
          ] as const
        ).map(([name, v, color, labelPos]) => (
          <div key={name} className={`${pin} ${color}`} style={at(v)}>
            <span className="absolute bottom-0 left-0 block h-[22px] w-0.5 -translate-x-1/2 bg-current" />
            <span className={`absolute left-0 ${labelPos} figures whitespace-nowrap font-ui text-ui-sm font-semibold leading-tight`}>
              <span className="block font-normal">{name}</span>
              {money(v, currency)}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

function Lines({ result, currency }: { result: PriceResult; currency: Currency }) {
  return (
    <ul className="mt-6 font-ui text-ui">
      {result.lines.map((l, i) => (
        <li key={l.kind + i} className="border-t border-rule">
          <details className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 py-2 [&::-webkit-details-marker]:hidden">
              <span className="flex-1 text-quiet">
                {l.kind === 'usage' || l.kind === 'exclusivity' || l.kind === 'revisions' ? l.label : `${l.count} × ${l.label}`}
              </span>
              <span className="figures">{money(l.total, currency)}</span>
              <ChevronDown size={16} strokeWidth={1.5} className="text-quiet transition-transform duration-200 group-open:rotate-180" aria-hidden />
            </summary>
            <p className="pb-3 text-ui-sm leading-normal text-quiet">{l.explanation}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}

function Estimate() {
  return (
    <p className="mt-6 bg-estimate-bg px-3 py-2 font-ui text-ui-sm leading-normal text-estimate-fg">
      An estimate from your numbers and your rates, not a guaranteed market rate.{' '}
      <Link href="/rates" className="underline underline-offset-2">
        Change your rates
      </Link>
    </p>
  );
}

function MissingViews({ result }: { result: PriceResult }) {
  if (!result.missingViews.length) return null;
  const platforms = [...new Set(result.missingViews.map(PLATFORM_OF))];
  return <p className="mt-4 font-ui text-ui-sm leading-normal text-error">Add your average views on {platforms.join(' and ')} to price those deliverables.</p>;
}

function QuoteLink({ id, disabled }: { id: string; disabled: boolean }) {
  if (disabled) return <p className="mt-6 font-ui text-ui text-quiet">Add a deliverable to turn this into a quote.</p>;
  return (
    <Link href={`/quote/${id}`} className="mt-6 inline-flex h-12 items-center rounded-[2px] bg-note px-5 font-ui text-ui-lg font-semibold text-on-note hover:opacity-90">
      Turn into a quote
    </Link>
  );
}

function Breakdown() {
  const { state, campaign, result } = useStore();
  const cur = state.profile.currency;
  const empty = result.target === 0;
  return (
    <>
      <h2 className="font-ui text-ui font-medium text-note">Your rate for this campaign</h2>
      {empty ? (
        <p className="mt-2 font-doc text-[22px] leading-snug text-quiet">Add your views and a deliverable to see your rate.</p>
      ) : (
        <>
          <Total value={result.target} currency={cur} className="mt-1 block text-[56px] leading-[1.05]" />
          <RangeRuler result={result} currency={cur} />
          <p className="mt-3 font-ui text-ui-sm leading-normal text-quiet">Open at the ask. Don’t go below your walk-away price.</p>
          <Lines result={result} currency={cur} />
        </>
      )}
      <MissingViews result={result} />
      <QuoteLink id={campaign.id} disabled={empty} />
      <Estimate />
    </>
  );
}

export function MarginNote() {
  const { state, result } = useStore();
  return (
    <>
      <aside aria-label="Your rate" className="sticky top-8 hidden self-start border-l-[1.5px] border-note pl-6 min-[880px]:block" aria-live="polite">
        <Breakdown />
      </aside>

      <Dialog.Root>
        <div className="no-print fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t-[1.5px] border-note bg-paper px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 min-[880px]:hidden">
          <Dialog.Trigger className="flex min-h-11 flex-col items-start text-left">
            <span className="font-ui text-ui-sm text-quiet">Your rate, tap for breakdown</span>
            {result.target ? <Total value={result.target} currency={state.profile.currency} className="text-[34px] leading-none" /> : <span className="font-doc text-[22px] text-quiet">Not priced yet</span>}
          </Dialog.Trigger>
        </div>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-20 bg-[var(--scrim)] data-[state=open]:animate-[fade_280ms_var(--ease-settle)]" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-30 max-h-[88dvh] overflow-y-auto rounded-t-[2px] bg-paper px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3 shadow-[0_-8px_32px_rgb(0_0_0/0.18)] data-[state=open]:animate-[sheet_280ms_var(--ease-settle)]">
            <div className="mx-auto mb-3 h-1 w-10 bg-rule" aria-hidden />
            <Dialog.Title className="sr-only">Rate breakdown</Dialog.Title>
            <Dialog.Description className="sr-only">How your rate for this campaign is worked out.</Dialog.Description>
            <Dialog.Close aria-label="Close breakdown" className="absolute right-2 top-2 grid size-11 place-items-center text-quiet hover:text-ink">
              <X size={18} strokeWidth={1.5} aria-hidden />
            </Dialog.Close>
            <Breakdown />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
