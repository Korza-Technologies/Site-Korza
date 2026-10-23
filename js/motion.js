// Single source of the "animations paused" state: pause button, reduced motion or hidden tab.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const listeners = [];
let userPaused = false;
let button;

export function isPaused() {
  return userPaused || reducedMotion.matches || document.hidden;
}

export function onChange(callback) {
  listeners.push(callback);
}

function update() {
  document.body.classList.toggle('animations-paused', isPaused());
  if (button) {
    button.setAttribute('aria-pressed', String(userPaused));
    button.querySelector('.motion-label').textContent = userPaused ? 'Retomar animações' : 'Pausar animações';
  }
  listeners.forEach(callback => callback());
}

export function initPauseButton(element) {
  button = element;
  button.hidden = false;
  button.addEventListener('click', () => {
    userPaused = !userPaused;
    update();
  });
  update();
}

reducedMotion.addEventListener('change', update);
document.addEventListener('visibilitychange', update);
