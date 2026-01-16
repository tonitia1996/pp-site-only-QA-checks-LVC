
import { expect, Page } from '@playwright/test';

export class Utils {
  /**
   * Wait a bit after VPN connects.
   * Useful when ExpressVPN finishes connecting
   * while CI immediately loads a page.
   */
  static async waitForVPNStabilisation() {
    await new Promise((r) => setTimeout(r, 2500));
  }

  /**
   * Validates that no console errors occurred.
   */
  static async assertNoConsoleErrors(page: Page) {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.waitForLoadState('networkidle');
    expect(errors, `Console errors detected:\n${errors.join('\n')}`).toHaveLength(0);
  }

  /**
   * Ensures all <img> elements load successfully.
   */
  static async validateImagesLoaded(page: Page) {
    const broken = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
      return imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((i) => i.src);
    });

    expect(broken, `Broken images found: ${broken.join('\n')}`).toHaveLength(0);
  }

  /**
   * Checks for layout shift by monitoring bounding boxes.
   * This is simplified; we can enhance using PerformanceObserver if needed.
   */
  static async detectLayoutShift(page: Page, selector: string) {
    const before = await page.locator(selector).boundingBox();
    await page.waitForTimeout(1000);
    const after = await page.locator(selector).boundingBox();

    expect(before?.x).toBeCloseTo(after?.x || 0, 1);
    expect(before?.y).toBeCloseTo(after?.y || 0, 1);
  }
}