import { normalizeStoreName, readableTextColor } from './preview.js';

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
  let color = radios.find(radio => radio.checked).value;
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
  // Nothing is ever submitted: pressing Enter in the name field must not send the name anywhere.
  form.addEventListener('submit', event => event.preventDefault());
  form.hidden = false;
}
