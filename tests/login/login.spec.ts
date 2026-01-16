
// tests/login/login.spec.ts
import { test, expect } from '@playwright/test';
import account from '../test-data/test-account.json';
import { EventsTracker } from '../helpers/events-tracker';
import { Utils } from '../helpers/utils';

test.describe('Login Flow', () => {
  test('successful login with reusable test account', async ({ page }) => {
    await Utils.waitForVPNStabilisation();

    const tracker = new EventsTracker();
    await tracker.init(page);

    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await page.fill('#email', account.email);
    await page.fill('#password', account.password);

    await page.click('#login-submit');

    // Expect redirect to dashboard or user homepage
    await expect(page).toHaveURL(/(account|lobby|home)/i);

    // Validate logged-in UI state
    await expect(page.locator('[data-qa="user-avatar"], .account-header')).toBeVisible({
      timeout: 8000
    });

    // Save analytics events
    test.info().attachments.push({
      name: 'login-events.json',
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(tracker.getAll(), null, 2))
    });
  });

  test('login failure with invalid password triggers proper error', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', account.email);
    await page.fill('#password', 'WrongPassword123!');

    await page.click('#login-submit');

    // Error toast or message
    await expect(page.locator('.error-message, .toast-error')).toBeVisible();

    // No redirect should happen
    const url = page.url();
    expect(url).toMatch(/login/);
  });
});
