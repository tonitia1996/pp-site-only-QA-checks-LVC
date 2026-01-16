
// tests/deposit/deposit-events.spec.ts
import { test, expect } from '@playwright/test';
import { EventsTracker } from '../helpers/events-tracker';
import account from '../test-data/test-account.json';

test('analytics events fire during failed deposit attempt', async ({ page }) => {
  const tracker = new EventsTracker();
  await tracker.init(page);

  await page.goto('/login');
  await page.fill('#email', account.email);
  await page.fill('#password', account.password);
  await page.click('#login-submit');

  await page.goto('/deposit');

  // Trigger some input into credit card fields
  await page.fill('#cc-number', '4000058260000005');
  await page.waitForTimeout(1500);

  const events = tracker.getAll();

  const depositEvent = events.some(e =>
    JSON.stringify(e).toLowerCase().includes('deposit')
  );

  expect(depositEvent, 'Expected deposit-related analytics event').toBeTruthy();
});
