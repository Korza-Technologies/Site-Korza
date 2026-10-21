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

const railLeft = page => page.locator('.story-carousel').evaluate(rail => rail.scrollLeft);
async function viewCarousel(page) {
  await page.locator('.story-carousel').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(150);
}
// Advances the fake clock past the autoplay interval and lets a smooth scroll settle.
// The rail must be on screen (autoplay only runs while ≥ 40% of it is visible), or "it did not move" proves nothing.
async function waitAutoplay(page, ms) {
  const visible = await page.locator('.story-carousel').evaluate(rail => {
    const r = rail.getBoundingClientRect();
    return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height;
  });
  expect(visible).toBeGreaterThanOrEqual(0.5);
  await page.clock.runFor(ms);
  await page.waitForTimeout(800);
}

test.describe('T9 carrossel de cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoAt(page, 1440, 900);
    await viewCarousel(page);
  });

  test('CASES-04 sem interação o carrossel avança sozinho em ~6,5s', async ({ page }) => {
    expect(await railLeft(page)).toBe(0);
    await page.clock.runFor(6600);
    await expect.poll(() => railLeft(page)).toBeGreaterThan(0);
    await expect(page.locator('[data-story="1"]')).toHaveAttribute('aria-current', 'true');
  });

  test('CASES-04 depois de um foco na seção o carrossel não volta a avançar, mesmo com o foco fora', async ({ page }) => {
    await page.locator('[data-case="loum"]').focus();
    await page.evaluate(() => document.activeElement.blur());
    await expect(page.locator('#cases :focus')).toHaveCount(0);
    await waitAutoplay(page, 8000);
    expect(await railLeft(page)).toBe(0);
  });

  test('CASES-04 depois de um clique na seção o carrossel não volta a avançar', async ({ page }) => {
    // A click outside the rail (the category list), without scrolling the page.
    const target = await page.locator('#cases .story-benefits').boundingBox();
    await page.mouse.click(target.x + 10, target.y + target.height / 2);
    await page.mouse.move(5, 5);
    await waitAutoplay(page, 8000);
    expect(await railLeft(page)).toBe(0);
  });

  test('CASES-04 depois de rolar o carrossel ele não volta a avançar', async ({ page }) => {
    const box = await page.locator('.story-carousel').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(1000, 0);
    await page.waitForTimeout(800);
    await page.mouse.move(5, 5);
    const left = await railLeft(page);
    expect(left).toBeGreaterThan(0);
    await waitAutoplay(page, 8000);
    expect(await railLeft(page)).toBe(left);
  });

  test('CASES-04 depois de usar uma tecla na seção o carrossel não volta a avançar', async ({ page }) => {
    await page.locator('.story-carousel').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(800);
    await page.evaluate(() => document.activeElement.blur());
    const left = await railLeft(page);
    expect(left).toBeGreaterThan(0);
    await waitAutoplay(page, 8000);
    expect(await railLeft(page)).toBe(left);
  });

  test('CASES-05 com as animações pausadas o carrossel não avança sozinho', async ({ page }) => {
    await page.getByRole('button', { name: 'Pausar animações', exact: true }).click();
    await viewCarousel(page);
    await waitAutoplay(page, 8000);
    expect(await railLeft(page)).toBe(0);
  });
});

test('CASES-04 depois de um toque na seção o carrossel não volta a avançar', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto('/', { waitUntil: 'load' });
  await viewCarousel(page);
  // A tap on the first card's text (not a control); at 390px the category list sits under the fixed header.
  const target = await page.locator('#cases .story-card').first().locator('h3').boundingBox();
  expect(target.y).toBeGreaterThan(80);
  expect(target.y + target.height).toBeLessThan(844);
  await page.touchscreen.tap(target.x + 10, target.y + target.height / 2);
  await waitAutoplay(page, 8000);
  expect(await railLeft(page)).toBe(0);
  await context.close();
});
