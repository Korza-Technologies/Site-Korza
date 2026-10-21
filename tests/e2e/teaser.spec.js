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
