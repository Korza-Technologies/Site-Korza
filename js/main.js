import { initPauseButton } from './motion.js';
import { initMenu } from './menu.js';
import { initBrandPicker } from './brand-picker.js';
import { initDialog } from './dialog.js';
import { initPushStack } from './push-stack.js';
import { initGoalCounter } from './goal-counter.js';
import { initCasesCarousel } from './cases-carousel.js';
import { initRevenueDemo } from './revenue-demo.js';
import { initStickyCta } from './sticky-cta.js';

initPauseButton(document.querySelector('.motion-toggle'));
initMenu();
initBrandPicker();
initDialog();

// Content is visible without JavaScript; movement never controls visibility.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
    if (entry.isIntersecting && entry.target.classList.contains('reveal')) { entry.target.classList.add('arrived'); }
  }), {threshold: 0.08});
  document.querySelectorAll('.motion-scene, .reveal').forEach(element => observer.observe(element));
  document.body.classList.add('motion-enabled');
}
document.querySelector('#year').textContent = new Date().getFullYear();

initPushStack();
initGoalCounter();
initCasesCarousel();
initRevenueDemo();
initStickyCta(document.querySelector('.sticky-cta'), [...document.querySelectorAll('.hero, .plan-price, .footer')]);
initStickyCta(document.querySelector('.whatsapp-float'), [document.querySelector('.hero')]);
