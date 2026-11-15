'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';
const next: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
const icons = { system: Monitor, light: Sun, dark: Moon };
const names = { system: 'Theme: matches your device', light: 'Theme: light', dark: 'Theme: dark' };

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  useEffect(() => {
    try {
      const t = localStorage.getItem('kreo:theme');
      if (t === 'light' || t === 'dark') setTheme(t);
    } catch {}
  }, []);

  const cycle = () => {
    const t = next[theme];
    setTheme(t);
    if (t === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    try {
      if (t === 'system') localStorage.removeItem('kreo:theme');
      else localStorage.setItem('kreo:theme', t);
    } catch {}
  };

  const Icon = icons[theme];
  return (
    <button type="button" onClick={cycle} aria-label={`${names[theme]}. Change theme`} title={names[theme]} className="grid size-11 place-items-center text-quiet hover:text-ink">
      <Icon size={18} strokeWidth={1.5} aria-hidden />
    </button>
  );
}

export function TopBar() {
  const path = usePathname();
  const link = (href: string, text: string) => (
    <Link href={href} aria-current={path === href ? 'page' : undefined} className="px-2 py-3 text-ui text-quiet underline-offset-4 hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline">
      {text}
    </Link>
  );
  return (
    <header className="no-print mx-auto flex max-w-[1120px] items-center justify-between px-4 pt-[max(env(safe-area-inset-top),8px)] sm:px-6">
      <Link href="/" className="py-3 text-ui-lg font-semibold tracking-[0.06em]" aria-label="KREO, your terms">
        KREO
      </Link>
      <nav className="flex items-center gap-1" aria-label="Main">
        {link('/', 'Terms')}
        {link('/quotes', 'Quotes')}
        <ThemeToggle />
      </nav>
    </header>
  );
}
