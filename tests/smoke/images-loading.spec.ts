
// tests/smoke/images-loading.spec.ts
import { test, Page } from '@playwright/test';
import { Utils } from '../helpers/utils';
import fs from 'fs';
import path from 'path';

type SeedPage = { name: string; path: string };

const seedsPath = path.resolve(__dirname, '..', 'test-data', 'seed-pages.json');
const seeds: SeedPage[] = JSON.parse(fs.readFileSync(seedsPath, 'utf-8'));

async function progressiveScroll(page: Page, steps = 6) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  const chunk = Math.max(Math.floor(height / steps), 400);
  for (let y = 0; y <= height + 1000; y += chunk) {
    await page.mouse.wheel(0, chunk);
    await page.waitForTimeout(400);
  }
}

test.describe('Smoke: Images (including lazy-loaded) render correctly', () => {
  for (const p of seeds) {
    test(`Images loaded on: ${p.name}`, async ({ page }) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });

      // Initial check
      await Utils.validateImagesLoaded(page);

      // Trigger lazy loading
      await progressiveScroll(page, 8);
      await page.waitForTimeout(800);

      // Final check
      await Utils.validateImagesLoaded(page);
    });
  }
});
