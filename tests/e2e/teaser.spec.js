import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

const rgb = hex => `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
const device = page => page.locator('.hero .hero-device');
const photo = page => page.locator('.hero .hero-device img');
const render = page => page.locator('.hero .app-render');

test.describe('T3 app desenhado no hero', () => {
  test('PREVIEW-03 com is-custom, aba ativa, botão e banner usam exatamente --brand e o texto usa --on-brand', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await device(page).evaluate(el => {
      el.classList.add('is-custom');
      el.style.setProperty('--brand', '#E11D48');
      el.style.setProperty('--on-brand', '#0f1a33');
    });
    await expect(render(page)).toBeVisible();
    await expect(photo(page)).toBeHidden();
    const colors = await render(page).evaluate(root => {
      const cs = selector => getComputedStyle(root.querySelector(selector));
      return {
        banner: cs('.app-banner').backgroundColor,
        bannerText: cs('.app-banner').color,
        button: cs('.app-button').backgroundColor,
        buttonText: cs('.app-button').color,
        tab: cs('.app-tab.is-active').color,
        otherTab: cs('.app-tab:not(.is-active)').color
      };
    });
    expect(colors.banner).toBe(rgb('#E11D48'));
    expect(colors.button).toBe(rgb('#E11D48'));
    expect(colors.tab).toBe(rgb('#E11D48'));
    expect(colors.otherTab).not.toBe(rgb('#E11D48'));
    expect(colors.bannerText).toBe(rgb('#0f1a33'));
    expect(colors.buttonText).toBe(rgb('#0f1a33'));
  });

  test('PREVIEW-03 sem is-custom a foto real aparece e o app desenhado não', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await expect(photo(page)).toBeVisible();
    await expect(render(page)).toBeHidden();
    await expect(render(page)).toHaveAttribute('aria-hidden', 'true');
  });
});

const PALETTE = ['#155DFC', '#0F1A33', '#E11D48', '#16A34A', '#F59E0B', '#7C3AED'];
const nameField = page => page.locator('.hero').getByLabel('Nome da sua loja', { exact: true });
const accents = page => render(page).evaluate(root => ['.app-banner', '.app-button'].map(s => getComputedStyle(root.querySelector(s)).backgroundColor)
  .concat(getComputedStyle(root.querySelector('.app-tab.is-active')).color));
const shownNames = page => render(page).evaluate(root => [root.querySelector('.app-header .app-name').textContent, root.querySelector('.app-push .app-push-name').textContent]);

test.describe('T4 formulário do teaser', () => {
  test('PREVIEW-01 campo "Nome da sua loja" com maxlength 24, 6 cores e "outra cor" visíveis', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    const field = nameField(page);
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute('maxlength', '24');
    const group = page.getByRole('group', { name: 'Cor da marca' });
    const radios = group.getByRole('radio');
    await expect(radios).toHaveCount(6);
    expect(await radios.evaluateAll(list => list.map(radio => radio.value.toUpperCase()))).toEqual(PALETTE);
    const other = group.getByLabel('Outra cor', { exact: true });
    await expect(other).toHaveAttribute('type', 'color');
    await expect(other).toBeVisible();
  });

  test('PREVIEW-01 teclado opera nome, cores e "outra cor"', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await nameField(page).focus();
    await page.keyboard.type('Loja da Ana');
    await expect.poll(() => shownNames(page)).toEqual(['Loja da Ana', 'Loja da Ana']);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('radio', { name: 'Azul', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Azul-marinho', exact: true })).toBeChecked();
    await expect.poll(() => accents(page)).toEqual(Array(3).fill(rgb('#0F1A33')));
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => accents(page)).toEqual(Array(3).fill(rgb('#E11D48')));
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Outra cor', { exact: true })).toBeFocused();
  });

  test('PREVIEW-02 digitar "Loja da Ana" mostra o nome no cabeçalho e no push em até 150ms', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await expect(photo(page)).toBeVisible();
    const elapsed = await page.evaluate(() => new Promise(resolve => {
      const input = document.querySelector('#teaser-name');
      const targets = [document.querySelector('.app-header .app-name'), document.querySelector('.app-push .app-push-name')];
      const start = performance.now();
      input.value = 'Loja da Ana';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      (function check() {
        if (targets.every(el => el.textContent === 'Loja da Ana')) resolve(performance.now() - start);
        else if (performance.now() - start > 2000) resolve(Infinity);
        else setTimeout(check, 2);
      })();
    }));
    expect(elapsed).toBeLessThanOrEqual(150);
    await expect(render(page)).toBeVisible();
    await expect(photo(page)).toBeHidden();
    await expect(render(page).locator('.app-header .app-name')).toBeVisible();
    await expect(render(page).locator('.app-push .app-push-name')).toBeVisible();
  });

  test('PREVIEW-03 cada uma das 6 cores e "outra cor" viram exatamente a cor do banner, do botão e da aba ativa', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    for (const color of [...PALETTE.slice(1), PALETTE[0]]) {
      await page.locator(`.brand-teaser input[type="radio"][value="${color}"]`).check();
      await expect.poll(() => accents(page), color).toEqual(Array(3).fill(rgb(color)));
    }
    await page.getByLabel('Outra cor', { exact: true }).fill('#123456');
    await expect.poll(() => accents(page)).toEqual(Array(3).fill(rgb('#123456')));
    expect(await page.locator('.brand-teaser input[type="radio"]:checked').count()).toBe(0);
  });

  test('Edge case: cor com pouco contraste com o branco deixa o texto do banner e do botão escuro', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await page.locator('.brand-teaser input[value="#F59E0B"]').check();
    await expect.poll(() => render(page).evaluate(root => ['.app-banner', '.app-button'].map(s => getComputedStyle(root.querySelector(s)).color)))
      .toEqual([rgb('#0f1a33'), rgb('#0f1a33')]);
    await page.locator('.brand-teaser input[value="#155DFC"]').check();
    await expect.poll(() => render(page).evaluate(root => getComputedStyle(root.querySelector('.app-banner')).color)).toBe(rgb('#ffffff'));
  });

  test('PREVIEW-04 campo vazio ou só com espaços mostra "Sua Loja"', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await nameField(page).fill('Loja da Ana');
    await expect.poll(() => shownNames(page)).toEqual(['Loja da Ana', 'Loja da Ana']);
    await nameField(page).fill('');
    await expect.poll(() => shownNames(page)).toEqual(['Sua Loja', 'Sua Loja']);
    await nameField(page).fill('    ');
    await expect.poll(() => shownNames(page)).toEqual(['Sua Loja', 'Sua Loja']);
  });

  test('PREVIEW-05 HTML digitado aparece como texto literal e não cria elementos', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', dialog => { dialogs.push(dialog.message()); dialog.dismiss(); });
    await gotoAt(page, 1440, 900);
    const before = await page.locator('.hero img').count();
    const html = '<img onerror=alert(1)>';
    await nameField(page).fill(html);
    await expect.poll(() => shownNames(page)).toEqual([html, html]);
    await expect(render(page).locator('img')).toHaveCount(0);
    expect(await page.locator('.hero img').count()).toBe(before);
    await expect(page.locator('.teaser-live')).toHaveText(`Prévia atualizada: app da ${html}`);
    await page.waitForTimeout(200);
    expect(dialogs).toEqual([]);
  });

  test('Edge case: nome colado com mais de 24 caracteres é truncado em 24', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    await nameField(page).focus();
    await page.keyboard.insertText('Loja Muito Comprida Demais Mesmo');
    await expect(nameField(page)).toHaveValue('Loja Muito Comprida Dema');
    await expect.poll(() => shownNames(page)).toEqual(['Loja Muito Comprida Dema', 'Loja Muito Comprida Dema']);
  });

  test('região aria-live anuncia "Prévia atualizada: app da NOME"', async ({ page }) => {
    await gotoAt(page, 1440, 900);
    const live = page.locator('.brand-teaser [aria-live="polite"]');
    await expect(live).toHaveCount(1);
    await nameField(page).fill('Loja da Ana');
    await expect(live).toHaveText('Prévia atualizada: app da Loja da Ana');
  });

  for (const [width, height] of [[390, 844], [360, 740]]) {
    test(`PREVIEW-09 em ${width}px teaser e celular cabem sem rolagem horizontal e com alvos ≥ 44px`, async ({ page }) => {
      await gotoAt(page, width, height);
      await nameField(page).fill('Loja da Ana');
      await page.locator('.brand-teaser input[value="#16A34A"]').check();
      await expect(render(page)).toBeVisible();
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
      expect(scrollWidth).toBe(clientWidth);
      const targets = page.locator('.brand-teaser input, .brand-teaser button');
      expect(await targets.count()).toBeGreaterThanOrEqual(8);
      for (const target of await targets.all()) {
        if (!(await target.isVisible())) continue;
        const box = await target.boundingBox();
        const name = await target.evaluate(el => el.id || el.value);
        expect(box.width, name).toBeGreaterThanOrEqual(44);
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x, name).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      // F1 VIS-02 also holds for the drawn phone: whole inside the hero, 280–440px tall.
      const [phone, hero] = await Promise.all([render(page).boundingBox(), page.locator('.hero').boundingBox()]);
      expect(phone.height).toBeGreaterThanOrEqual(280);
      expect(phone.height).toBeLessThanOrEqual(440);
      expect(phone.x).toBeGreaterThanOrEqual(hero.x);
      expect(phone.y).toBeGreaterThanOrEqual(hero.y);
      expect(phone.x + phone.width).toBeLessThanOrEqual(hero.x + hero.width);
      expect(phone.y + phone.height).toBeLessThanOrEqual(hero.y + hero.height);
    });
  }

  test('Edge case: sem JavaScript o formulário fica oculto e o hero mostra a foto real', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await gotoAt(page, 390, 844);
    await expect(page.locator('.brand-teaser')).toBeHidden();
    await expect(page.locator('.brand-teaser')).toHaveAttribute('hidden', '');
    await expect(photo(page)).toBeVisible();
    await expect(render(page)).toBeHidden();
    await context.close();
  });
});

const PNG_1X1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const LOGO_ERROR = 'Envie PNG, JPG, WebP ou SVG de até 2MB.';
const logoButton = page => page.locator('.brand-teaser').getByRole('button', { name: 'Enviar logo', exact: true });

// Opens the file chooser from the "Enviar logo" button (keyboard, when asked) and picks the given file.
async function sendLogo(page, file, { keyboard = false } = {}) {
  const chooser = page.waitForEvent('filechooser');
  if (keyboard) {
    await logoButton(page).focus();
    await page.keyboard.press('Enter');
  } else {
    await logoButton(page).click();
  }
  await (await chooser).setFiles(file);
}

// Background image URL of the header logo and of the push icon, and whether each URL decodes to an image.
const logos = page => render(page).evaluate(async root => Promise.all(['.app-header .app-logo', '.app-push .app-logo'].map(async selector => {
  const value = getComputedStyle(root.querySelector(selector)).backgroundImage;
  const url = value.match(/^url\("(.*)"\)$/)?.[1] ?? null;
  let width = 0;
  if (url) {
    const img = new Image();
    img.src = url;
    try { await img.decode(); width = img.naturalWidth; } catch { width = -1; }
  }
  return { url, width };
})));

test.describe('T5 envio de logo', () => {
  test.beforeEach(async ({ page }) => {
    // Records every object URL created and revoked by the page.
    await page.addInitScript(() => {
      window.__created = [];
      window.__revoked = [];
      const create = URL.createObjectURL.bind(URL);
      const revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = object => { const url = create(object); window.__created.push(url); return url; };
      URL.revokeObjectURL = url => { window.__revoked.push(url); return revoke(url); };
    });
    await gotoAt(page, 1440, 900);
  });

  test('PREVIEW-06 PNG válido aparece no cabeçalho e no ícone do push', async ({ page }) => {
    await sendLogo(page, { name: 'logo.png', mimeType: 'image/png', buffer: PNG_1X1 }, { keyboard: true });
    await expect(render(page)).toBeVisible();
    const [header, push] = await logos(page);
    expect(header.url).toMatch(/^blob:/);
    expect(push.url).toBe(header.url);
    expect(header.width).toBe(1);
    expect(push.width).toBe(1);
    await expect(page.locator('.teaser-error')).toHaveText('');
  });

  for (const [label, file] of [
    ['GIF', { name: 'logo.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') }],
    ['PNG de 2MB + 1 byte', { name: 'grande.png', mimeType: 'image/png', buffer: Buffer.concat([PNG_1X1, Buffer.alloc(2 * 1024 * 1024 + 1 - PNG_1X1.length)]) }]
  ]) {
    test(`PREVIEW-06 ${label} mostra a mensagem e mantém o logo anterior`, async ({ page }) => {
      await sendLogo(page, { name: 'logo.png', mimeType: 'image/png', buffer: PNG_1X1 });
      const [before] = await logos(page);
      expect(before.url).toMatch(/^blob:/);
      await sendLogo(page, file);
      await expect(page.locator('.teaser-error')).toHaveText(LOGO_ERROR);
      await expect(page.locator('.teaser-error')).toBeVisible();
      const [header, push] = await logos(page);
      expect(header).toEqual(before);
      expect(push).toEqual(before);
      expect(await page.evaluate(() => window.__revoked)).toEqual([]);
    });
  }

  test('PREVIEW-10 um segundo logo revoga a URL de objeto do primeiro', async ({ page }) => {
    await sendLogo(page, { name: 'um.png', mimeType: 'image/png', buffer: PNG_1X1 });
    const [first] = await logos(page);
    await sendLogo(page, { name: 'dois.png', mimeType: 'image/png', buffer: PNG_1X1 });
    const [second, push] = await logos(page);
    expect(second.url).toMatch(/^blob:/);
    expect(second.url).not.toBe(first.url);
    expect(push.url).toBe(second.url);
    const { created, revoked } = await page.evaluate(() => ({ created: window.__created, revoked: window.__revoked }));
    expect(created).toEqual([first.url, second.url]);
    expect(revoked).toEqual([first.url]);
  });
});

const SIGNUP = 'https://admin.korza.app/create-account';
const heroCta = page => page.locator('.hero .actions a[href^="https://admin.korza.app/create-account"]');
const ctaText = page => heroCta(page).evaluate(el => el.textContent.replace(/\s+/g, ' ').trim());

// Serves js/config.js with a PostHog key and stands in for the PostHog library, reporting every capture to the test.
async function fakeAnalytics(page) {
  const captured = [];
  await page.route('**/js/config.js', async route => {
    const response = await route.fetch();
    const source = (await response.text()).replace(/export const POSTHOG_KEY = '[^']*';/, "export const POSTHOG_KEY = 'phc_test_key';");
    await route.fulfill({ response, body: source });
  });
  await page.exposeFunction('__phCapture', data => { captured.push(data); });
  await page.context().route('https://burrito.korza.com.br/**', route => route.fulfill({ contentType: 'text/javascript', body: `(function () {
    var stub = window.posthog;
    var lib = { __loaded: true, init: function () {}, capture: function (event, properties) { window.__phCapture({ event: event, properties: properties }); } };
    window.posthog = lib;
    stub.forEach(function (call) { if (call[0] === 'capture') lib.capture(call[1], call[2]); });
  })();` }));
  return captured;
}
const previewEvents = captured => captured.filter(item => item.event === 'brand_preview_used');

test.describe('T6 CTA, evento e privacidade do teaser', () => {
  test('PREVIEW-08 na primeira interação o CTA do hero vira "Continuar montando meu app" com o mesmo href (com UTM)', async ({ page }) => {
    await gotoAt(page, 1440, 900, '/?utm_source=ig&utm_campaign=x');
    expect(await ctaText(page)).toBe('Montar meu app grátis');
    const href = await heroCta(page).getAttribute('href');
    expect(href).toBe(`${SIGNUP}?utm_source=ig&utm_campaign=x`);
    await page.locator('.brand-teaser input[value="#E11D48"]').check();
    await expect.poll(() => ctaText(page)).toBe('Continuar montando meu app');
    await expect(heroCta(page)).toHaveAttribute('href', href);
    await expect(heroCta(page)).toHaveCount(1);
    await expect(heroCta(page).locator('svg use[href="#arrow"]')).toHaveCount(1);
    await nameField(page).fill('Loja da Ana');
    expect(await ctaText(page)).toBe('Continuar montando meu app');
  });

  test('PREVIEW-08 brand_preview_used sai uma vez, com {has_name, has_logo} e sem o nome, depois de várias interações', async ({ page }) => {
    const captured = await fakeAnalytics(page);
    await gotoAt(page, 1440, 900);
    await expect.poll(() => page.evaluate(() => Boolean(window.posthog && window.posthog.__loaded))).toBe(true);
    await page.waitForTimeout(300);
    expect(previewEvents(captured)).toEqual([]);
    await nameField(page).fill('Loja da Ana');
    await page.locator('.brand-teaser input[value="#16A34A"]').check();
    await page.getByLabel('Outra cor', { exact: true }).fill('#123456');
    await sendLogo(page, { name: 'logo.png', mimeType: 'image/png', buffer: PNG_1X1 });
    await nameField(page).fill('Loja da Bia');
    await expect.poll(() => previewEvents(captured).length).toBe(1);
    await page.waitForTimeout(300);
    expect(previewEvents(captured)).toEqual([{ event: 'brand_preview_used', properties: { has_name: true, has_logo: false } }]);
  });

  for (const [first, expected, act] of [
    ['cor', { has_name: false, has_logo: false }, page => page.locator('.brand-teaser input[value="#7C3AED"]').check()],
    ['logo', { has_name: false, has_logo: true }, page => sendLogo(page, { name: 'logo.png', mimeType: 'image/png', buffer: PNG_1X1 })]
  ]) {
    test(`PREVIEW-08 primeira interação por ${first} emite ${JSON.stringify(expected)}`, async ({ page }) => {
      const captured = await fakeAnalytics(page);
      await gotoAt(page, 1440, 900);
      await expect.poll(() => page.evaluate(() => Boolean(window.posthog && window.posthog.__loaded))).toBe(true);
      await act(page);
      await expect.poll(() => previewEvents(captured)).toEqual([{ event: 'brand_preview_used', properties: expected }]);
      await expect.poll(() => ctaText(page)).toBe('Continuar montando meu app');
    });
  }

  test('PREVIEW-07 nenhuma requisição leva o nome, a cor ou o logo, nem ao apertar Enter nem ao seguir para o cadastro', async ({ page }) => {
    const NAME = 'Loja Zeta Secreta';
    const COLOR = '#a1b2c3';
    const LOGO = Buffer.concat([PNG_1X1, Buffer.from('MARCA-DO-LOGO-ZETA')]);
    const captured = await fakeAnalytics(page);
    await page.context().route('https://admin.korza.app/**', route => route.fulfill({ contentType: 'text/html', body: '<title>cadastro</title>' }));
    const requests = [];
    page.context().on('request', request => requests.push({ url: request.url(), body: request.postDataBuffer() }));
    await gotoAt(page, 1440, 900);
    await expect.poll(() => page.evaluate(() => Boolean(window.posthog && window.posthog.__loaded))).toBe(true);
    const start = page.url();

    await nameField(page).fill(NAME);
    await page.getByLabel('Outra cor', { exact: true }).fill(COLOR);
    await sendLogo(page, { name: 'zeta.png', mimeType: 'image/png', buffer: LOGO });
    await expect.poll(() => logos(page).then(([header]) => header.width)).toBe(1);
    await nameField(page).press('Enter');
    await page.waitForTimeout(500);
    expect(page.url()).toBe(start);

    await heroCta(page).click();
    await page.waitForURL(`${SIGNUP}**`);
    expect(page.url()).toBe(SIGNUP);

    const needles = [NAME, encodeURIComponent(NAME), NAME.replace(/ /g, '+'), 'Zeta', COLOR.slice(1), encodeURIComponent(COLOR), 'MARCA-DO-LOGO-ZETA'];
    expect(requests.length).toBeGreaterThan(0);
    for (const { url, body } of requests) {
      const text = `${decodeURIComponent(url)}\n${url}\n${body ? body.toString('latin1') : ''}`;
      for (const needle of needles) expect(text.toLowerCase().includes(needle.toLowerCase()), `${needle} em ${url}`).toBe(false);
    }
    expect(JSON.stringify(captured).includes('Zeta')).toBe(false);
  });
});
