import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

const bar = page => page.locator('.sticky-cta');
const barLink = page => bar(page).locator('a[href="https://admin.korza.app/create-account"]');

async function scrollTo(page, y) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
  await page.waitForTimeout(250);
}

async function expectHidden(page) {
  await expect(bar(page)).toBeHidden();
  const focused = await barLink(page).evaluate(link => { link.focus(); return document.activeElement === link; });
  expect(focused).toBe(false);
}

async function midPage(page) {
  // Hero fully above the viewport, pricing card and footer still below it.
  const y = await page.locator('#plataforma').evaluate(section => section.getBoundingClientRect().top + window.scrollY + 200);
  await scrollTo(page, y);
}

for (const width of [390, 760]) {
  test.describe(`MOB-04 barra fixa de CTA em ${width}px`, () => {
    test.beforeEach(async ({ page }) => { await gotoAt(page, width, 844); });

    test('oculta no topo, com o hero visível', async ({ page }) => {
      await expectHidden(page);
    });

    test('oculta enquanto uma parte do hero ainda aparece', async ({ page }) => {
      const bottom = await page.locator('.hero').evaluate(hero => hero.getBoundingClientRect().bottom + window.scrollY);
      await scrollTo(page, bottom - 60);
      await expectHidden(page);
    });

    test('visível no meio da página com o CTA principal', async ({ page }) => {
      await midPage(page);
      await expect(bar(page)).toBeVisible();
      await expect(barLink(page)).toBeVisible();
      await expect(barLink(page)).toContainText('Criar conta grátis');
      const box = await bar(page).boundingBox();
      expect(box.y + box.height).toBeCloseTo(844, 0);
      const focused = await barLink(page).evaluate(link => { link.focus(); return document.activeElement === link; });
      expect(focused).toBe(true);
    });

    test('oculta com o card de preço visível', async ({ page }) => {
      await midPage(page);
      await expect(bar(page)).toBeVisible();
      await page.locator('.plan-price').evaluate(card => card.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(250);
      await expectHidden(page);
    });

    test('oculta com o rodapé visível', async ({ page }) => {
      await midPage(page);
      await expect(bar(page)).toBeVisible();
      await page.locator('.footer').evaluate(footer => footer.scrollIntoView({ block: 'end', behavior: 'instant' }));
      await page.waitForTimeout(250);
      await expectHidden(page);
    });
  });
}

for (const width of [761, 1440]) {
  test(`MOB-05 barra nunca aparece em ${width}px`, async ({ page }) => {
    await gotoAt(page, width, 900);
    await expect(bar(page)).toHaveCount(1);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 450) {
      await scrollTo(page, y);
      await expect(bar(page), `y=${y}`).toBeHidden();
    }
  });
}

test('sem JavaScript a barra não aparece', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await gotoAt(page, 390, 844);
  await midPage(page);
  await expect(bar(page)).toHaveCount(1);
  await expect(bar(page)).toBeHidden();
  await context.close();
});
