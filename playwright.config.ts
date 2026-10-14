import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4207',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run start -- --host 127.0.0.1 --port 4207',
    url: 'http://127.0.0.1:4207',
    reuseExistingServer: false,
    timeout: 120_000,
    env: { API_BASE_URL: 'http://127.0.0.1:4207/api', GOOGLE_CLIENT_ID: '' },
  },
});
