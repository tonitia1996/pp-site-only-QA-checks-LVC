
// tests/registration/registration-flow.spec.ts
import { test, expect } from '@playwright/test';
import { Utils } from '../helpers/utils';
import { EventsTracker } from '../helpers/events-tracker';
import userData from '../test-data/registration-users.json';

test.describe('Registration Flow', () => {
  test('full registration end-to-end', async ({ page }) => {
    const events = new EventsTracker();
    await events.init(page);

    await Utils.waitForVPNStabilisation();

    // Go to registration
    await page.goto('/register', { waitUntil: 'domcontentloaded' });

    // Validate postal code auto-filled when using UK VPN
    const postal = await page.locator('#postcode').inputValue();
    expect(postal, 'Postal code should auto-fill for UK VPN').not.toBe('');

    // Font contrast validation on labels
    const labels = page.locator('label');
    const count = await labels.count();
    for (let i = 0; i < count; i++) {
      const color = await labels.nth(i).evaluate(el =>
        window.getComputedStyle(el).color
      );
      const bg = await labels.nth(i).evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      // A very basic contrast heuristic: not equal colors
      expect(color !== bg, `Label ${i} may have insufficient contrast`).toBeTruthy();
    }

    // Fill form using test data
    await page.fill('#first-name', userData.firstName);
    await page.fill('#last-name', userData.lastName);
    await page.fill('#email', userData.email);
    await page.fill('#password', userData.password);
    await page.fill('#dob-day', userData.dob.day);
    await page.fill('#dob-month', userData.dob.month);
    await page.fill('#dob-year', userData.dob.year);

    // Layout shift check for a sensitive element (e.g., submit button)
    await Utils.detectLayoutShift(page, '#register-submit');

    // Submit the registration
    await page.click('#register-submit');

    // Expect redirect or confirmation
    await expect(page).toHaveURL(/(welcome|verify|dashboard)/i);

    // Save analytics events for step 2
    test.info().attachments.push({
      name: 'registration-events.json',
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(events.getAll(), null, 2))
    });
  });
});
