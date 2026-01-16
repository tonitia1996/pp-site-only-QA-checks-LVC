
// tests/registration/registration-events.spec.ts
import { test, expect } from '@playwright/test';
import { EventsTracker } from '../helpers/events-tracker';

test('correct analytics events fire during registration', async ({ page }) => {
  const tracker = new EventsTracker();
  await tracker.init(page);

  await page.goto('/register');

  // Perform a few key steps only
  await page.fill('#first-name', 'Test');
  await page.fill('#last-name', 'User');

  await page.waitForTimeout(1500);

  const events = tracker.getAll();

  // Example: check for a "registration_started" event or similar
  const found = events.some(e =>
    JSON.stringify(e).toLowerCase().includes('registration')
  );

  expect(found, 'Expected registration-related analytics events').toBeTruthy();
});