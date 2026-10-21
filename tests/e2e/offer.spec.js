import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

const CTA = 'Montar meu app grátis';
const signupLinks = page => page.locator('a[href^="https://admin.korza.app/create-account"]');

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`OFFER-01 todo link de cadastro diz "${CTA}" em ${width}x${height}`, async ({ page }) => {
    await gotoAt(page, width, height);
    const labels = await signupLinks(page).evaluateAll(links => links.map(link => link.textContent.replace(/\s+/g, ' ').trim()));
    // Header, menu, hero, platform, goals, pricing, FAQ, closing, footer, sticky bar and dialog.
    expect(labels.length).toBeGreaterThanOrEqual(11);
    expect(labels.filter(label => label !== CTA)).toEqual([]);
  });
}

test('OFFER-01 sem JavaScript os links de cadastro já dizem o mesmo texto', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await gotoAt(page, 1440, 900);
  const labels = await signupLinks(page).evaluateAll(links => links.map(link => link.textContent.replace(/\s+/g, ' ').trim()));
  expect(labels.length).toBeGreaterThanOrEqual(11);
  expect(labels.filter(label => label !== CTA)).toEqual([]);
  await context.close();
});
