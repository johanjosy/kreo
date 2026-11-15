'use client';

import { TermsDocument } from '@/components/terms/terms-document';
import { MarginNote } from '@/components/margin/margin-note';
import { useStore } from '@/lib/state';

export default function TermsPage() {
  const { state } = useStore();
  return (
    <main className="mx-auto grid max-w-[1120px] grid-cols-1 gap-[72px] px-4 pb-40 pt-8 sm:px-6 min-[880px]:grid-cols-[minmax(0,640px)_minmax(280px,1fr)] min-[880px]:pb-24 min-[880px]:pt-14">
      <div className={state.hydrated ? '' : 'invisible'}>
        {state.loadFailed && (
          <p role="alert" className="mb-8 bg-estimate-bg px-3 py-2 font-ui text-ui text-estimate-fg">
            Your saved quotes couldn’t be read, so KREO started fresh. A copy of the old data is kept in this browser.
          </p>
        )}
        <TermsDocument />
      </div>
      <MarginNote />
    </main>
  );
}
