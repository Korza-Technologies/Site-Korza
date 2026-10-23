import { test, expect } from '@playwright/test';
import { waLink } from '../../js/whatsapp.js';

const base = 'https://wa.me/555194553299?text=';
const decoded = href => {
  expect(href.startsWith(base), href).toBe(true);
  return decodeURIComponent(href.slice(base.length));
};

// Messages from the spec Assumptions (CONTACT-02).
const expected = {
  hero: 'Oi! Vim pelo site da Korza e quero entender como ter o app da minha loja.',
  pricing: 'Oi! Quero entender o plano de R$ 399 da Korza.',
  closing: 'Oi! Quero colocar minha loja em um app com a Korza.',
  floating: 'Oi! Vim pelo site da Korza e tenho uma dúvida.'
};

for (const [location, message] of Object.entries(expected)) {
  test(`CONTACT-02 waLink('${location}') abre o WhatsApp da Korza com a mensagem de ${location}`, () => {
    const href = waLink(location);
    expect(href).toBe(base + encodeURIComponent(message));
    expect(decoded(href)).toBe(message);
  });
}

test('CONTACT-02 waLink do case usa o nome do case na mensagem', () => {
  const message = 'Oi! Vi o case da Loum no site e quero um resultado parecido.';
  expect(waLink('case', 'Loum')).toBe(base + encodeURIComponent(message));
  expect(decoded(waLink('case', 'Pé de Algodão'))).toBe('Oi! Vi o case da Pé de Algodão no site e quero um resultado parecido.');
});

test('CONTACT-02 a mensagem vai inteira no parâmetro text, sem quebrar a URL', () => {
  const url = new URL(waLink('pricing'));
  expect(url.origin + url.pathname).toBe('https://wa.me/555194553299');
  expect([...url.searchParams.keys()]).toEqual(['text']);
  expect(url.searchParams.get('text')).toBe(expected.pricing);
});

test('localização desconhecida lança erro', () => {
  expect(() => waLink('rodape-inexistente')).toThrow();
  expect(() => waLink()).toThrow();
});
