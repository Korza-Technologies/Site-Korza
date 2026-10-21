import { pushExamples } from './config.js';
import { isPaused, onChange } from './motion.js';

export function initPushStack() {
  const pushScene = document.querySelector('.push-art');
  const pushStack = document.querySelector('.push-device .push-stack');
  let pushVisible = false;
  let pushTimer;
  let pushWelcomeTimer;
  let nextPush = 0;
  function addPush() {
    const messages = [...pushStack.children];
    const incoming = messages[0].cloneNode(true);
    const example = pushExamples[nextPush++ % pushExamples.length];
    incoming.className = 'push-message push-enter';
    incoming.style.setProperty('--slot', '0');
    incoming.querySelector('strong').textContent = example.title;
    incoming.querySelector('p').textContent = example.text;
    const label = incoming.querySelector('small');
    label.firstChild.textContent = example.brand + ' ';
    label.querySelector('span').textContent = 'agora';
    incoming.querySelector('img').style.left = example.x + '%';
    incoming.querySelector('img').style.top = example.y + '%';
    messages.forEach((message, i) => {
      message.style.setProperty('--slot', String(i + 1));
      message.querySelector('small>span').textContent = i === 0 ? 'há 1 min' : 'há 3 min';
    });
    const outgoing = messages[messages.length - 1];
    outgoing.classList.add('push-leave');
    pushStack.prepend(incoming);
    requestAnimationFrame(() => requestAnimationFrame(() => incoming.classList.remove('push-enter')));
    window.setTimeout(() => outgoing.remove(), 750);
  }
  function updateMotion() {
    clearInterval(pushTimer);
    clearTimeout(pushWelcomeTimer);
    if (!isPaused() && pushVisible) {
      pushWelcomeTimer = setTimeout(addPush, 1000);
      pushTimer = setInterval(addPush, 3600);
    }
  }
  onChange(updateMotion);
  if ('IntersectionObserver' in window) {
    const mediaObserver = new IntersectionObserver(entries => {
      pushVisible = entries[0].isIntersecting;
      updateMotion();
    }, {threshold: .2});
    mediaObserver.observe(pushScene);
  }
  updateMotion();
}
