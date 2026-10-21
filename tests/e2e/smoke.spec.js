import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`página carrega sem erro de console em ${width}x${height}`, async ({ page }) => {
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await gotoAt(page, width, height);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Sua marca');
    expect(errors).toEqual([]);
  });
}

test.describe('MOB-07 sem rolagem horizontal', () => {
  for (const [width, height] of [[1440, 900], [1280, 800], [820, 1180], [390, 844], [360, 740]]) {
    test(`scrollWidth igual a clientWidth em ${width}px`, async ({ page }) => {
      await gotoAt(page, width, height);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      expect(scrollWidth).toBe(clientWidth);
    });
  }
});
