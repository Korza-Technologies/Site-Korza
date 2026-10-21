import { test, expect } from '@playwright/test';
import { statSync } from 'node:fs';
import { gotoAt, scrollToEnd } from '../helpers.js';

async function servedSizes(page, pattern) {
  const served = new Map();
  page.on('response', async response => {
    const path = new URL(response.url()).pathname;
    if (pattern.test(path)) served.set(path, (await response.body()).length);
  });
  await gotoAt(page, 1440, 900);
  await scrollToEnd(page);
  return served;
}

test('PERF-04 logo da Shopify servido tem no máximo 20.000 bytes', async ({ page }) => {
  const served = await servedSizes(page, /shopify/i);
  expect(served.size).toBeGreaterThan(0);
  for (const [path, bytes] of served) {
    expect(bytes, path).toBeLessThanOrEqual(20_000);
    expect(statSync(path.slice(1)).size, path).toBeLessThanOrEqual(20_000);
  }
});

test('PERF-05 sprite de logos de clientes servido tem no máximo 250.000 bytes', async ({ page }) => {
  const served = await servedSizes(page, /client-logos/);
  expect(served.size).toBe(1);
  for (const [path, bytes] of served) {
    expect(bytes, path).toBeLessThanOrEqual(250_000);
    expect(statSync(path.slice(1)).size, path).toBeLessThanOrEqual(250_000);
  }
});

test('logos de clientes continuam recortados no emblema com conteúdo', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  await scrollToEnd(page);
  // Marquee copies outside the viewport stay lazy; load them to inspect every crop.
  await page.locator('.client-emblem img').evaluateAll(images => Promise.all(images.map(img => {
    img.loading = 'eager';
    return img.decode().catch(() => {});
  })));
  const crops = await page.locator('.client-emblem img').evaluateAll(images => images.map(img => {
    const emblem = img.parentElement.getBoundingClientRect();
    const box = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / box.width;
    const scaleY = img.naturalHeight / box.height;
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, 32, 32);
    context.drawImage(img, (emblem.left - box.left) * scaleX, (emblem.top - box.top) * scaleY, emblem.width * scaleX, emblem.height * scaleY, 0, 0, 32, 32);
    const { data } = context.getImageData(0, 0, 32, 32);
    let ink = 0;
    for (let i = 0; i < data.length; i += 4) if (255 * 3 - data[i] - data[i + 1] - data[i + 2] > 60) ink++;
    return { style: img.getAttribute('style'), loaded: img.complete && img.naturalWidth > 0, ratio: box.height / box.width, ink: ink / 1024 };
  }));
  expect(crops.length).toBeGreaterThanOrEqual(80);
  for (const crop of crops) {
    expect(crop.loaded, crop.style).toBe(true);
    expect(crop.ratio, crop.style).toBeCloseTo(2397 / 2721, 3);
    expect(crop.ink, crop.style).toBeGreaterThan(0.02);
  }
});
