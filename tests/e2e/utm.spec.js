import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

const SIGNUP = 'https://admin.korza.app/create-account';
const signupHrefs = page => page.locator(`a[href^="${SIGNUP}"]`).evaluateAll(links => links.map(link => link.getAttribute('href')));

test('ANALYTICS-05 todo link de cadastro recebe os utm_* da página e nenhum outro parâmetro', async ({ page }) => {
  await gotoAt(page, 1440, 900, '/?utm_source=ig&utm_campaign=x&foo=1');
  const hrefs = await signupHrefs(page);
  // Header, menu, hero, platform, goals, pricing, FAQ, closing, footer, sticky bar and dialog.
  expect(hrefs.length).toBeGreaterThanOrEqual(11);
  for (const href of hrefs) {
    const url = new URL(href);
    expect(url.searchParams.get('utm_source'), href).toBe('ig');
    expect(url.searchParams.get('utm_campaign'), href).toBe('x');
    expect(url.searchParams.has('foo'), href).toBe(false);
    expect(href).toBe(`${SIGNUP}?utm_source=ig&utm_campaign=x`);
  }
});

test('Edge case: utm_source repetido na URL chega ao cadastro só com a primeira ocorrência', async ({ page }) => {
  await gotoAt(page, 1440, 900, '/?utm_source=a&utm_source=b');
  const hrefs = await signupHrefs(page);
  expect(hrefs.length).toBeGreaterThanOrEqual(11);
  for (const href of hrefs) expect(new URL(href).searchParams.getAll('utm_source'), href).toEqual(['a']);
});

test('ANALYTICS-05 sem utm_* na URL os links de cadastro ficam como no HTML', async ({ page }) => {
  await gotoAt(page, 1440, 900, '/?foo=1');
  const hrefs = await signupHrefs(page);
  expect(hrefs.length).toBeGreaterThanOrEqual(11);
  expect(hrefs.filter(href => href !== SIGNUP)).toEqual([]);
});
