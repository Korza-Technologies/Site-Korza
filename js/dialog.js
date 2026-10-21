import { details } from './config.js';

export function initDialog() {
  const dialog = document.querySelector('#feature-dialog');
  let dialogOpener;
  document.querySelectorAll('[data-feature], [data-case]').forEach(trigger => trigger.addEventListener('click', event => {
    event.preventDefault();
    dialogOpener = trigger;
    const detail = details[trigger.dataset.feature || trigger.dataset.case];
    document.querySelector('#dialog-label').textContent = detail.label || 'Conheça a plataforma';
    document.querySelector('#dialog-title').textContent = detail.title;
    document.querySelector('#dialog-description').textContent = detail.description;
    document.querySelector('#dialog-note').textContent = detail.note;
    dialog.showModal();
  }));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => dialogOpener?.focus());
}
