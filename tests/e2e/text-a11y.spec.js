import { test, expect } from '@playwright/test';
import { gotoAt, scrollToEnd, smallText } from '../helpers.js';

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`A11Y-02 nenhum texto fora de ilustrações abaixo de 12px em ${width}x${height}`, async ({ page }) => {
    await gotoAt(page, width, height);
    expect(await smallText(page, 12)).toEqual([]);
    await scrollToEnd(page);
    expect(await smallText(page, 12)).toEqual([]);
  });
}

test('A11Y-07 faixa de logos sem alt repetido e sem nome genérico', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const alts = await page.locator('.logo-marquee img').evaluateAll(images => images
    .filter(img => !img.closest('[aria-hidden="true"]'))
    .map(img => img.getAttribute('alt')));
  expect(alts.length).toBeGreaterThan(0);
  expect(alts.every(alt => alt !== null)).toBe(true);
  const named = alts.filter(alt => alt.trim() !== '');
  expect(named.length).toBeGreaterThan(0);
  expect(new Set(named).size).toBe(named.length);
  // Logos without a known name are decorative (alt=""), never a generic placeholder.
  expect(named.filter(alt => /marca cliente|logo|cliente da korza/i.test(alt))).toEqual([]);
});

test('A11Y-08 ilustrações com role="img" e aria-label ou aria-hidden', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const containers = await page.locator('[data-illustration]').evaluateAll(nodes => nodes.map(node => ({
    cls: node.className?.baseVal ?? node.className,
    role: node.getAttribute('role'),
    label: (node.getAttribute('aria-label') || '').trim(),
    hidden: node.getAttribute('aria-hidden')
  })));
  expect(containers.length).toBeGreaterThan(0);
  for (const node of containers) {
    const ok = (node.role === 'img' && node.label.length > 0) || node.hidden === 'true';
    expect(ok, JSON.stringify(node)).toBe(true);
  }
});
