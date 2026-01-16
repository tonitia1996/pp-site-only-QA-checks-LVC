
// tests/login/login-promotions-cta.spec.ts
import { test, expect } from '@playwright/test';
import account from '../test-data/test-account.json';
import { Utils } from '../helpers/utils';

const CTA_SELECTOR = '.promotion-card .cta, .promo-cta, a.button';

test.describe('Logged-in CTA Behavior', () => {
  test('promotions CTAs show "More Info" when logged in', async ({ page }) => {
    await Utils.waitForVPNStabilisation();

    // Login first
    await page.goto('/login');
    await page.fill('#email', account.email);
    await page.fill('#password', account.password);
    await page.click('#login-submit');

    await expect(page.locator('[data-qa="user-avatar"]')).toBeVisible();

    // Navigate to promotions
    await page.goto('/promotions', { waitUntil: 'domcontentloaded' });

    // Scan CTAs
    const ctas = page.locator(CTA_SELECTOR);
    const count = await ctas.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const txt = await ctas.nth(i).innerText();
      expect(txt.toLowerCase()).toContain('more info');
    }

    // Also check the homepage banner
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const bannerCTA = page.locator('.banner .cta, .banner a.button');
    expect(await bannerCTA.innerText()).toMatch(/more info/i);
  });
});
