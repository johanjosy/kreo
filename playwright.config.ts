import { defineConfig, devices } from '@playwright/test';

// BASE_URL=https://kreoapp.vercel.app npx playwright test  runs the suite against a deployment instead of the dev server.
const baseURL = process.env.BASE_URL ?? 'http://localhost:3100';

export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL ? undefined : { command: 'npm run dev', url: 'http://localhost:3100', reuseExistingServer: true, timeout: 120_000 },
});
