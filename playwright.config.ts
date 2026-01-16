
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },

  // IMPORTANT: baseURL used across all suites
  use: {
    baseURL: 'https://play.lasvegascasino.com',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // Retries in CI
  retries: process.env.CI ? 2 : 0,

  // Reporter for GitHub Actions artifacts
  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  // 3 Browsers × 1 Desktop + 2 Mobile Devices
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'iPhone 13',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Galaxy S22',
      use: {
        ...devices['Galaxy S21'],
      },
    },
  ],

  // Folder for test artifacts
  outputDir: 'test-results/',
});