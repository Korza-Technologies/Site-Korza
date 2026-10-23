import { normalizeStoreName, readableTextColor, validateLogo } from './preview.js';
import { track } from './analytics.js';

// "See your store become an app": the hero phone switches from the real Hiven photo to the drawn app
// with the visitor's name and color. Everything stays in the browser.
export function initPreview() {
  const form = document.querySelector('.brand-teaser');
  const device = document.querySelector('.hero .hero-device');
  if (!form || !device) return;
  const scene = device.closest('.hero-scene');
  const nameInput = form.querySelector('#teaser-name');
  const custom = form.querySelector('#teaser-custom');
  const radios = [...form.querySelectorAll('input[name="teaser-color"]')];
  const live = form.querySelector('.teaser-live');
  const cta = document.querySelector('.hero .actions .signup-cta');
  let color = radios.find(radio => radio.checked).value;
  let logoUrl = null;
  let used = false;

  // First interaction: the hero CTA (same signup href) invites to continue, and one event is sent, without the name.
  function firstUse() {
    if (used) return;
    used = true;
    const label = [...cta.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    label.textContent = 'Continuar montando meu app ';
    track('brand_preview_used', { has_name: nameInput.value.trim() !== '', has_logo: logoUrl !== null });
  }

  // Rendered synchronously on every change (no debounce): the phone follows each keystroke (PREVIEW-02, ≤ 150ms).
  function update() {
    const name = normalizeStoreName(nameInput.value);
    device.classList.add('is-custom');
    device.style.setProperty('--brand', color);
    device.style.setProperty('--on-brand', readableTextColor(color));
    // textContent only: whatever was typed is shown literally, never parsed as HTML.
    device.querySelectorAll('.app-name, .app-push-name').forEach(el => { el.textContent = name; });
    device.querySelectorAll('.app-initial').forEach(el => { el.textContent = [...name][0].toLocaleUpperCase('pt-BR'); });
    scene.setAttribute('aria-label', `Prévia do app da ${name}`);
    live.textContent = `Prévia atualizada: app da ${name}`;
    firstUse();
  }

  nameInput.addEventListener('input', update);
  radios.forEach(radio => radio.addEventListener('change', () => {
    color = radio.value;
    custom.closest('.swatch').classList.remove('is-selected');
    update();
  }));
  custom.addEventListener('input', () => {
    color = custom.value;
    radios.forEach(radio => { radio.checked = false; });
    custom.closest('.swatch').classList.add('is-selected');
    update();
  });
  // The logo is read only by this page, through an object URL; the previous URL is revoked when a new logo replaces it.
  const logoInput = form.querySelector('#teaser-logo');
  const error = form.querySelector('.teaser-error');
  form.querySelector('.teaser-logo').addEventListener('click', () => logoInput.click());
  logoInput.addEventListener('change', () => {
    const file = logoInput.files[0];
    logoInput.value = '';
    if (!file) return;
    const result = validateLogo(file);
    error.textContent = result.ok ? '' : result.message;
    if (!result.ok) return;
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    logoUrl = URL.createObjectURL(file);
    device.querySelectorAll('.app-logo').forEach(el => {
      el.style.backgroundImage = `url("${logoUrl}")`;
      el.classList.add('has-logo');
    });
    update();
  });
  // Nothing is ever submitted: pressing Enter in the name field must not send the name anywhere.
  form.addEventListener('submit', event => event.preventDefault());
  form.hidden = false;
}
