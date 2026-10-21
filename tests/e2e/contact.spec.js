import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';
import { waLink } from '../../js/whatsapp.js';

const CTA = 'Montar meu app grátis';
const WA_PREFIX = 'https://wa.me/555194553299?text=';
// Message for each place a WhatsApp link can sit (spec Assumptions): FAQ and footer use the default message,
// the mobile bar and the desktop floating button use the "floating" one, which is that same default.
const messageFor = { hero: 'hero', pricing: 'pricing', closing: 'closing', sticky: 'floating', floating: 'floating', faq: 'floating', footer: 'floating' };
const SPEC_MESSAGES = {
  hero: 'Oi! Vim pelo site da Korza e quero entender como ter o app da minha loja.',
  pricing: 'Oi! Quero entender o plano de R$ 399 da Korza.',
  closing: 'Oi! Quero colocar minha loja em um app com a Korza.',
  floating: 'Oi! Vim pelo site da Korza e tenho uma dúvida.'
};

test('CONTACT-06 rodapé sem "Criar app grátis" e com o rótulo único de cadastro', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const footer = page.locator('footer.footer');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  await expect(footer).not.toContainText('Criar app grátis');
  const signup = footer.locator('a[href^="https://admin.korza.app/create-account"]');
  await expect(signup).toHaveCount(1);
  await expect(signup).toBeVisible();
  await expect(signup).toHaveText(CTA);
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`CONTACT-01 "Falar com especialista" no hero, no card de preço e no fechamento em ${width}x${height}`, async ({ page }) => {
    await gotoAt(page, width, height);
    for (const [section, location] of [['.hero', 'hero'], ['.plan-price', 'pricing'], ['.closing-section', 'closing']]) {
      const link = page.locator(`${section} a`, { hasText: 'Falar com especialista' });
      await expect(link, section).toHaveCount(1);
      await link.scrollIntoViewIfNeeded();
      await expect(link, section).toBeVisible();
      await expect(link, section).toHaveAttribute('href', waLink(location));
    }
  });
}

test('CONTACT-02 todo link de WhatsApp abre a conversa da Korza em nova aba com a mensagem da sua localização', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const links = await page.locator('a[href*="wa.me"]').evaluateAll(list => list.map(link => ({
    href: link.getAttribute('href'), target: link.getAttribute('target'), rel: link.getAttribute('rel') || '', location: link.dataset.track
  })));
  expect(links.length).toBeGreaterThanOrEqual(3);
  for (const link of links) {
    expect(link.href.startsWith(WA_PREFIX), link.href).toBe(true);
    expect(link.target, link.href).toBe('_blank');
    expect(link.rel.split(/\s+/), link.href).toContain('noopener');
    expect(Object.keys(messageFor), `localização de ${link.href}`).toContain(link.location);
    expect(link.href, link.location).toBe(waLink(messageFor[link.location]));
    // The decoded text is exactly the spec message for that location.
    expect(new URL(link.href).searchParams.get('text'), link.location).toBe(SPEC_MESSAGES[messageFor[link.location]]);
  }
});

const WA_NAME = 'Falar com especialista no WhatsApp';

async function scrollTo(page, y) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
  await page.waitForTimeout(250);
}
// Hero fully above the viewport, pricing card and footer still below it.
const midPage = async page => scrollTo(page, await page.locator('#plataforma').evaluate(section => section.getBoundingClientRect().top + window.scrollY + 200));
const centerHitsItself = locator => locator.evaluate(el => {
  const r = el.getBoundingClientRect();
  return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
});

for (const width of [390, 760]) {
  test(`CONTACT-03 barra fixa com o CTA principal e o WhatsApp em ${width}px`, async ({ page }) => {
    await gotoAt(page, width, 844);
    await midPage(page);
    const bar = page.locator('.sticky-cta');
    await expect(bar).toBeVisible();
    await expect(bar.locator('a[href^="https://admin.korza.app/create-account"]')).toBeVisible();
    const whatsapp = bar.getByRole('link', { name: WA_NAME, exact: true });
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute('href', waLink('floating'));
    expect(await centerHitsItself(whatsapp)).toBe(true);
  });
}

for (const [width, height] of [[1440, 900], [844, 390]]) {
  test(`CONTACT-04 botão flutuante de WhatsApp no canto inferior direito só depois do hero em ${width}x${height}`, async ({ page }) => {
    await gotoAt(page, width, height);
    const button = page.locator('.whatsapp-float');
    await expect(button).toHaveCount(1);
    await expect(button).toBeHidden();

    // Still hidden while part of the hero is on screen.
    const heroBottom = await page.locator('.hero').evaluate(hero => hero.getBoundingClientRect().bottom + window.scrollY);
    await scrollTo(page, heroBottom - 60);
    await expect(button).toBeHidden();

    await scrollTo(page, heroBottom + 400);
    await expect(button).toBeVisible();
    await expect(button).toHaveAccessibleName(WA_NAME);
    await expect(button).toHaveAttribute('href', waLink('floating'));
    const box = await button.boundingBox();
    expect(box.x).toBeGreaterThan(width / 2);
    expect(box.x + box.width).toBeGreaterThanOrEqual(width - 40);
    expect(box.y + box.height).toBeGreaterThanOrEqual(height - 100);
    expect(box.y).toBeGreaterThan(height / 2);
    // Nothing fixed (pause control) sits on top of it.
    expect(await centerHitsItself(button)).toBe(true);

    await scrollTo(page, 0);
    await expect(button).toBeHidden();
  });
}
