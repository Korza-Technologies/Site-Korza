import { test, expect } from '@playwright/test';
import { gotoAt, scrollToEnd } from '../helpers.js';
import { POSTHOG_API_HOST } from '../../js/config.js';

const TEST_KEY = 'phc_test_key';
const ANALYTICS_HOSTS = /posthog|burrito\.korza\.com\.br/i;
const SIGNUP = 'https://admin.korza.app/create-account';

// Serves js/config.js with the given PostHog key, so the test never depends on the key shipped in the repository.
async function useKey(page, key) {
  await page.route('**/js/config.js', async route => {
    const response = await route.fetch();
    const source = await response.text();
    const pattern = /export const POSTHOG_KEY = '[^']*';/;
    if (!pattern.test(source)) throw new Error('POSTHOG_KEY constant not found in js/config.js');
    await route.fulfill({ response, body: source.replace(pattern, `export const POSTHOG_KEY = '${key}';`) });
  });
}

// Stand-in for the PostHog library: takes over the official stub and reports every capture to the test.
const FAKE_POSTHOG = `(function () {
  var stub = window.posthog;
  window.__phInit = stub._i;
  var lib = { __loaded: true, init: function () {}, capture: function (event, properties) { window.__phCapture({ event: event, properties: properties }); } };
  window.posthog = lib;
  stub.forEach(function (call) { if (call[0] === 'capture') lib.capture(call[1], call[2]); });
})();`;

async function fakePostHog(page) {
  const captured = [];
  const scripts = [];
  await page.exposeFunction('__phCapture', data => { captured.push(data); });
  await page.context().route(url => url.hostname === new URL(POSTHOG_API_HOST).hostname, route => {
    scripts.push(route.request().url());
    return route.fulfill({ contentType: 'text/javascript', body: FAKE_POSTHOG });
  });
  return { captured, scripts };
}

// Destinations answered locally: the tests never leave the machine.
async function stubDestinations(context) {
  await context.route('https://admin.korza.app/**', route => route.fulfill({ contentType: 'text/html', body: '<title>cadastro</title>' }));
  await context.route('https://wa.me/**', route => route.fulfill({ contentType: 'text/html', body: '<title>whatsapp</title>' }));
}

function watchConsole(page) {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push({ text: message.text(), url: message.location().url }); });
  page.on('pageerror', error => errors.push({ text: `pageerror: ${error.message}`, url: '' }));
  return errors;
}

test('ANALYTICS-01 com a chave vazia nenhuma requisição vai para o PostHog e o console fica limpo', async ({ page }) => {
  await useKey(page, '');
  await stubDestinations(page.context());
  const requests = [];
  page.context().on('request', request => requests.push(request.url()));
  // Recorded above, never sent to the network.
  await page.context().route(url => ANALYTICS_HOSTS.test(url.href), route => route.abort());
  const errors = watchConsole(page);
  await gotoAt(page, 1440, 900);
  await scrollToEnd(page);
  // Interactions that would emit events when analytics is on.
  await page.locator('#duvidas summary').first().click();
  await page.locator('#precos').getByLabel('Ticket médio (R$)', { exact: true }).fill('250');
  const popup = page.waitForEvent('popup');
  await page.locator('.plan-price a[href^="https://wa.me/"]').click();
  await (await popup).waitForLoadState();
  await page.locator('.hero a[href^="https://admin.korza.app/create-account"]').click();
  await page.waitForURL(`${SIGNUP}**`);

  expect(requests.length).toBeGreaterThan(0);
  expect(requests.filter(url => ANALYTICS_HOSTS.test(url))).toEqual([]);
  expect(errors).toEqual([]);
});

test('ANALYTICS-02 com a chave preenchida o script vem do api_host e o clique no cadastro emite cta_click', async ({ page }) => {
  await useKey(page, TEST_KEY);
  await stubDestinations(page.context());
  const { captured, scripts } = await fakePostHog(page);
  await gotoAt(page, 1440, 900);

  await expect.poll(() => scripts.length).toBe(1);
  expect(scripts[0].startsWith(`${POSTHOG_API_HOST}/`)).toBe(true);
  expect(POSTHOG_API_HOST).toBe('https://burrito.korza.com.br');
  const [key, options] = await page.evaluate(() => window.__phInit[0]);
  expect(key).toBe(TEST_KEY);
  expect(options.api_host).toBe(POSTHOG_API_HOST);

  await page.locator('.hero a[href^="https://admin.korza.app/create-account"]').click();
  await expect.poll(() => captured.filter(item => item.event === 'cta_click')).toEqual([
    { event: 'cta_click', properties: { location: 'hero', destination: 'signup' } }
  ]);
  // The click still takes the visitor to the signup.
  await page.waitForURL(`${SIGNUP}**`);
});

test('ANALYTICS-02 clique no WhatsApp emite cta_click com a localização do link', async ({ page }) => {
  await useKey(page, TEST_KEY);
  await stubDestinations(page.context());
  const { captured } = await fakePostHog(page);
  await gotoAt(page, 1440, 900);
  await expect.poll(() => page.evaluate(() => Boolean(window.posthog && window.posthog.__loaded))).toBe(true);

  for (const [selector, location] of [['.plan-price a[href^="https://wa.me/"]', 'pricing'], ['.closing-section a[href^="https://wa.me/"]', 'closing']]) {
    const link = page.locator(selector);
    await link.scrollIntoViewIfNeeded();
    const popup = page.waitForEvent('popup');
    await link.click();
    await (await popup).close();
    await expect.poll(() => captured.filter(item => item.event === 'cta_click').at(-1), location).toEqual({
      event: 'cta_click', properties: { location, destination: 'whatsapp' }
    });
  }
  expect(captured.filter(item => item.event === 'cta_click')).toHaveLength(2);
});

test('ANALYTICS-06 com o script do PostHog bloqueado os CTAs navegam e o console não mostra erro não tratado', async ({ page }) => {
  await useKey(page, TEST_KEY);
  await stubDestinations(page.context());
  const blocked = [];
  await page.context().route(url => url.hostname === new URL(POSTHOG_API_HOST).hostname, route => {
    blocked.push(route.request().url());
    return route.abort('blockedbyclient');
  });
  const errors = watchConsole(page);
  await gotoAt(page, 1440, 900);
  await expect.poll(() => blocked.length).toBe(1);

  const popup = page.waitForEvent('popup');
  await page.locator('.plan-price a[href^="https://wa.me/"]').click();
  const whatsapp = await popup;
  await whatsapp.waitForLoadState();
  expect(whatsapp.url().startsWith('https://wa.me/555194553299?text=')).toBe(true);

  await page.locator('.hero a[href^="https://admin.korza.app/create-account"]').click();
  await page.waitForURL(`${SIGNUP}**`);
  await expect(page).toHaveTitle('cadastro');

  // The only console entry allowed is the browser's own note about the blocked request.
  const unexpected = errors.filter(error => !(error.text.startsWith('Failed to load resource') && error.url.startsWith(POSTHOG_API_HOST)));
  expect(unexpected).toEqual([]);
});

test('ANALYTICS-03 calculator_used sai uma única vez, no primeiro N válido depois de mexer na calculadora', async ({ page }) => {
  await useKey(page, TEST_KEY);
  const { captured } = await fakePostHog(page);
  await gotoAt(page, 1440, 900);
  await expect.poll(() => page.evaluate(() => Boolean(window.posthog && window.posthog.__loaded))).toBe(true);
  const uses = () => captured.filter(item => item.event === 'calculator_used').length;
  const ticket = page.locator('#precos').getByLabel('Ticket médio (R$)', { exact: true });
  const margin = page.locator('#precos').getByLabel('Margem (%)', { exact: true });
  const result = page.locator('#precos [aria-live="polite"]');

  // The default result on load is not a use; an invalid value is not a valid N.
  await ticket.fill('');
  await expect(result).toHaveText('Informe um ticket médio entre R$ 1 e R$ 100.000.');
  await page.waitForTimeout(300);
  expect(uses()).toBe(0);

  await ticket.fill('250');
  await expect(result).toHaveText('O plano se paga com 6 pedidos por mês pelo app.');
  await expect.poll(uses).toBe(1);

  await margin.fill('10');
  await expect(result).toHaveText('O plano se paga com 16 pedidos por mês pelo app.');
  await page.waitForTimeout(300);
  expect(uses()).toBe(1);
});

test('ANALYTICS-04 abrir duas perguntas do FAQ emite dois faq_open com o texto de cada pergunta', async ({ page }) => {
  await useKey(page, TEST_KEY);
  const { captured } = await fakePostHog(page);
  await gotoAt(page, 1440, 900);
  await expect.poll(() => page.evaluate(() => Boolean(window.posthog && window.posthog.__loaded))).toBe(true);
  const opens = () => captured.filter(item => item.event === 'faq_open');

  const first = page.locator('#duvidas summary', { hasText: 'O que é grátis e o que é pago?' });
  const last = page.locator('#duvidas summary', { hasText: 'Consigo acompanhar os resultados?' });
  await first.click();
  await last.click();
  await expect.poll(opens).toEqual([
    { event: 'faq_open', properties: { question: 'O que é grátis e o que é pago?' } },
    { event: 'faq_open', properties: { question: 'Consigo acompanhar os resultados?' } }
  ]);
  // Closing a question is not an opening.
  await first.click();
  await expect(first.locator('..')).not.toHaveAttribute('open', '');
  await page.waitForTimeout(300);
  expect(opens()).toHaveLength(2);
});

const LOCATIONS = ['menu', 'nav', 'hero', 'platform', 'goals', 'pricing', 'faq', 'closing', 'footer', 'sticky', 'floating', 'dialog', 'case'];
const TRACKED = 'a[href^="https://admin.korza.app/create-account"], a[href^="https://wa.me/"]';

test('ANALYTICS-07 todo CTA de cadastro e de WhatsApp tem data-track permitido e cada clique emite cta_click com a sua localização', async ({ page }) => {
  await useKey(page, TEST_KEY);
  await stubDestinations(page.context());
  const { captured } = await fakePostHog(page);
  await gotoAt(page, 1440, 900);
  // Opening a case dialog fills in the case WhatsApp link.
  const caseButton = page.locator('[data-case="loum"]');
  await caseButton.scrollIntoViewIfNeeded();
  await caseButton.click();
  await expect(page.locator('#feature-dialog')).toBeVisible();

  const links = await page.evaluate(selector => [...document.querySelectorAll(selector)]
    .map(link => ({ location: link.dataset.track ?? null, href: link.href })), TRACKED);
  for (const link of links) expect(LOCATIONS, `data-track de ${link.href}`).toContain(link.location);
  expect([...new Set(links.map(link => link.location))].sort()).toEqual([...LOCATIONS].sort());

  // Every tracked link is clicked once; the visitor stays on the page.
  await page.evaluate(selector => {
    window.addEventListener('click', event => event.preventDefault(), true);
    document.querySelectorAll(selector).forEach(link => link.click());
  }, TRACKED);
  const expected = links.map(link => ({
    event: 'cta_click',
    properties: { location: link.location, destination: link.href.startsWith('https://wa.me/') ? 'whatsapp' : 'signup' }
  }));
  await expect.poll(() => captured.filter(item => item.event === 'cta_click')).toEqual(expected);
});
