import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gotoAt, scrollToEnd } from '../helpers.js';

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`A11Y-01 zero violações do axe (WCAG 2.2 AA) em ${width}x${height} após rolar a página`, async ({ page }) => {
    await gotoAt(page, width, height);
    await scrollToEnd(page);
    // Every reveal block has arrived and its entrance transition has finished.
    await expect(page.locator('.reveal:not(.arrived)')).toHaveCount(0);
    await page.waitForTimeout(1500);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const summary = violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target.join(' ')).slice(0, 10) }));
    expect(summary).toEqual([]);
  });
}
