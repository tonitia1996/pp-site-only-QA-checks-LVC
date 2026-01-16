
// tests/promotions/promotions-events.spec.ts
import { test, expect } from '@playwright/test';
import { EventsTracker } from '../helpers/events-tracker';

test.describe('Promotions: Analytics Events', () => {

  test('analytics events fire when promotions are loaded', async ({ page }) => {
    const tracker = new EventsTracker();
    await tracker.init(page);

    await page.goto('/promotions');

    await page.waitForTimeout(1500);

    const events = tracker.getAll();

    const promoEvent = events.find((e) =>
      JSON.stringify(e).toLowerCase().includes('promotion')
    );

    expect(promoEvent, 'Expected analytics event related to promotions').toBeTruthy();

    // Save event data as artifact
    test.info().attachments.push({
      name: 'promotions-events.json',
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(events, null, 2)),
    });
  });

});
