import { brands } from './config.js';

export function initBrandPicker() {
  const brandImage = document.querySelector('#brand-preview');
  document.querySelectorAll('[data-brand]').forEach(button => button.addEventListener('click', () => {
    const brand = brands[button.dataset.brand];
    const mockup = ext => `assets/${button.dataset.brand}-mockup-480.${ext} 480w, assets/${button.dataset.brand}-mockup-800.${ext} 800w`;
    brandImage.parentElement.querySelectorAll('source').forEach(source => { source.srcset = mockup(source.type.split('/')[1]); });
    brandImage.src = `assets/${button.dataset.brand}-mockup-800.webp`;
    brandImage.alt = brand.alt;
    const brandIcon = document.querySelector('#brand-icon');
    brandIcon.style.left = brand.x + '%';
    brandIcon.style.top = brand.y + '%';
    brandIcon.alt = 'Ícone do app ' + brand.name;
    document.querySelector('#brand-icon-name').textContent = brand.name;
    document.querySelectorAll('[data-brand]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('.app-card').dataset.selectedBrand = button.dataset.brand;
  }));
}
