import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: [['list'], ['json', { outputFile: 'reports/browser-results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    viewport: { width: 1280, height: 1000 },
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      args: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
        ? ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote']
        : []
    }
  },
  webServer: [
    { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
    {
      // The documentation site, built then served statically (tests/browser/docs-site.spec.ts).
      command:
        'npm run build:docs && npm run preview --workspace apps/docs -- --host 127.0.0.1 --port 4321 --ignore-lock',
      url: 'http://127.0.0.1:4321',
      reuseExistingServer: !process.env.CI,
      timeout: 180000
    }
  ]
});
