import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

const transparent = value => value === 'transparent' || /rgba\(\d+, \d+, \d+, 0\)/.test(value);

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test.describe(`botões em ${width}x${height}`, () => {
    test.beforeEach(async ({ page }) => { await gotoAt(page, width, height); });

    test('BTN-01 selos das lojas são legenda, não botões', async ({ page }) => {
      const marks = page.locator('.app-card .store-marks');
      await expect(marks).toBeVisible();
      await expect(marks).toContainText('Publicado na App Store e no Google Play');
      await expect(marks.locator('a, button')).toHaveCount(0);
      await expect(marks.locator('use[href="#apple-mark"]')).toHaveCount(1);
      await expect(marks.locator('use[href="#play-mark"]')).toHaveCount(1);
      const backgrounds = await marks.evaluate(root => [root, ...root.querySelectorAll('*')]
        .map(el => getComputedStyle(el).backgroundColor));
      for (const background of backgrounds) expect(transparent(background), background).toBe(true);
    });

    test('BTN-02 categorias dos cases como texto, iguais às dos cards', async ({ page }) => {
      const { items, cards, styles } = await page.evaluate(() => {
        const list = document.querySelector('#cases .story-benefits');
        const nodes = [...list.children];
        const norm = text => text.trim().toLocaleUpperCase('pt-BR');
        return {
          items: nodes.map(node => norm(node.textContent)),
          cards: [...document.querySelectorAll('#cases .story-card .case-category')].map(node => norm(node.textContent)),
          styles: [list, ...nodes].map(node => {
            const cs = getComputedStyle(node);
            return { border: cs.borderTopWidth + cs.borderRightWidth + cs.borderBottomWidth + cs.borderLeftWidth, background: cs.backgroundColor, cursor: cs.cursor };
          })
        };
      });
      const expected = [...new Set(cards)];
      expect(expected.length).toBeGreaterThan(0);
      expect(items).toEqual(expected);
      for (const style of styles) {
        expect(style.border).toBe('0px0px0px0px');
        expect(transparent(style.background), style.background).toBe(true);
        expect(style.cursor).toBe('auto');
      }
      await expect(page.locator('#cases .story-benefits')).toBeVisible();
    });

    test('BTN-03 seletor de marca com rótulo visível e alvos de 44px', async ({ page }) => {
      const group = page.locator('.brand-picker[role="group"]');
      const labelId = await group.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();
      const label = page.locator(`[id="${labelId}"]`);
      await expect(label).toBeVisible();
      await expect(label).toHaveText('Veja o app de:');
      await expect(group).toHaveAccessibleName('Veja o app de:');
      const buttons = group.locator('button');
      await expect(buttons).toHaveCount(3);
      for (const button of await buttons.all()) {
        await expect(button).toBeVisible();
        const box = await button.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        const fontSize = await button.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
        expect(fontSize).toBeGreaterThanOrEqual(14);
      }
    });
  });
}
