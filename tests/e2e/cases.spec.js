import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { gotoAt } from '../helpers.js';
import { cases, CASES_PERIOD } from '../../js/cases-data.js';

// Approved numbers, read from the data report (DATA-3): the card column and the site period label.
const report = readFileSync('.specs/features/lp-magia-cases/data-report.md', 'utf8');
const reportRow = name => report.split('\n').find(line => line.startsWith(`| **${name}** |`)).split('|').map(cell => cell.trim());
const percent = cell => cell.match(/(\d+(?:,\d+)?)%/)[1] + '%';
const REPORT_PERIOD = report.match(/rótulo no site: "([^"]+)"/)[1];
const NAMES = ['Loum', 'Hiven', 'Belletonn', 'Pé de Algodão'];

test('CASES-02 cases-data.js espelha os números aprovados em data-report.md', () => {
  expect(CASES_PERIOD).toBe(REPORT_PERIOD);
  expect(REPORT_PERIOD).toBe('jul–out 2026');
  for (const item of Object.values(cases)) {
    const row = reportRow(item.name);
    expect(item.metric, item.name).toBe(percent(row[5]));
    expect(item.period, item.name).toBe(REPORT_PERIOD);
  }
  expect(Object.fromEntries(Object.values(cases).map(item => [item.name, item.metric])))
    .toEqual({ Loum: '26,8%', Hiven: '68%', Belletonn: '20,7%', 'Pé de Algodão': '9,7%' });
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test.describe(`cases em ${width}x${height}`, () => {
    test.beforeEach(async ({ page }) => { await gotoAt(page, width, height); });

    test('CASES-01 a seção tem exatamente Loum, Hiven, Belletonn e Pé de Algodão', async ({ page }) => {
      const cards = page.locator('#cases .story-card');
      await expect(cards).toHaveCount(4);
      expect(await cards.evaluateAll(list => list.map(card => card.getAttribute('aria-label')))).toEqual(NAMES.map(name => `Case ${name}`));
      expect(await cards.evaluateAll(list => list.map(card => card.querySelector('.story-brand > span:last-child').textContent.trim()))).toEqual(NAMES);
      expect(Object.values(cases).map(item => item.name)).toEqual(NAMES);
    });

    test('CASES-02 cada card mostra a métrica aprovada, o texto dela e o período visível', async ({ page }) => {
      for (const [id, item] of Object.entries(cases)) {
        const card = page.locator('#cases .story-card').filter({ has: page.locator(`[data-case="${id}"]`) });
        await expect(card, id).toHaveCount(1);
        await card.evaluate(el => el.closest('.story-carousel').scrollTo({ left: el.offsetLeft - el.parentElement.firstElementChild.offsetLeft, behavior: 'instant' }));
        await card.scrollIntoViewIfNeeded();
        const metric = card.locator('.story-content > strong');
        await expect(metric, id).toHaveText(item.metric);
        await expect(metric, id).toBeVisible();
        await expect(card.locator('.story-description'), id).toHaveText(item.metricText);
        await expect(card.locator('.case-category'), id).toHaveText(item.category.toLocaleUpperCase('pt-BR'));
        const period = card.locator('.case-period');
        await expect(period, id).toHaveText(`Período: ${REPORT_PERIOD}`);
        await expect(period, id).toBeVisible();
        expect(await period.evaluate(el => parseFloat(getComputedStyle(el).fontSize)), id).toBeGreaterThanOrEqual(12);
      }
    });
  });
}

test('CASES-02 o aviso de que os resultados são específicos continua na seção', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  await expect(page.locator('#cases .fine-print')).toHaveText('Resultados específicos dos cases apresentados pela Korza. Não representam garantia de desempenho para outras operações.');
});
