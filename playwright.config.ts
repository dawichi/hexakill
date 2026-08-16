import { defineConfig, devices } from '@playwright/test';

const productionPreview = process.env['E2E_PRODUCTION'] === '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: productionPreview ? 'http://127.0.0.1:4300' : 'http://127.0.0.1:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: productionPreview ? 'npm run serve:dist' : 'npm start -- --host 127.0.0.1',
    url: productionPreview ? 'http://127.0.0.1:4300' : 'http://127.0.0.1:4200',
    // A stale process on the production port can serve a different project and
    // create false-positive navigation or false-negative journey failures.
    reuseExistingServer: productionPreview ? false : !process.env.CI,
    timeout: 120_000,
  },
});
