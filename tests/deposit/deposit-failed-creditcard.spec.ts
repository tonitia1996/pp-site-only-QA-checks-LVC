
// tests/deposit/deposit-failed-creditcard.spec.ts
import { test, expect } from '@playwright/test';
import account from '../test-data/test-account.json';
import cards from '../test-data/cards.json';
import { EventsTracker } from '../helpers/events-tracker';
import { Utils } from '../helpers/utils';

test.describe('Deposit: Failed Credit Card Flow', () => {
  test('simulate failed credit card deposit', async ({ page }) => {
    const tracker = new EventsTracker();
    await tracker.init(page);

    await Utils.waitForVPNStabilisation();

    // Login first
    await page.goto('/login');
    await page.fill('#email', account.email);
    await page.fill('#password', account.password);
    await page.click('#login-submit');

    // Expect logged-in UI
    await expect(page.locator('[data-qa="user-avatar"]')).toBeVisible();

    // Navigate to cashier/deposit page
    await page.goto('/deposit', { waitUntil: 'domcontentloaded' });

    // Select "Credit Card"
    await page.click('text=Credit Card');

    // Input credit card data
    const card = cards.failedCreditCard;

    await page.fill('#cc-number', card.number);
    await page.fill('#cc-exp-month', card.expiryMonth);
    await page.fill('#cc-exp-year', card.expiryYear);
    await page.fill('#cc-cvv', card.cvv);
    await page.fill('#deposit-amount', card.amount);

    await page.click('#deposit-submit');

    // Expect failure message
    const error = page.locator('.payment-error, .error-message, .failed-transaction');
    await expect(error).toBeVisible({ timeout: 8000 });

    // Capture the error message for debugging
    const errorText = await error.innerText();
    test.info().annotations.push({
      type: 'error-info',
      description: `Payment failed with message: ${errorText}`
    });

    // Save analytics events
    test.info().attachments.push({
      name: 'deposit-events.json',
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(tracker.getAll(), null, 2))
    });
  });
});
