import { test, expect } from '@playwright/test';
import { gotoAt, resources } from '../helpers.js';

const fontExt = /\.(woff2?|ttf|otf|eot)$/i;

test('PERF-06 toda fonte carregada está em WOFF2', async ({ page }) => {
  const fonts = [];
  page.on('response', response => {
    const path = new URL(response.url()).pathname;
    if (response.request().resourceType() === 'font' || fontExt.test(path)) fonts.push(response);
  });
  await gotoAt(page, 1440, 900);
  await page.evaluate(() => document.fonts.ready);
  expect(fonts.length).toBeGreaterThan(0);
  for (const response of fonts) {
    expect(new URL(response.url()).pathname).toMatch(/\.woff2$/);
    expect(response.headers()['content-type']).toBe('font/woff2');
    const body = await response.body();
    expect(body.subarray(0, 4).toString('latin1')).toBe('wOF2');
  }
  const urls = (await resources(page)).map(item => new URL(item.url).pathname);
  expect(urls.filter(path => fontExt.test(path) && !path.endsWith('.woff2'))).toEqual([]);
});

test('PERF-06 o texto é renderizado com Jakarta, não com a fonte de fallback', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  await page.evaluate(() => document.fonts.ready);
  const client = await page.context().newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  const { root } = await client.send('DOM.getDocument');
  for (const selector of ['h1', '.hero-copy > p', '.hero-copy .button']) {
    const { nodeId } = await client.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    const { fonts } = await client.send('CSS.getPlatformFontsForNode', { nodeId });
    expect(fonts.length, selector).toBeGreaterThan(0);
    for (const font of fonts) {
      expect(font.familyName, selector).toContain('Jakarta');
      expect(font.isCustomFont, selector).toBe(true);
    }
  }
});
