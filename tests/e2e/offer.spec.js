import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';
import { waLink } from '../../js/whatsapp.js';

const CTA = 'Montar meu app grátis';
const signupLinks = page => page.locator('a[href^="https://admin.korza.app/create-account"]');

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`OFFER-01 todo link de cadastro diz "${CTA}" em ${width}x${height}`, async ({ page }) => {
    await gotoAt(page, width, height);
    const labels = await signupLinks(page).evaluateAll(links => links.map(link => link.textContent.replace(/\s+/g, ' ').trim()));
    // Header, menu, hero, platform, goals, pricing, FAQ, closing, footer, sticky bar and dialog.
    expect(labels.length).toBeGreaterThanOrEqual(11);
    expect(labels.filter(label => label !== CTA)).toEqual([]);
  });
}

test('OFFER-01 sem JavaScript os links de cadastro já dizem o mesmo texto', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await gotoAt(page, 1440, 900);
  const labels = await signupLinks(page).evaluateAll(links => links.map(link => link.textContent.replace(/\s+/g, ' ').trim()));
  expect(labels.length).toBeGreaterThanOrEqual(11);
  expect(labels.filter(label => label !== CTA)).toEqual([]);
  await context.close();
});

const normalized = locator => locator.evaluate(el => el.textContent.replace(/\s+/g, ' ').trim());

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test.describe(`card de preço em ${width}x${height}`, () => {
    test.beforeEach(async ({ page }) => { await gotoAt(page, width, height); });

    test('OFFER-02 card de preço explica o que é grátis, o que é pago, fidelidade e prazo', async ({ page }) => {
      const card = page.locator('.plan-price');
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeVisible();
      const text = await normalized(card);
      for (const fact of ['R$ 399', '/mês', 'Monte e veja seu app grátis', 'Você só assina para publicar',
        'Sem fidelidade', 'Sem taxa de implantação', '7 dias úteis', '14 dias úteis']) {
        expect(text, fact).toContain(fact);
      }
      // Every fact is on screen, not only in the markup.
      for (const fact of ['Monte e veja seu app grátis', 'Você só assina para publicar', 'Sem fidelidade', 'Sem taxa de implantação']) {
        await expect(card.getByText(fact)).toBeVisible();
      }
    });

    test('OFFER-03 card de preço tem "Falar com especialista" no WhatsApp com a mensagem de preço', async ({ page }) => {
      const link = page.locator('.plan-price a', { hasText: 'Falar com especialista' });
      await expect(link).toHaveCount(1);
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', waLink('pricing'));
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
    });
  });
}
