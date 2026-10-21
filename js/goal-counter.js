// Targets count up once; they remain explicitly labelled as goals, not achieved results.
export function initGoalCounter() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const goalSection = document.querySelector('.goal-grid');
  if (!('IntersectionObserver' in window)) return;
  const goalObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    goalObserver.disconnect();
    if (reducedMotion.matches) return;
    const counters = [...goalSection.querySelectorAll('[data-goal-count]')];
    const start = performance.now();
    function tick(now) {
      const progress = reducedMotion.matches ? 1 : Math.min((now - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counters.forEach(node => { node.textContent = Math.round(Number(node.dataset.goalCount) * eased); });
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, {threshold: .3});
  goalObserver.observe(goalSection);
}
