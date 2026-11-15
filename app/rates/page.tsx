'use client';

import type { ReactNode } from 'react';
import { benchmarks } from '@/config/benchmarks';
import { currencies } from '@/config/currencies';
import { NumberBlank } from '@/components/terms/blanks';
import { money } from '@/lib/format';
import { hasOverrides, type ScalarRate } from '@/lib/pricing/rates';
import { DELIVERABLES, type Currency } from '@/lib/pricing/types';
import { useStore } from '@/lib/state';

const symbolOf = (c: Currency) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: c }).formatToParts(0).find((p) => p.type === 'currency')?.value ?? c;

/** "KREO's starting rate is X. Use it" — shown only under values the creator has changed. */
function Reset({ show, text, onReset }: { show: boolean; text: string; onReset: () => void }) {
  if (!show) return null;
  return (
    <span className="block font-ui text-ui leading-normal text-quiet">
      You changed this. KREO’s starting value is {text}.{' '}
      <button type="button" onClick={onReset} className="min-h-11 text-ink underline underline-offset-4 hover:text-note">
        Use {text}
      </button>
    </span>
  );
}

function Line({ children }: { children: ReactNode }) {
  return <li className="mb-4">{children}</li>;
}

export default function RatesPage() {
  const { state, rates, dispatch } = useStore();
  if (!state.hydrated) return <main id="main" className="min-h-dvh" />;

  const cur = state.profile.currency;
  const fx = currencies[cur].perEur;
  const sym = symbolOf(cur);
  const o = state.rates ?? {};
  const pct = (key: ScalarRate, label: string, min: number, max: number) => (
    <NumberBlank value={Math.round(rates[key] * 1000) / 10} onChange={(v) => dispatch({ type: 'rate', key, value: v / 100 })} label={label} min={min} max={max} decimals minCh={3} />
  );
  const resetPct = (key: ScalarRate) => <Reset show={o[key] != null} text={`${Math.round(benchmarks[key] * 100)}%`} onReset={() => dispatch({ type: 'rate', key, value: null })} />;

  return (
    <main id="main" className="mx-auto max-w-[1120px] px-4 pb-24 pt-8 sm:px-6 min-[880px]:pt-14">
      <div className="max-w-[680px]">
        <h1 className="mb-3 font-doc text-[34px] leading-tight sm:text-[40px]">Your rates</h1>
        <p className="mb-10 max-w-[60ch] font-ui text-ui-lg leading-normal text-quiet">
          KREO starts from its own estimates, based on published creator rate guides. If you know your market, change them here. Every quote uses your rates, and they’re saved on this device.
        </p>

        <form className="font-doc text-[22px] leading-[1.75] sm:text-[27px]" onSubmit={(e) => e.preventDefault()} aria-label="Your rates">
          <p className="mb-4">For every 1,000 expected views, I charge</p>
          <ul className="mb-10">
            {DELIVERABLES.map((k) => {
              const f = rates.formats[k];
              const starting = benchmarks.formats[k].ratePer1000 * fx;
              return (
                <Line key={k}>
                  {sym}
                  <NumberBlank value={Math.round(f.ratePer1000 * fx * 100) / 100} onChange={(v) => dispatch({ type: 'formatRate', kind: k, eurPer1000: v / fx })} label={`Rate per 1,000 views for each ${f.label.one}`} max={10_000_000} decimals minCh={3} /> for each {f.label.one}
                  <Reset show={o.ratePer1000?.[k] != null} text={money(starting, cur)} onReset={() => dispatch({ type: 'formatRate', kind: k, eurPer1000: null })} />
                </Line>
              );
            })}
          </ul>

          <p className="mb-6">
            Paid usage adds {pct('usagePerMonth', 'Paid usage, percent of fee per month', 0, 100)}% of the fee for each month.
            {resetPct('usagePerMonth')}
          </p>
          <p className="mb-6">
            Exclusivity adds {pct('exclusivityPerMonth', 'Exclusivity, percent of fee per month', 0, 100)}% for each month.
            {resetPct('exclusivityPerMonth')}
          </p>
          <p className="mb-6">
            Each revision round after the first adds {pct('revisionRate', 'Extra revision round, percent of fee', 0, 100)}%.
            {resetPct('revisionRate')}
          </p>
          <p className="mb-6">
            I’ll open at {pct('anchorRatio', 'Opening ask, percent of target', 101, 200)}% of my target and walk away below{' '}
            {pct('floorRatio', 'Walk-away, percent of target', 50, 99)}%.
            {resetPct('anchorRatio')}
            {resetPct('floorRatio')}
          </p>
        </form>

        {hasOverrides(state.rates) && (
          <button type="button" onClick={() => dispatch({ type: 'resetRates' })} className="mt-4 min-h-11 font-ui text-ui-lg underline underline-offset-4 hover:text-note">
            Go back to KREO’s starting rates
          </button>
        )}

        <p className="mt-10 bg-estimate-bg px-3 py-2 font-ui text-ui-sm leading-normal text-estimate-fg">
          Starting rates are KREO’s estimates from published guides by Stan, Sup and Kreatory, converted from euros at an approximate exchange rate. They aren’t guaranteed market rates.
        </p>
      </div>
    </main>
  );
}
