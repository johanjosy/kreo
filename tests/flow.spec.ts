import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function fill(page: Page, label: string, value: string) {
  const field = page.getByLabel(label, { exact: true });
  await field.click();
  await field.fill(value);
  await field.blur();
}

async function writeTerms(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'TikTok' }).click();
  await page.getByRole('button', { name: 'Instagram' }).click();
  await fill(page, 'Your name', 'Maya Okafor');
  await page.getByLabel('Content niche').selectOption('beauty');
  await fill(page, 'TikTok average views', '31,000');
  await fill(page, 'TikTok engagement rate, percent', '6.2');
  await fill(page, 'Instagram average views', '24000');
  await fill(page, 'Instagram engagement rate, percent', '4.1');
  await fill(page, 'Brand name', 'Fieldnote Skincare');
  await fill(page, 'Campaign name', 'spring launch');
  await fill(page, 'TikTok videos', '2');
  await fill(page, 'Instagram Reels', '1');
  await fill(page, 'Paid usage, months', '1');
}

test('write terms, see the rate, download the quote PDF', async ({ page, isMobile }, info) => {
  await writeTerms(page);

  // 2 TikToks: 31,000/1,000 × 20 × 1.2 × 1.1 = 818 each → 1,636. Reel: 24 × 22 × 1.1 × 1.1 = 639. Base 2,275; usage 15% = 341. Target 2,616.
  if (isMobile) {
    await expect(page.getByRole('button', { name: /Your rate, tap for breakdown/ })).toContainText('€2,616');
    await page.getByRole('button', { name: /Your rate, tap for breakdown/ }).click();
    await expect(page.getByRole('dialog')).toContainText('Walk-away');
    await page.getByRole('dialog').getByRole('link', { name: 'Turn into a quote' }).click();
  } else {
    const margin = page.getByRole('complementary', { name: 'Your rate' });
    await expect(margin).toContainText('€2,616');
    await expect(margin).toContainText('2 × TikTok videos');
    await margin.getByRole('link', { name: 'Turn into a quote' }).click();
  }

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Partnership proposal for Fieldnote Skincare');
  await expect(page.getByRole('article')).toContainText('€2,616');
  await expect(page.getByRole('article')).not.toContainText('Walk-away');
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations.map((v) => `quote: ${v.id} (${v.nodes.length})`)).toEqual([]);

  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PDF' }).click()]);
  expect(download.suggestedFilename()).toBe('maya-okafor-fieldnote-skincare-proposal.pdf');
  const path = info.outputPath('quote.pdf');
  await download.saveAs(path);
  const bytes = await readFile(path);
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
});

test('terms survive a reload', async ({ page }) => {
  await writeTerms(page);
  await page.waitForTimeout(400); // debounced save
  await page.reload();
  await expect(page.getByLabel('Brand name', { exact: true })).toHaveValue('Fieldnote Skincare');
});

test('no accessibility violations on any page', async ({ page }) => {
  await writeTerms(page);
  for (const path of ['/', '/quotes']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(violations.map((v) => `${path}: ${v.id} (${v.nodes.length})`)).toEqual([]);
  }
});
