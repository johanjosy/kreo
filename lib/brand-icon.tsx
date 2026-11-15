import { ImageResponse } from 'next/og';
import { MARK_PATH, NAVY } from './brand-mark';

/** PNG version of the "k." mark, drawn from the same vector outline as app/icon.svg. */
export function brandIcon(size: number, { rounded = true } = {}) {
  return new ImageResponse(
    (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* iOS rounds home-screen icons itself, so the Apple icon stays square. */}
        <rect width="100" height="100" rx={rounded ? 20 : 0} fill={NAVY} />
        <path fill="#FFFFFF" d={MARK_PATH} />
      </svg>
    ),
    { width: size, height: size },
  );
}
