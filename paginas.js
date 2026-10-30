'use strict';
// Páginas de SEO: só o que elas usam do app.js, que depende dos elementos da home.
const menu = document.querySelector('#navigation');
const menuButton = document.querySelector('.menu-toggle');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menu.classList.toggle('open', open);
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuButton.focus(); }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

document.querySelector('#year').textContent = new Date().getFullYear();

const signupLinks = 'a[href^="https://admin.korza.app/create-account"]';
const ctaLinks = signupLinks + ',a[href^="https://wa.me/"]';
document.addEventListener('click', event => {
  const link = event.target.closest(ctaLinks);
  if (!link || typeof gtag !== 'function') return;
  const place = link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : link.closest('section[id]')?.id || 'outro';
  gtag('event', 'cta_click', {cta_text: link.textContent.trim(), cta_location: place});
});

// O cookie _fbc do Pixel não atravessa para admin.korza.app; repassa o clique do anúncio pela URL.
function adClickId() {
  const fromUrl = new URLSearchParams(location.search).get('fbclid');
  if (fromUrl) return fromUrl;
  const fbc = document.cookie.match(/(?:^|; )_fbc=fb\.\d+\.\d+\.([^;]+)/);
  return fbc ? decodeURIComponent(fbc[1]) : null;
}
document.addEventListener('click', event => {
  const link = event.target.closest(signupLinks);
  const id = link && adClickId();
  if (!id) return;
  const url = new URL(link.href);
  url.searchParams.set('fbclid', id);
  link.href = url;
});
