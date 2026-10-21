import { test, expect } from '@playwright/test';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { gotoAt, scrollToEnd } from '../helpers.js';

const mockupName = /(hiven|loum|belletonn|pe-de-algodao)-mockup/;
const LIMIT = 200_000;

test('PERF-03 todo arquivo de mockup em assets/ tem no máximo 200.000 bytes', () => {
  const files = readdirSync('assets').filter(name => mockupName.test(name));
  expect(files.length).toBeGreaterThanOrEqual(4);
  for (const name of files) expect(statSync(`assets/${name}`).size, name).toBeLessThanOrEqual(LIMIT);
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`PERF-03 mockups servidos em ${width}x${height} têm no máximo 200.000 bytes`, async ({ page }) => {
    const served = new Map();
    page.on('response', async response => {
      const path = new URL(response.url()).pathname;
      if (mockupName.test(path)) served.set(path, (await response.body()).length);
    });
    await gotoAt(page, width, height);
    await scrollToEnd(page);
    await page.locator('#cases').scrollIntoViewIfNeeded();
    for (let i = 0; i < 4; i++) await page.locator('.story-next').click();
    await page.waitForLoadState('networkidle');
    const brands = [...served.keys()].map(path => path.match(mockupName)[1]);
    for (const brand of ['hiven', 'loum', 'belletonn', 'pe-de-algodao']) expect(brands, brand).toContain(brand);
    for (const [path, bytes] of served) expect(bytes, path).toBeLessThanOrEqual(LIMIT);
  });
}

test('sem suporte a AVIF a imagem WebP é usada: cada mockup tem fonte AVIF e WebP existentes', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const pictures = await page.locator('picture').evaluateAll(nodes => nodes
    .filter(node => /-mockup/.test(node.querySelector('img').getAttribute('src')))
    .map(node => ({
      types: [...node.querySelectorAll('source')].map(source => source.type),
      srcsets: [...node.querySelectorAll('source')].map(source => source.srcset),
      img: node.querySelector('img').getAttribute('src')
    })));
  expect(pictures.length).toBeGreaterThanOrEqual(6);
  for (const picture of pictures) {
    expect(picture.types).toEqual(['image/avif', 'image/webp']);
    expect(picture.img).toMatch(/\.webp$/);
    const files = picture.srcsets.flatMap(srcset => srcset.split(',').map(item => item.trim().split(/\s+/)[0]));
    for (const file of [...files, picture.img]) expect(existsSync(file), file).toBe(true);
  }
});

test('seletor de marca troca a imagem e o ícone para a marca escolhida', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const preview = page.locator('#brand-preview');
  await preview.scrollIntoViewIfNeeded();
  for (const [brand, name] of [['loum', 'Loum'], ['belletonn', 'Belletonn'], ['hiven', 'Hiven']]) {
    await page.locator(`[data-brand="${brand}"]`).click();
    await expect(page.locator(`[data-brand="${brand}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(preview).toHaveAttribute('alt', `Aplicativo ${name} com a identidade visual da marca`);
    await expect.poll(() => preview.evaluate(img => img.complete && img.naturalWidth > 0 && img.currentSrc)).toMatch(new RegExp(`/${brand}-mockup-\\d+\\.(avif|webp)$`));
    await expect(page.locator('#brand-icon-name')).toHaveText(name);
    await expect(page.locator('#brand-icon')).toHaveAttribute('alt', `Ícone do app ${name}`);
  }
});
