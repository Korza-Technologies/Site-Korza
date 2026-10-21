import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { gotoAt } from '../helpers.js';
import { cases, CASES_PERIOD } from '../../js/cases-data.js';
import { waLink } from '../../js/whatsapp.js';

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

test('CASES-03 o extra do diálogo de cada case é o número aprovado em data-report.md e não está no card', () => {
  for (const item of Object.values(cases)) {
    const row = reportRow(item.name);
    expect(item.extra, item.name).toContain(percent(row[6]));
    expect(item.extra, item.name).not.toContain(item.metric);
  }
  expect(Object.fromEntries(Object.values(cases).map(item => [item.name, percent(item.extra)])))
    .toEqual({ Loum: '13,7%', Hiven: '3,8%', Belletonn: '11%', 'Pé de Algodão': '3,4%' });
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`CASES-03 o diálogo de cada case mostra uma métrica fora do card, o período e "Quero um resultado assim" em ${width}x${height}`, async ({ page }) => {
    await gotoAt(page, width, height);
    const dialog = page.locator('#feature-dialog');
    for (const [id, item] of Object.entries(cases)) {
      const trigger = page.locator(`[data-case="${id}"]`);
      await trigger.evaluate(el => {
        const card = el.closest('.story-card');
        card.closest('.story-carousel').scrollTo({ left: card.offsetLeft - card.parentElement.firstElementChild.offsetLeft, behavior: 'instant' });
      });
      const cardText = await trigger.evaluate(el => el.closest('.story-card').textContent);
      await trigger.click();
      await expect(dialog, id).toBeVisible();
      await expect(page.locator('#dialog-label'), id).toHaveText(`Case Korza · ${item.name}`);
      await expect(page.locator('#dialog-title'), id).toHaveText(item.title);

      const extra = page.locator('#dialog-extra');
      await expect(extra, id).toBeVisible();
      await expect(extra, id).toHaveText(item.extra);
      expect(cardText.includes(percent(item.extra)), id).toBe(false);

      const period = page.locator('#dialog-period');
      await expect(period, id).toBeVisible();
      await expect(period, id).toHaveText(`Período: ${REPORT_PERIOD}`);

      const link = dialog.getByRole('link', { name: 'Quero um resultado assim', exact: true });
      await expect(link, id).toBeVisible();
      await expect(link, id).toHaveAttribute('href', waLink('case', item.name));
      expect(new URL(await link.getAttribute('href')).searchParams.get('text'), id).toBe(`Oi! Vi o case da ${item.name} no site e quero um resultado parecido.`);
      await expect(link, id).toHaveAttribute('target', '_blank');
      await expect(link, id).toHaveAttribute('rel', /\bnoopener\b/);
      await expect(page.locator('#dialog-note'), id).toContainText('O desempenho varia entre operações.');

      await page.keyboard.press('Escape');
      await expect(dialog, id).toBeHidden();
    }
  });
}

test('CASES-03 diálogo de recurso aberto depois de um case não mostra o bloco do case nem o WhatsApp do case', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  await page.locator('[data-case="loum"]').click();
  await expect(page.locator('#dialog-case')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('[data-feature="push"]').click();
  await expect(page.locator('#dialog-title')).toHaveText('Bons motivos para voltar.');
  await expect(page.locator('#dialog-case')).toBeHidden();
  await expect(page.locator('#feature-dialog a[href^="https://wa.me/"]')).toHaveCount(0);
});
