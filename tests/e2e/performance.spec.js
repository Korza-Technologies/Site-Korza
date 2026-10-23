import { test, expect } from '@playwright/test';
import { gotoAt, scrollToEnd, resourceBytes } from '../helpers.js';

test('PERF-01 imagens e fontes somam no máximo 1.500.000 bytes sem rolar em 390x844', async ({ page }) => {
  await gotoAt(page, 390, 844);
  await page.waitForLoadState('networkidle');
  const bytes = await resourceBytes(page, ['image', 'font']);
  test.info().annotations.push({ type: 'bytes', description: String(bytes) });
  expect(bytes).toBeGreaterThan(0);
  expect(bytes).toBeLessThanOrEqual(1_500_000);
});

test('PERF-02 imagens e fontes somam no máximo 3.000.000 bytes após rolar até o fim em 390x844', async ({ page }) => {
  await gotoAt(page, 390, 844);
  await scrollToEnd(page);
  const bytes = await resourceBytes(page, ['image', 'font']);
  test.info().annotations.push({ type: 'bytes', description: String(bytes) });
  expect(bytes).toBeGreaterThan(0);
  expect(bytes).toBeLessThanOrEqual(3_000_000);
});
