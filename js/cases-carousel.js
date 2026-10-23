import { isPaused } from './motion.js';

// Horizontal case studies: automatic progression (never while paused), with manual controls and touch scrolling.
export function initCasesCarousel() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storyRail = document.querySelector('.story-carousel');
  const storyCards = [...document.querySelectorAll('.story-card')];
  const storyDots = [...document.querySelectorAll('[data-story]')];
  let storyIndex = 0;
  let storyVisible = false;
  let storyManual = false;
  function showStory(index, manual = false) {
    storyManual = storyManual || manual;
    storyIndex = (index + storyCards.length) % storyCards.length;
    storyRail.scrollTo({left:storyCards[storyIndex].offsetLeft - storyCards[0].offsetLeft, behavior:reducedMotion.matches ? 'instant' : 'smooth'});
  }
  document.querySelector('.story-prev').addEventListener('click', () => showStory(storyIndex - 1, true));
  document.querySelector('.story-next').addEventListener('click', () => showStory(storyIndex + 1, true));
  storyDots.forEach(dot => dot.addEventListener('click', () => showStory(Number(dot.dataset.story), true)));
  // Any pointer, touch, focus, key or wheel interaction inside the cases section stops autoplay until the page reloads.
  const storySection = storyRail.closest('#cases') || storyRail;
  for (const type of ['pointerdown', 'touchstart', 'focusin', 'keydown', 'wheel']) {
    storySection.addEventListener(type, () => { storyManual = true; }, {passive:true});
  }
  storyRail.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); showStory(storyIndex + (event.key === 'ArrowRight' ? 1 : -1), true); }
  });
  storyRail.addEventListener('scroll', () => {
    const firstLeft = storyCards[0].offsetLeft;
    storyIndex = storyCards.reduce((best, card, index) => Math.abs(card.offsetLeft - firstLeft - storyRail.scrollLeft) < Math.abs(storyCards[best].offsetLeft - firstLeft - storyRail.scrollLeft) ? index : best, 0);
    storyDots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === storyIndex)));
  }, {passive:true});
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {storyVisible = entries[0].isIntersecting;}, {threshold:.4});
    observer.observe(storyRail);
  }
  setInterval(() => {
    if (storyVisible && !storyManual && !isPaused() && !storyRail.matches(':hover') && !storyRail.contains(document.activeElement)) showStory(storyIndex + 1);
  }, 6500);
}
