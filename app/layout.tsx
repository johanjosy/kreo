import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Newsreader } from 'next/font/google';
import { StoreProvider } from '@/lib/state';
import { TopBar } from '@/components/top-bar';
import './globals.css';

const newsreader = Newsreader({ subsets: ['latin'], axes: ['opsz'], style: ['normal', 'italic'], variable: '--font-newsreader', display: 'swap' });
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-hanken', display: 'swap' });

export const metadata: Metadata = {
  title: 'KREO — price your brand deals',
  description: 'Work out a defensible rate for a brand partnership and send a professional quote.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1a16' },
  ],
};

// Applies the saved theme before paint so there is no flash of the wrong theme.
const themeScript = `try{var t=localStorage.getItem('kreo:theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${hanken.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2">
          Skip to content
        </a>
        <StoreProvider>
          <TopBar />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
