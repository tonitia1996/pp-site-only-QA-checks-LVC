
// tests/smoke/page-load.spec.ts
import { test, expect } from '@playwright/test';
import { Utils } from '../helpers/utils';
import fs from 'fs';
import path from 'path';

type SeedPage = { name: string; path: string };

const seedsPath = path.resolve(__dirname, '..', 'test-data', 'seed-pages.json');
const seeds: SeedPage[] = JSON.parse(fs.readFileSync(seedsPath, 'utf-8'));

// Common CTA selectors (extend based on your DOM)
const CTA_SELECTORS = [
  'a[role="button"]',
  'button',
  'a.button',
  '.btn',
  '.cta',
  '[data-qa="cta"]',
  'a[href*="register"]',
  'a[href*="join"]',
  'a[href*="login"]',
  'a[href*="deposit"]',
  'a[href*="promotions"]',
];

test.describe('Smoke: Page load & responsive UI', () => {
  for (const pageDef of seeds) {
    test(`${pageDef.name} loads cleanly with CTAs and no console errors`, async ({ page }) => {
      await Utils.waitForVPNStabilisation();

      await page.goto(pageDef.path, { waitUntil: 'domcontentloaded' });

      // Sanity: main landmark or body visible
      await expect(page.locator('body')).toBeVisible();

      // Console errors
      await Utils.assertNoConsoleErrors(page);

      // Images loaded
      await Utils.validateImagesLoaded(page);

      // Check at least one CTA exists and is visible
      const cta = page.locator(CTA_SELECTORS.join(','));
      const count = await cta.count();
      expect(count, 'Expected at least one CTA on the page').toBeGreaterThan(0);

      // Ensure at least one CTA is visible & clickable
      let visibleFound = false;
      for (let i = 0; i < Math.min(count, 10); i++) {
        const el = cta.nth(i);
        if (await el.isVisible()) {
          visibleFound = true;
          break;
        }
      }
      expect(visibleFound, 'No visible CTA found').toBeTruthy();

      // Responsive sanity: Avoid horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });
      expect(overflow).toBeLessThanOrEqual(2); // small tolerance

      // Responsive heuristic: Desktop should have nav; Mobile should have hamburger/menu
      const isMobile = /iPhone|Galaxy/i.test(test.info().project.name);
      if (isMobile) {
        const hamburger = page.locator(
          '[aria-label*="menu" i], button[aria-label*="menu" i], .hamburger, .menu-toggle'
        );
        await expect(hamburger.first()).toBeVisible({ timeout: 5000 });
      } else {
        const nav = page.locator('nav, [role="navigation"]');
        await expect(nav.first()).toBeVisible({ timeout: 5000 });
      }
    });
  }
});