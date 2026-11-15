'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
export function TopBar() {
  const path = usePathname();
  const link = (href: string, text: string) => (
    <Link href={href} aria-current={path === href ? 'page' : undefined} className="px-2 py-3 text-ui text-quiet underline-offset-4 hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline">
      {text}
    </Link>
  );
  return (
    <header className="no-print mx-auto flex max-w-[1120px] items-center justify-between px-4 pt-[max(env(safe-area-inset-top),8px)] sm:px-6">
      <Link href="/" className="py-3 font-doc text-[26px] font-medium leading-none tracking-[-0.01em]" aria-label="kreo, home">
        kreo.
      </Link>
      <nav className="flex items-center gap-1" aria-label="Main">
        {link('/', 'Terms')}
        {link('/rates', 'Rates')}
        {link('/quotes', 'Quotes')}
      </nav>
    </header>
  );
}
