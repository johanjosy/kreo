import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * The "k." mark: the wordmark's first letter and full stop in Newsreader, white on a navy tile,
 * so it reads on both light and dark browser tabs.
 */
export async function brandIcon(size: number, { rounded = true } = {}) {
  const font = await readFile(join(process.cwd(), 'public/fonts/newsreader-500.woff'));
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1C2D5A',
          // iOS rounds home-screen icons itself, so the Apple icon stays square.
          borderRadius: rounded ? size * 0.18 : 0,
          color: '#FFFFFF',
          fontFamily: 'Newsreader',
          fontSize: size * 0.78,
          lineHeight: 1,
          letterSpacing: -size * 0.02,
          paddingBottom: size * 0.1,
        }}
      >
        k.
      </div>
    ),
    { width: size, height: size, fonts: [{ name: 'Newsreader', data: font, weight: 500, style: 'normal' }] },
  );
}
