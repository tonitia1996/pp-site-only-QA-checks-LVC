
// tests/smoke/links-status.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

type SeedPage = { name: string; path: string };

const seedsPath = path.resolve(__dirname, '..', 'test-data', 'seed-pages.json');
const seeds: SeedPage[] = JSON.parse(fs.readFileSync(seedsPath, 'utf-8'));

const BASE = 'https://play.lasvegascasino.com';

function isInternalLink(href: string) {
  try {
    if (!href) return false;
    if (href.startsWith('#')) return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;

    const u = new URL(href, BASE);
    return u.hostname.endsWith('lasvegascasino.com');
  } catch {
    return false;
  }
}

function absoluteUrl(href: string) {
  return new URL(href, BASE).toString();
}

function isAuthOnly(url: string) {
  return /\/(account|profile|deposit|cashier|wallet|settings|admin)\b/i.test(url);
}

test.describe('Smoke: Internal links resolve to HTTP 200', () => {
  for (const seed of seeds) {
    test(`Internal links on ${seed.name}`, async ({ page, request }) => {
      await page.goto(seed.path, { waitUntil: 'domcontentloaded' });

      const hrefs = await page.$$eval('a[href]', (as) => as.map(a => (a as HTMLAnchorElement).getAttribute('href') || ''));

      const internal = Array.from(new Set(
        hrefs
          .filter(isInternalLink)
          .map(absoluteUrl)
          .filter(u => !isAuthOnly(u))
      ));

      test.info().attachments.push({
        name: 'discovered-internal-links.json',
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(internal, null, 2))
      });

      // Validate each internal link resolves to 200 (after redirects)
      for (const url of internal) {
        await test.step(`Check ${url}`, async () => {
          // First try HEAD (fast), if not allowed, fall back to GET
          let res = await request.fetch(url, { method: 'HEAD', maxRedirects: 5 });
          if (res.status() === 405 || res.status() === 501) {
            res = await request.get(url, { maxRedirects: 5 });
          }
          const status = res.status();

          // Accept 200–204; Treat other statuses as failures
          expect(
            status,
            `Expected 200–204 but got ${status} for ${url}`
          ).toBeGreaterThanOrEqual(200);
          expect(status).toBeLessThan(205);
        });
      }
    });
  }
});
