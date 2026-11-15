import { expect, test } from '@playwright/test';

// Screenshot every page at 4 widths and fail on horizontal overflow.
// Run with: npx playwright test screens --project=desktop   (images land in screenshots/)
const widths = [375, 768, 1280, 1440];
const sample = {
  version: 1,
  activeId: 'demo',
  profile: { name: 'Maya Okafor', niche: 'beauty', currency: 'EUR', platforms: { tiktok: { followers: 48000, avgViews: 31000, engagementRate: 6.2 }, instagram: { followers: 22000, avgViews: 24000, engagementRate: 4.1 } } },
  campaigns: [{ id: 'demo', name: 'spring launch', brand: 'Fieldnote Skincare', deliverables: { tiktokVideo: 2, igReel: 1, igStory: 3 }, extras: [{ id: 'x', label: 'Behind-the-scenes photo set', price: 150 }], usageMonths: 1, exclusivityMonths: 1, revisionRounds: 2, createdAt: '2026-11-15T10:00:00.000Z', updatedAt: '2026-11-15T10:00:00.000Z' }],
};

for (const width of widths) {
  test(`pages at ${width}px`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'desktop', 'one project is enough for screenshots');
    // A dark-mode device on purpose: KREO has no dark theme, so the page must stay white.
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: 'dark' });
    await page.addInitScript((s) => localStorage.setItem('kreo:v1', JSON.stringify(s)), sample);
    for (const [name, path] of [['terms', '/'], ['quote', '/quote/demo'], ['quotes', '/quotes'], ['rates', '/rates']]) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      await page.screenshot({ path: `screenshots/${name}-${width}.png`, fullPage: true });
      const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
      expect(bg, `${path} background`).toBe('rgb(255, 255, 255)');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} overflows at ${width}px`).toBeLessThanOrEqual(0);
    }
    await page.close();
  });
}
