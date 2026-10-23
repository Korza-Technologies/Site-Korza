import { test, expect } from '@playwright/test';
import { gotoAt, rectsIntersect } from '../helpers.js';

const pageRect = locator => locator.evaluate(el => {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
});

for (const [width, height] of [[390, 844], [360, 740]]) {
  test.describe(`hero mobile em ${width}x${height}`, () => {
    test.beforeEach(async ({ page }) => { await gotoAt(page, width, height); });

    test('MOB-01 mockup do app visível, com altura ≥ 200px e topo ≤ 900px', async ({ page }) => {
      const mockup = page.locator('.hero-scene .hero-device img');
      await expect(mockup).toBeVisible();
      const rect = await pageRect(mockup);
      expect(rect.height).toBeGreaterThanOrEqual(200);
      expect(rect.y).toBeLessThanOrEqual(900);
      const loaded = await mockup.evaluate(img => img.complete && img.naturalWidth > 0);
      expect(loaded).toBe(true);
    });

    test('MOB-02 CTA principal com fonte ≥ 16px, altura ≥ 48px e largura da coluna', async ({ page }) => {
      const cta = page.locator('.hero .signup-cta');
      const { fontSize, box, column } = await cta.evaluate(el => {
        const copy = el.closest('.hero-copy');
        const cs = getComputedStyle(copy);
        return {
          fontSize: parseFloat(getComputedStyle(el).fontSize),
          box: el.getBoundingClientRect().toJSON(),
          column: copy.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
        };
      });
      expect(fontSize).toBeGreaterThanOrEqual(16);
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(Math.abs(box.width - column)).toBeLessThanOrEqual(2);
    });

    test('MOB-03 fita decorativa visível não intercepta o h1', async ({ page }) => {
      const visible = await page.evaluate(() => {
        const ribbon = document.querySelector('.hero-ribbon');
        const style = getComputedStyle(ribbon);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return null;
        // The hero clips its overflow, so the visible part is the ribbon box inside the hero box.
        const r = ribbon.getBoundingClientRect();
        const h = ribbon.closest('.hero').getBoundingClientRect();
        const x = Math.max(r.left, h.left), y = Math.max(r.top, h.top);
        const right = Math.min(r.right, h.right), bottom = Math.min(r.bottom, h.bottom);
        return right > x && bottom > y ? { x, y, width: right - x, height: bottom - y } : null;
      });
      const h1 = await page.locator('.hero h1').boundingBox();
      // The ribbon is brand art kept on mobile (T9): it must be on screen, and clear of the title.
      expect(visible).not.toBeNull();
      expect(rectsIntersect(visible, h1)).toBe(false);
    });
  });
}

test('MOB-02 CTA largo também no limite de 760px', async ({ page }) => {
  await gotoAt(page, 760, 900);
  const cta = page.locator('.hero .signup-cta');
  const { fontSize, box, column } = await cta.evaluate(el => ({
    fontSize: parseFloat(getComputedStyle(el).fontSize),
    box: el.getBoundingClientRect().toJSON(),
    column: el.closest('.hero-copy').clientWidth
  }));
  expect(fontSize).toBeGreaterThanOrEqual(16);
  expect(box.height).toBeGreaterThanOrEqual(48);
  expect(Math.abs(box.width - column)).toBeLessThanOrEqual(2);
});

test('MOB-06 celular deitado 844x390: header ≤ 64px e CTA inteiro na primeira tela', async ({ page }) => {
  await gotoAt(page, 844, 390);
  const header = await page.locator('.header').boundingBox();
  expect(header.height).toBeLessThanOrEqual(64);
  const cta = page.locator('.hero .signup-cta');
  await expect(cta).toBeVisible();
  const box = await cta.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(header.y + header.height);
  expect(box.y + box.height).toBeLessThanOrEqual(390);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(844);
  // Nothing fixed (header, pause control) covers the CTA: its corners hit the CTA itself.
  const uncovered = await cta.evaluate(el => {
    const r = el.getBoundingClientRect();
    return [[r.left + 2, r.top + 2], [r.right - 2, r.top + 2], [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2]]
      .every(([x, y]) => el.contains(document.elementFromPoint(x, y)));
  });
  expect(uncovered).toBe(true);
});
