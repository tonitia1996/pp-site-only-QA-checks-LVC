
// tests/promotions/promotions-homepage-banner.spec.ts
import { test, expect } from '@playwright/test';
import { Utils } from '../helpers/utils';

test.describe('Promotions: Homepage Banner Consistency', () => {
  test('homepage banner shows all promotions from promotions page', async ({ page }) => {
    await Utils.waitForVPNStabilisation();

    // Collect promotion titles from /promotions
    await page.goto('/promotions');
    const promoTitles = await page.$$eval(
      '.promotion-card .title, .promo-card .title, [data-qa="promotion"] .title',
      els => els.map(el => el.textContent?.trim()?.toLowerCase() || '')
    );

    expect(promoTitles.length).toBeGreaterThan(0);

    // Now go to homepage
    await page.goto('/');
    const bannerTitles = await page.$$eval(
      '.banner .title, .promo-banner .title',
      els => els.map(el => el.textContent?.trim()?.toLowerCase() || '')
    );

    expect(bannerTitles.length).toBeGreaterThan(0);

    // Check every promo card title appears in homepage banners
    for (const title of promoTitles) {
      expect(
        bannerTitles.some(b => b.includes(title)),
        `Promotion "${title}" not found in homepage banners`
      ).toBeTruthy();
    }
  });
});
