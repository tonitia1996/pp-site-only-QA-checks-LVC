
// tests/login/login-events.spec.ts
import { test, expect } from '@playwright/test';
import { EventsTracker } from '../helpers/events-tracker';
import account from '../test-data/test-account.json';

test.describe('Login Analytics Events', () => {
  test('analytics events occur during login', async ({ page }) => {
    const tracker = new EventsTracker();
    await tracker.init(page);

    await page.goto('/login');

    await page.fill('#email', account.email);
    await page.fill('#password', account.password);

    await page.click('#login-submit');

    // Wait a moment for events
    await page.waitForTimeout(1500);

    const events = tracker.getAll();

    const loginEvent = events.find((e) => {
      return JSON.stringify(e).toLowerCase().includes('login');
    });

    expect(loginEvent, "Expected 'login' analytics event").toBeTruthy();
  });
});
