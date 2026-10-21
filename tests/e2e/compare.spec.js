import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

// COMP-01: the four rows from the spec Assumptions, in order.
const ROWS = [
  'Ícone na tela inicial',
  'Push na tela bloqueada sem pagar por clique',
  'Presença na App Store e no Google Play com a marca',
  'Painel com vendas e recompras do app'
];

test('COMP-01 tabela semântica com colunas "Site mobile" e "App Korza" e exatamente as 4 linhas da spec', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const table = page.locator('#comparativo table');
  await expect(table).toHaveCount(1);
  await table.scrollIntoViewIfNeeded();
  await expect(table).toBeVisible();

  const columns = await table.locator('thead th').evaluateAll(cells => cells.map(cell => cell.textContent.replace(/\s+/g, ' ').trim()));
  expect(columns).toHaveLength(3);
  expect(columns.slice(1)).toEqual(['Site mobile', 'App Korza']);
  await expect(table.getByRole('columnheader', { name: 'Site mobile', exact: true })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'App Korza', exact: true })).toBeVisible();

  const rows = table.locator('tbody tr');
  await expect(rows).toHaveCount(4);
  const rowHeaders = await table.locator('tbody tr > th').evaluateAll(cells => cells.map(cell => cell.textContent.replace(/\s+/g, ' ').trim()));
  expect(rowHeaders).toEqual(ROWS);
  for (const name of ROWS) await expect(table.getByRole('rowheader', { name, exact: true })).toBeVisible();
  // Each row has one cell per column.
  for (const cells of await rows.evaluateAll(list => list.map(row => row.querySelectorAll('td').length))) expect(cells).toBe(2);
});

test('COMP-01 o comparativo vem antes da seção de preço', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const before = await page.locator('#comparativo').evaluate(section =>
    Boolean(section.compareDocumentPosition(document.querySelector('#precos')) & Node.DOCUMENT_POSITION_FOLLOWING));
  expect(before).toBe(true);
});

for (const [width, height] of [[390, 844], [360, 740]]) {
  test(`COMP-02 a tabela cabe na largura sem rolagem horizontal do documento em ${width}x${height}`, async ({ page }) => {
    await gotoAt(page, width, height);
    const table = page.locator('#comparativo table');
    await table.scrollIntoViewIfNeeded();
    await expect(table).toBeVisible();
    const box = await table.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
}
