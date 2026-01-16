
import { Page } from '@playwright/test';

export class EventsTracker {
  events: any[] = [];

  async init(page: Page) {
    // Allow Playwright to receive events from the browser
    await page.exposeFunction('pw_captureEvent', (evt: any) => {
      this.events.push(evt);
    });

    // Attach hook to capture GTM / analytics events
    await page.addInitScript(() => {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];

      const originalPush = w.dataLayer.push.bind(w.dataLayer);
      w.dataLayer.push = function (...args: any[]) {
        try {
          // @ts-ignore
          window.pw_captureEvent?.(args[0]);
        } catch (e) {}
        return originalPush(...args);
      };
    });
  }

  clear() {
    this.events = [];
  }

  getAll() {
    return this.events;
  }

  find(predicate: (e: any) => boolean) {
    return this.events.find(predicate);
  }
}
