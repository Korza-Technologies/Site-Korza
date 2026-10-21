import { test, expect } from '@playwright/test';
import { gotoAt, rectsIntersect } from '../helpers.js';

const phoneImages = '.hero-device img, .push-device';
const captions = '.scene-caption, .art-caption, .marquee-caption';

const rectOf = locator => locator.evaluate(el => el.getBoundingClientRect().toJSON());

const inside = (inner, outer) => inner.left >= outer.left && inner.top >= outer.top
  && inner.right <= outer.right && inner.bottom <= outer.bottom;

for (const [requirement, sizes, min, max] of [
  ['VIS-01', [[1440, 900], [1280, 720]], 420, 560],
  ['VIS-02', [[390, 844], [360, 740]], 280, 440]
]) {
  for (const [width, height] of sizes) {
    test(`${requirement} celular do hero inteiro dentro do hero, com altura entre ${min} e ${max}px, em ${width}x${height}`, async ({ page }) => {
      await gotoAt(page, width, height);
      const phone = page.locator('.hero-device img');
      await expect(phone).toBeVisible();
      const box = await rectOf(phone);
      const hero = await rectOf(page.locator('.hero'));
      expect(inside(box, hero), JSON.stringify({ box, hero })).toBe(true);
      expect(box.height).toBeGreaterThanOrEqual(min);
      expect(box.height).toBeLessThanOrEqual(max);
    });
  }
}

for (const [width, height] of [[1440, 900], [1280, 720], [820, 1180], [390, 844], [360, 740]]) {
  test(`VIS-03 legendas de ilustração não cobrem o celular mais próximo em ${width}x${height}`, async ({ page }) => {
    await gotoAt(page, width, height);
    const list = page.locator(captions);
    const count = await list.count();
    expect(count).toBeGreaterThan(0);
    let checked = 0;
    for (let i = 0; i < count; i++) {
      const caption = list.nth(i);
      if (!(await caption.isVisible())) continue;
      await caption.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(700);
      const result = await caption.evaluate((el, selector) => {
        const center = r => [r.left + r.width / 2, r.top + r.height / 2];
        const own = el.getBoundingClientRect();
        const [cx, cy] = center(own);
        const phones = [...document.querySelectorAll(selector)]
          .map(phone => phone.getBoundingClientRect())
          .filter(r => r.width && r.height)
          .map(r => ({ r: r.toJSON(), d: Math.hypot(center(r)[0] - cx, center(r)[1] - cy) }))
          .sort((a, b) => a.d - b.d);
        return { text: el.textContent.trim(), caption: own.toJSON(), phone: phones[0]?.r };
      }, phoneImages);
      expect(result.phone, result.text).toBeTruthy();
      expect(rectsIntersect(result.caption, result.phone), JSON.stringify(result)).toBe(false);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });
}
