import { defineConfig } from '@playwright/test';
// Evidence (reports/browser-results.json, screenshots, computed.json) is written only with GGB_EVIDENCE=1; see
// tests/browser/helpers.ts.
const evidence = process.env.GGB_EVIDENCE === '1';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: evidence ? [['list'], ['json', { outputFile: 'reports/browser-results.json' }]] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: 1280, height: 1000 }
  },
  // Every spec runs in Chromium; the overlay smoke spec also runs in Firefox and WebKit, where CSS anchor positioning
  // or the dialog closedby attribute may be missing (decision of 2026-10-31, due before the first overlay gate).
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
            ? ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote']
            : []
        }
      }
    },
    { name: 'firefox', use: { browserName: 'firefox' }, testMatch: /overlays-smoke\.spec\.ts$/ },
    { name: 'webkit', use: { browserName: 'webkit' }, testMatch: /overlays-smoke\.spec\.ts$/ }
  ],
  webServer: [
    { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
    {
      // The documentation site, built then served statically (tests/browser/docs-site.spec.ts). Always rebuilt and
      // started fresh: a server already on 4321 fails the run instead of serving an older build. --ignore-lock keeps
      // astro preview in the foreground (Astro 7 moves it to the background when it detects an AI agent, and
      // Playwright would see the command exit) and lets it start even if a stale lock file remains.
      command:
        'npm run build:docs && npm run preview --workspace apps/docs -- --host 127.0.0.1 --port 4321 --ignore-lock',
      url: 'http://127.0.0.1:4321',
      reuseExistingServer: false,
      timeout: 180000
    }
  ]
});
