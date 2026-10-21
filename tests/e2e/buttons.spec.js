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

// Every point of a 44x44 square centred on the control must hit the control itself.
async function hitArea44(locator) {
  return locator.evaluate(el => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const misses = [];
    for (let dx = -21.5; dx <= 21.5; dx += 4.3) {
      for (let dy = -21.5; dy <= 21.5; dy += 4.3) {
        const hit = document.elementFromPoint(cx + dx, cy + dy);
        if (!el.contains(hit)) misses.push([Math.round(dx), Math.round(dy), hit?.className || hit?.tagName]);
      }
    }
    return misses;
  });
}

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test.describe(`controles e CTAs em ${width}x${height}`, () => {
    test.beforeEach(async ({ page }) => { await gotoAt(page, width, height); });

    test('BTN-04 pontos e setas do carrossel com área clicável ≥ 44x44', async ({ page }) => {
      const controls = page.locator('#cases .story-dots button, #cases .story-prev, #cases .story-next');
      await expect(controls).toHaveCount(6);
      for (const control of await controls.all()) {
        await control.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForTimeout(100);
        expect(await hitArea44(control), await control.getAttribute('aria-label')).toEqual([]);
      }
    });

    test('BTN-05 card de preço sem link para /login', async ({ page }) => {
      await expect(page.locator('.plan-price')).toHaveCount(1);
      const loginLinks = await page.locator('.plan-price a').evaluateAll(links =>
        links.filter(link => /\/login\/?$/.test(new URL(link.href, location.href).pathname)).length);
      expect(loginLinks).toBe(0);
    });

    test('BTN-06 selo acima do título leva aos cases e cita 60+', async ({ page }) => {
      const badge = page.locator('.hero h1').locator('xpath=preceding-sibling::*[1]');
      await expect(badge).toBeVisible();
      await expect(badge).toHaveAttribute('href', '#cases');
      await expect(badge).toContainText('60+');
      const [b, h1] = [await badge.boundingBox(), await page.locator('.hero h1').boundingBox()];
      expect(b.y + b.height).toBeLessThanOrEqual(h1.y);
    });

    test('BTN-07 pergunta dos objetivos antes do botão no DOM e na tela', async ({ page }) => {
      const cta = page.locator('#resultados .goals-cta');
      const button = cta.locator('a.button');
      const question = cta.getByText('Vamos dar o próximo passo?');
      await expect(button).toBeVisible();
      await expect(question).toBeVisible();
      const before = await question.evaluate((q, btn) => Boolean(q.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING), await button.elementHandle());
      expect(before).toBe(true);
      const [q, btn] = [await question.boundingBox(), await button.boundingBox()];
      expect(q.y).toBeLessThan(btn.y);
    });
  });
}
