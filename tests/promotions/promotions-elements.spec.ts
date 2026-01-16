// tests/promotions/promotions-elements.spec.ts
import { test, expect } from '@playwright/test';
import { Utils } from '../helpers/utils';

async function scrollPage(page, steps = 6) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  const chunk = Math.max(Math.floor(height / steps), 400);
  for (let y = 0; y <= height + 1000; y += chunk) {
    await page.mouse.wheel(0, chunk);
    await page.waitForTimeout(300);
  }
}

test.describe('Promotions: UI Elements & Images', () => {
  test('promotions images load correctly', async ({ page }) => {
    await Utils.waitForVPNStabilisation();

    await page.goto('/promotions', { waitUntil: 'domcontentloaded' });

    // Promo cards
    const promoCards = page.locator('.promotion-card, .promo-card, [data-qa="promotion"]');
    const count = await promoCards.count();
    expect(count, 'Expected at least one promotion on the page').toBeGreaterThan(0);

    // Initial image check
    await Utils.validateImagesLoaded(page);

    // Lazy loading check
    await scrollPage(page);
    await Utils.validateImagesLoaded(page);
  });
});
