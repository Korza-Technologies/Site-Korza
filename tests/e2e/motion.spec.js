import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

const pauseButton = page => page.getByRole('button', { name: /animações$/ });

// Marks the pushes currently in the stack; a clone made by a new push does not carry the mark.
const markPushes = page => page.locator('.push-device .push-stack').evaluate(stack => [...stack.children].forEach(item => { item.seen = true; }));
const newPushes = page => page.locator('.push-device .push-stack').evaluate(stack => [...stack.children].filter(item => !item.seen).length);
const railLeft = page => page.locator('.story-carousel').evaluate(rail => rail.scrollLeft);
const revenue = page => page.locator('#push-revenue-total').textContent();
const marqueeState = page => page.locator('.lane-1 .logo-track').evaluate(track => getComputedStyle(track).animationPlayState);

async function view(page, selector) {
  await page.locator(selector).evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(150);
}

async function setup(page, width = 1440, height = 900) {
  await page.clock.install();
  await gotoAt(page, width, height);
}

async function expectFrozen(page) {
  expect(await marqueeState(page)).toBe('paused');

  await view(page, '.push-art');
  await markPushes(page);
  await page.clock.runFor(5000);
  expect(await newPushes(page)).toBe(0);

  await view(page, '.story-carousel');
  const left = await railLeft(page);
  await page.clock.runFor(8000);
  await page.waitForTimeout(800);
  expect(await railLeft(page)).toBe(left);

  await view(page, '.push-revenue-metric');
  await page.clock.runFor(100);
  const total = await revenue(page);
  await page.clock.runFor(5000);
  expect(await revenue(page)).toBe(total);
}

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`A11Y-03 botão "Pausar animações" visível no canto inferior esquerdo em ${width}x${height}`, async ({ page }) => {
    await gotoAt(page, width, height);
    const button = pauseButton(page);
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Pausar animações');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    const box = await button.boundingBox();
    expect(box.x).toBeLessThanOrEqual(24);
    expect(box.y + box.height).toBeGreaterThanOrEqual(height - 24);
    await page.mouse.wheel(0, 3000);
    await expect.poll(async () => (await button.boundingBox()).y + box.height).toBeGreaterThanOrEqual(height - 24);
  });
}

test('A11Y-04 pausar congela marquee, pushs, carrossel e faturamento', async ({ page }) => {
  await setup(page);
  const button = pauseButton(page);
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveText('Retomar animações');
  await expectFrozen(page);
});

test('A11Y-05 retomar faz as animações voltarem', async ({ page }) => {
  await setup(page);
  const button = pauseButton(page);
  await button.click();
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(button).toHaveText('Pausar animações');
  expect(await marqueeState(page)).toBe('running');

  await view(page, '.push-art');
  await markPushes(page);
  await page.clock.runFor(5000);
  expect(await newPushes(page)).toBeGreaterThan(0);

  await view(page, '.story-carousel');
  const left = await railLeft(page);
  await page.clock.runFor(8000);
  await expect.poll(() => railLeft(page)).not.toBe(left);

  await view(page, '.push-revenue-metric');
  await page.clock.runFor(100);
  const total = await revenue(page);
  await page.clock.runFor(5000);
  expect(await revenue(page)).not.toBe(total);
});

test('A11Y-06 com prefers-reduced-motion o comportamento é o do estado pausado', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page);
  await expectFrozen(page);
});

test('pausa continua ativa depois de trocar de aba e voltar', async ({ page }) => {
  await setup(page);
  const button = pauseButton(page);
  await button.click();
  await page.evaluate(() => {
    for (const hidden of [true, false]) {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') });
      document.dispatchEvent(new Event('visibilitychange'));
    }
  });
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expectFrozen(page);
});
