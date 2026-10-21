import { demoOrders } from './config.js';

// Illustrative push revenue: simulated purchases, never live customer data.
export function initRevenueDemo() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pushRevenueCard = document.querySelector('.push-revenue-metric');
  const pushRevenueTotal = document.querySelector('#push-revenue-total');
  const pushOrderValue = document.querySelector('#push-order-value');
  const pushSale = document.querySelector('.push-sale');
  let revenueVisible = false;
  let revenueStep = 0;
  let revenueValue = 12480;
  let revenueTimer;
  let revenueFrame;
  const currencyNumber = value => value.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
  function animateRevenue() {
    const order = demoOrders[revenueStep % demoOrders.length];
    const from = revenueStep % demoOrders.length === 0 ? 12480 : revenueValue;
    const to = from + order;
    revenueStep++;
    revenueValue = to;
    pushOrderValue.textContent = '+ R$ ' + currencyNumber(order);
    pushSale.classList.remove('sale-arrives');
    void pushSale.offsetWidth;
    pushSale.classList.add('sale-arrives');
    const start = performance.now();
    function draw(now) {
      const progress = Math.min((now - start) / 1100, 1);
      pushRevenueTotal.textContent = currencyNumber(from + (to - from) * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) revenueFrame = requestAnimationFrame(draw);
    }
    cancelAnimationFrame(revenueFrame);
    revenueFrame = requestAnimationFrame(draw);
  }
  function syncRevenue() {
    clearInterval(revenueTimer);
    cancelAnimationFrame(revenueFrame);
    pushRevenueTotal.textContent = currencyNumber(revenueValue);
    if (revenueVisible && !reducedMotion.matches && !document.hidden) revenueTimer = setInterval(animateRevenue, 3500);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {revenueVisible = entries[0].isIntersecting; syncRevenue();}, {threshold:.25});
    observer.observe(pushRevenueCard);
  }
  reducedMotion.addEventListener('change', syncRevenue);
  document.addEventListener('visibilitychange', syncRevenue);
}
