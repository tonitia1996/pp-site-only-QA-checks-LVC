
// tests/analytics/utm-attribution.spec.ts
import { test, expect } from '@playwright/test';
import { EventsTracker } from '../helpers/events-tracker';

const BASE = 'https://play.lasvegascasino.com';

const cases = [
  { label: 'direct', url: `${BASE}/` },
  { label: 'organic', url: `${BASE}/` },
  { label: 'crm_email', url: `${BASE}/?utm_source=crm&utm_medium=email` },
  { label: 'crm_sms', url: `${BASE}/?utm_source=crm&utm_medium=sms` },
  { label: 'referral', url: `${BASE}/?utm_source=referral&utm_medium=referral` }
];

test.describe('UTM Attribution', () => {
  for (const c of cases) {
    test(`traffic → ${c.label}`, async ({ page }) => {
      const tracker = new EventsTracker();
      await tracker.init(page);

      await page.goto(c.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const events = tracker.getAll();

      test.info().attachments.push({
        name: `${c.label}-events.json`,
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(events, null, 2))
      });

      expect(events.length).toBeGreaterThan(0);
    });
  }
});
