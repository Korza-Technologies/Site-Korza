import { test, expect } from '@playwright/test';
import { readFileSync, statSync } from 'node:fs';
import { gotoAt } from '../helpers.js';

const meta = (page, key) => page.locator(`head meta[property="${key}"], head meta[name="${key}"]`);

async function imageSize(page, path) {
  return page.evaluate(src => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error(`não carregou ${src}`));
    img.src = src;
  }), path);
}

test.describe('prévia ao compartilhar', () => {
  test.beforeEach(async ({ page }) => { await gotoAt(page, 1440, 900); });

  test('META-01 metatags Open Graph e Twitter', async ({ page }) => {
    for (const key of ['og:title', 'og:description']) {
      await expect(meta(page, key)).toHaveCount(1);
      expect((await meta(page, key).getAttribute('content')).trim().length, key).toBeGreaterThan(0);
    }
    const expected = {
      'og:type': 'website',
      'og:locale': 'pt_BR',
      'og:url': 'https://korza.com.br/',
      'og:image': 'https://korza.com.br/assets/og-image.jpg',
      'og:image:width': '1200',
      'og:image:height': '630',
      'twitter:card': 'summary_large_image'
    };
    for (const [key, value] of Object.entries(expected)) {
      await expect(meta(page, key), key).toHaveCount(1);
      await expect(meta(page, key), key).toHaveAttribute('content', value);
    }
  });

  test('META-02 og-image.jpg com 1200x630 e no máximo 300.000 bytes', async ({ page }) => {
    const file = 'assets/og-image.jpg';
    expect(statSync(file).size).toBeLessThanOrEqual(300000);
    const bytes = readFileSync(file);
    expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xff, 0xd8, 0xff]);
    expect(await imageSize(page, '/' + file)).toEqual({ width: 1200, height: 630 });
  });

  test('META-03 apple-touch-icon aponta para um PNG 180x180 existente', async ({ page }) => {
    const link = page.locator('head link[rel="apple-touch-icon"]');
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute('href');
    const path = new URL(href, 'https://korza.com.br/').pathname.replace(/^\//, '');
    const bytes = readFileSync(path);
    expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(await imageSize(page, '/' + path)).toEqual({ width: 180, height: 180 });
  });
});
