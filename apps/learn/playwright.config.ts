import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4174',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI,
  },
});
