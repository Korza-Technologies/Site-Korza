import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

const rgb = hex => `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
const device = page => page.locator('.hero .hero-device');
const photo = page => page.locator('.hero .hero-device img');
const render = page => page.locator('.hero .app-render');

test.describe('T3 app desenhado no hero', () => {
  test('PREVIEW-03 com is-custom, aba ativa, botão e banner usam exatamente --brand e o texto usa --on-brand', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await device(page).evaluate(el => {
      el.classList.add('is-custom');
      el.style.setProperty('--brand', '#E11D48');
      el.style.setProperty('--on-brand', '#0f1a33');
    });
    await expect(render(page)).toBeVisible();
    await expect(photo(page)).toBeHidden();
    const colors = await render(page).evaluate(root => {
      const cs = selector => getComputedStyle(root.querySelector(selector));
      return {
        banner: cs('.app-banner').backgroundColor,
        bannerText: cs('.app-banner').color,
        button: cs('.app-button').backgroundColor,
        buttonText: cs('.app-button').color,
        tab: cs('.app-tab.is-active').color,
        otherTab: cs('.app-tab:not(.is-active)').color
      };
    });
    expect(colors.banner).toBe(rgb('#E11D48'));
    expect(colors.button).toBe(rgb('#E11D48'));
    expect(colors.tab).toBe(rgb('#E11D48'));
    expect(colors.otherTab).not.toBe(rgb('#E11D48'));
    expect(colors.bannerText).toBe(rgb('#0f1a33'));
    expect(colors.buttonText).toBe(rgb('#0f1a33'));
  });

  test('PREVIEW-03 sem is-custom a foto real aparece e o app desenhado não', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await expect(photo(page)).toBeVisible();
    await expect(render(page)).toBeHidden();
    await expect(render(page)).toHaveAttribute('aria-hidden', 'true');
  });
});

const PALETTE = ['#155DFC', '#0F1A33', '#E11D48', '#16A34A', '#F59E0B', '#7C3AED'];
const nameField = page => page.locator('.hero').getByLabel('Nome da sua loja', { exact: true });
const accents = page => render(page).evaluate(root => ['.app-banner', '.app-button'].map(s => getComputedStyle(root.querySelector(s)).backgroundColor)
  .concat(getComputedStyle(root.querySelector('.app-tab.is-active')).color));
const shownNames = page => render(page).evaluate(root => [root.querySelector('.app-header .app-name').textContent, root.querySelector('.app-push .app-push-name').textContent]);

test.describe('T4 formulário do teaser', () => {
  test('PREVIEW-01 campo "Nome da sua loja" com maxlength 24, 6 cores e "outra cor" visíveis', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    const field = nameField(page);
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute('maxlength', '24');
    const group = page.getByRole('group', { name: 'Cor da marca' });
    const radios = group.getByRole('radio');
    await expect(radios).toHaveCount(6);
    expect(await radios.evaluateAll(list => list.map(radio => radio.value.toUpperCase()))).toEqual(PALETTE);
    const other = group.getByLabel('Outra cor', { exact: true });
    await expect(other).toHaveAttribute('type', 'color');
    await expect(other).toBeVisible();
  });

  test('PREVIEW-01 teclado opera nome, cores e "outra cor"', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await nameField(page).focus();
    await page.keyboard.type('Loja da Ana');
    await expect.poll(() => shownNames(page)).toEqual(['Loja da Ana', 'Loja da Ana']);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('radio', { name: 'Azul', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Azul-marinho', exact: true })).toBeChecked();
    await expect.poll(() => accents(page)).toEqual(Array(3).fill(rgb('#0F1A33')));
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => accents(page)).toEqual(Array(3).fill(rgb('#E11D48')));
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Outra cor', { exact: true })).toBeFocused();
  });

  test('PREVIEW-02 digitar "Loja da Ana" mostra o nome no cabeçalho e no push em até 150ms', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await expect(photo(page)).toBeVisible();
    const elapsed = await page.evaluate(() => new Promise(resolve => {
      const input = document.querySelector('#teaser-name');
      const targets = [document.querySelector('.app-header .app-name'), document.querySelector('.app-push .app-push-name')];
      const start = performance.now();
      input.value = 'Loja da Ana';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      (function check() {
        if (targets.every(el => el.textContent === 'Loja da Ana')) resolve(performance.now() - start);
        else if (performance.now() - start > 2000) resolve(Infinity);
        else setTimeout(check, 2);
      })();
    }));
    expect(elapsed).toBeLessThanOrEqual(150);
    await expect(render(page)).toBeVisible();
    await expect(photo(page)).toBeHidden();
    await expect(render(page).locator('.app-header .app-name')).toBeVisible();
    await expect(render(page).locator('.app-push .app-push-name')).toBeVisible();
  });

  test('PREVIEW-03 cada uma das 6 cores e "outra cor" viram exatamente a cor do banner, do botão e da aba ativa', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    for (const color of [...PALETTE.slice(1), PALETTE[0]]) {
      await page.locator(`.brand-teaser input[type="radio"][value="${color}"]`).check();
      await expect.poll(() => accents(page), color).toEqual(Array(3).fill(rgb(color)));
    }
    await page.getByLabel('Outra cor', { exact: true }).fill('#123456');
    await expect.poll(() => accents(page)).toEqual(Array(3).fill(rgb('#123456')));
    expect(await page.locator('.brand-teaser input[type="radio"]:checked').count()).toBe(0);
  });

  test('Edge case: cor com pouco contraste com o branco deixa o texto do banner e do botão escuro', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await page.locator('.brand-teaser input[value="#F59E0B"]').check();
    await expect.poll(() => render(page).evaluate(root => ['.app-banner', '.app-button'].map(s => getComputedStyle(root.querySelector(s)).color)))
      .toEqual([rgb('#0f1a33'), rgb('#0f1a33')]);
    await page.locator('.brand-teaser input[value="#155DFC"]').check();
    await expect.poll(() => render(page).evaluate(root => getComputedStyle(root.querySelector('.app-banner')).color)).toBe(rgb('#ffffff'));
  });

  test('PREVIEW-04 campo vazio ou só com espaços mostra "Sua Loja"', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await nameField(page).fill('Loja da Ana');
    await expect.poll(() => shownNames(page)).toEqual(['Loja da Ana', 'Loja da Ana']);
    await nameField(page).fill('');
    await expect.poll(() => shownNames(page)).toEqual(['Sua Loja', 'Sua Loja']);
    await nameField(page).fill('    ');
    await expect.poll(() => shownNames(page)).toEqual(['Sua Loja', 'Sua Loja']);
  });

  test('PREVIEW-05 HTML digitado aparece como texto literal e não cria elementos', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', dialog => { dialogs.push(dialog.message()); dialog.dismiss(); });
    await gotoAt(page, 1440, 900);
    const before = await page.locator('.hero img').count();
    const html = '<img onerror=alert(1)>';
    await nameField(page).fill(html);
    await expect.poll(() => shownNames(page)).toEqual([html, html]);
    await expect(render(page).locator('img')).toHaveCount(0);
    expect(await page.locator('.hero img').count()).toBe(before);
    await expect(page.locator('.teaser-live')).toHaveText(`Prévia atualizada: app da ${html}`);
    await page.waitForTimeout(200);
    expect(dialogs).toEqual([]);
  });

  test('Edge case: nome colado com mais de 24 caracteres é truncado em 24', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await nameField(page).focus();
    await page.keyboard.insertText('Loja Muito Comprida Demais Mesmo');
    await expect(nameField(page)).toHaveValue('Loja Muito Comprida Dema');
    await expect.poll(() => shownNames(page)).toEqual(['Loja Muito Comprida Dema', 'Loja Muito Comprida Dema']);
  });

  test('região aria-live anuncia "Prévia atualizada: app da NOME"', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    const live = page.locator('.brand-teaser [aria-live="polite"]');
    await expect(live).toHaveCount(1);
    await nameField(page).fill('Loja da Ana');
    await expect(live).toHaveText('Prévia atualizada: app da Loja da Ana');
  });

  for (const [width, height] of [[390, 844], [360, 740]]) {
    test(`PREVIEW-09 em ${width}px teaser e celular cabem sem rolagem horizontal e com alvos ≥ 44px`, async ({ page }) => {
      await gotoAt(page, width, height);
      await nameField(page).fill('Loja da Ana');
      await page.locator('.brand-teaser input[value="#16A34A"]').check();
      await expect(render(page)).toBeVisible();
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
      expect(scrollWidth).toBe(clientWidth);
      const targets = page.locator('.brand-teaser input, .brand-teaser button');
      expect(await targets.count()).toBeGreaterThanOrEqual(8);
      for (const target of await targets.all()) {
        if (!(await target.isVisible())) continue;
        const box = await target.boundingBox();
        const name = await target.evaluate(el => el.id || el.value);
        expect(box.width, name).toBeGreaterThanOrEqual(44);
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x, name).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      // F1 VIS-02 also holds for the drawn phone: whole inside the hero, 280–440px tall.
      const [phone, hero] = await Promise.all([render(page).boundingBox(), page.locator('.hero').boundingBox()]);
      expect(phone.height).toBeGreaterThanOrEqual(280);
      expect(phone.height).toBeLessThanOrEqual(440);
      expect(phone.x).toBeGreaterThanOrEqual(hero.x);
      expect(phone.y).toBeGreaterThanOrEqual(hero.y);
      expect(phone.x + phone.width).toBeLessThanOrEqual(hero.x + hero.width);
      expect(phone.y + phone.height).toBeLessThanOrEqual(hero.y + hero.height);
    });
  }

  test('Edge case: sem JavaScript o formulário fica oculto e o hero mostra a foto real', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await gotoAt(page, 390, 844);
    await expect(page.locator('.brand-teaser')).toBeHidden();
    await expect(page.locator('.brand-teaser')).toHaveAttribute('hidden', '');
    await expect(photo(page)).toBeVisible();
    await expect(render(page)).toBeHidden();
    await context.close();
  });
});
