
// tests/promotions/promotions-cta.spec.ts
import { test, expect } from '@playwright/test';
import account from '../test-data/test-account.json';
import { Utils } from '../helpers/utils';

const CTA_SELECTOR = '.promotion-card .cta, a.promo-cta, a.button, button.promo-cta';

test.describe('Promotions: CTA Behavior', () => {
  
  test('Logged-out CTAs lead to registration', async ({ page }) => {
    await Utils.waitForVPNStabilisation();

    await page.goto('/promotions');

    const ctas = page.locator(CTA_SELECTOR);
    const count = await ctas.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = await ctas.nth(i).getAttribute('href');
      expect(
        link?.toLowerCase(),
        `CTA link (${link}) does not lead to registration`
      ).toContain('/register');
    }
  });

  test('Logged-in CTAs show "More Info" and lead to T&C', async ({ page }) => {
    await Utils.waitForVPNStabilisation();

    // Login first
    await page.goto('/login');
    await page.fill('#email', account.email);
    await page.fill('#password', account.password);
    await page.click('#login-submit');
    await expect(page.locator('[data-qa="user-avatar"]')).toBeVisible();

    await page.goto('/promotions', { waitUntil: 'domcontentloaded' });

    const ctas = page.locator(CTA_SELECTOR);
    const count = await ctas.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const element = ctas.nth(i);

      const text = (await element.innerText()).trim().toLowerCase();
      expect(text).toContain('more info');

      const href = (await element.getAttribute('href'))?.toLowerCase() || '';
      expect(
        href,
        `CTA href "${href}" should go to T&C, not to register`
      ).toMatch(/terms|conditions|promo|details/);
    }
  });

});
