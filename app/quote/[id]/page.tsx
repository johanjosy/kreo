'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { Download } from 'lucide-react';
import { quoteContent } from '@/lib/quote';
import { priceOf, useStore } from '@/lib/state';

export default function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, rates, dispatch } = useStore();
  const [status, setStatus] = useState<'idle' | 'working' | 'failed'>('idle');
  if (!state.hydrated) return <main id="main" className="min-h-dvh" />;

  const campaign = state.campaigns.find((c) => c.id === id);
  if (!campaign) {
    return (
      <main id="main" className="mx-auto max-w-[640px] px-4 pt-16 font-doc text-[22px] leading-relaxed sm:px-6">
        <h1 className="mb-4 text-[34px] leading-tight">This quote isn’t on this device</h1>
        <p className="mb-8">Quotes are saved in the browser you made them in. Open KREO there, or write your terms again here.</p>
        <Link href="/" className="font-ui text-ui-lg underline underline-offset-4">
          Write your terms
        </Link>
      </main>
    );
  }

  const result = priceOf(state.profile, campaign, rates);
  const q = quoteContent(state.profile, campaign, result);

  async function download() {
    setStatus('working');
    try {
      const { quoteBlob } = await import('@/components/quote/quote-pdf');
      const url = URL.createObjectURL(await quoteBlob(q));
      const a = document.createElement('a');
      a.href = url;
      a.download = q.fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('idle');
    } catch {
      setStatus('failed');
    }
  }

  return (
    <main id="main" className="mx-auto max-w-[1120px] px-4 pb-24 pt-8 sm:px-6 min-[880px]:pt-14">
      <div className="no-print mb-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" onClick={download} disabled={status === 'working' || result.target === 0} className="inline-flex h-12 items-center gap-2 rounded-[2px] bg-note px-5 font-ui text-ui-lg font-semibold text-on-note hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
          <Download size={18} strokeWidth={1.5} aria-hidden />
          {status === 'working' ? 'Preparing PDF…' : 'Download PDF'}
        </button>
        <Link href="/" onClick={() => dispatch({ type: 'select', id: campaign.id })} className="min-h-11 content-center font-ui text-ui-lg underline underline-offset-4">
          Edit terms
        </Link>
        <p role="status" className="w-full font-ui text-ui text-error empty:hidden">
          {status === 'failed' ? 'The PDF couldn’t be created. Check your connection and try again.' : ''}
        </p>
      </div>

      <article className="max-w-[720px] border-t-[1.5px] border-ink pt-10" aria-label="Quote preview">
        <p className="mb-10 font-ui text-ui-lg font-semibold tracking-[0.06em]">{q.creator}</p>
        <h1 className="mb-3 font-doc text-[34px] leading-[1.1] sm:text-[40px]">{q.title}</h1>
        {q.campaign && <p className="font-ui text-ui text-quiet">Campaign: {q.campaign}</p>}
        <p className="font-ui text-ui text-quiet">
          Prepared by {q.creator} on {q.issued}
        </p>
        {q.scope && <p className="mt-8 max-w-[60ch] font-doc text-[22px] leading-[1.6]">{q.scope}</p>}

        <table className="mt-8 w-full font-ui text-ui">
          <caption className="sr-only">Fee breakdown</caption>
          <tbody>
            {q.rows.map((r, i) => (
              <tr key={i} className="border-t border-rule">
                <th scope="row" className="py-2.5 text-left font-normal text-quiet">
                  {r.item}
                </th>
                <td className="figures py-2.5 text-right">{r.amount}</td>
              </tr>
            ))}
            <tr className="border-t-[1.5px] border-ink">
              <th scope="row" className="pt-3 text-left font-normal">
                Total fee
              </th>
              <td className="figures pt-3 text-right font-doc text-[34px]">{q.total}</td>
            </tr>
          </tbody>
        </table>

        <h2 className="mt-10 font-ui text-ui font-semibold text-note">Terms</h2>
        <ul className="mt-2 space-y-1 font-ui text-ui">
          {q.terms.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-10 border-t border-rule pt-3 font-ui text-ui-sm text-quiet">{q.footer}</p>
      </article>

      <p className="no-print mt-8 max-w-[720px] bg-estimate-bg px-3 py-2 font-ui text-ui-sm text-estimate-fg">
        Your walk-away price and opening ask stay private: they aren’t in the quote.
      </p>
    </main>
  );
}
