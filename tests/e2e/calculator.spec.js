import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

const TICKET_ERROR = 'Informe um ticket médio entre R$ 1 e R$ 100.000.';
const MARGIN_ERROR = 'Informe uma margem entre 1% e 100%.';
const sentence = n => `O plano se paga com ${n} ${n === 1 ? 'pedido' : 'pedidos'} por mês pelo app.`;
const ANY_N = /\d+ pedidos?/;

const fields = page => ({
  ticket: page.locator('#precos').getByLabel('Ticket médio (R$)', { exact: true }),
  margin: page.locator('#precos').getByLabel('Margem (%)', { exact: true }),
  // The result is the polite live region of the pricing section.
  result: page.locator('#precos [aria-live="polite"]')
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test.describe(`calculadora em ${width}x${height}`, () => {
    test.beforeEach(async ({ page }) => { await gotoAt(page, width, height); });

    test('CALC-01 campos "Ticket médio (R$)" = 180 e "Margem (%)" = 30 com label, no card de preço', async ({ page }) => {
      const { ticket, margin, result } = fields(page);
      await ticket.scrollIntoViewIfNeeded();
      await expect(ticket).toBeVisible();
      await expect(ticket).toHaveValue('180');
      await expect(margin).toBeVisible();
      await expect(margin).toHaveValue('30');
      await expect(result).toHaveCount(1);
      await expect(result).toHaveText(sentence(8));
    });

    test('CALC-04 o resultado muda ao digitar, sem botão e sem recarregar, numa região aria-live="polite"', async ({ page }) => {
      const { ticket, margin, result } = fields(page);
      await page.evaluate(() => { window.__samePage = true; });
      const url = page.url();
      await ticket.fill('399');
      await margin.fill('100');
      await expect(result).toHaveText(sentence(1));
      await ticket.fill('100');
      await margin.fill('50');
      await expect(result).toHaveText(sentence(8));
      await expect(result).toHaveAttribute('aria-live', 'polite');
      expect(await page.evaluate(() => window.__samePage)).toBe(true);
      expect(page.url()).toBe(url);
      // Nothing to click: the calculator has no button.
      const calculator = page.locator('#precos').locator('div', { has: ticket }).filter({ has: result }).last();
      await expect(calculator.locator('button, input[type="submit"], input[type="button"]')).toHaveCount(0);
    });

    test('CALC-05 ticket inválido mostra a mensagem do ticket e nenhum N', async ({ page }) => {
      const { ticket, result } = fields(page);
      for (const value of ['', 'abc', '0', '-5', '100001']) {
        await ticket.fill(value);
        await expect(result, value).toHaveText(TICKET_ERROR);
        await expect(result, value).not.toHaveText(ANY_N);
      }
      await ticket.fill('100000');
      await expect(result).toHaveText(sentence(1));
    });

    test('CALC-06 margem inválida mostra a mensagem da margem e nenhum N', async ({ page }) => {
      const { margin, result } = fields(page);
      for (const value of ['', 'abc', '0', '101']) {
        await margin.fill(value);
        await expect(result, value).toHaveText(MARGIN_ERROR);
        await expect(result, value).not.toHaveText(ANY_N);
      }
      await margin.fill('100');
      await expect(result).toHaveText(sentence(3));
    });

    test('CALC-07 ticket com vírgula decimal: "179,90" com margem 100% → 3 pedidos', async ({ page }) => {
      const { ticket, margin, result } = fields(page);
      await ticket.fill('179,90');
      await margin.fill('100');
      await expect(result).toHaveText(sentence(3));
    });
  });
}

test('Edge case: sem JavaScript a calculadora já mostra "8 pedidos"', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await gotoAt(page, 390, 844);
  const { ticket, margin, result } = fields(page);
  await expect(ticket).toHaveValue('180');
  await expect(margin).toHaveValue('30');
  await result.scrollIntoViewIfNeeded();
  await expect(result).toBeVisible();
  await expect(result).toHaveText(sentence(8));
  await context.close();
});
