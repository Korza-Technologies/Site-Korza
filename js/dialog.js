import { details } from './config.js';
import { waLink } from './whatsapp.js';

export function initDialog() {
  const dialog = document.querySelector('#feature-dialog');
  const caseBlock = document.querySelector('#dialog-case');
  const whatsapp = document.querySelector('#dialog-whatsapp');
  let dialogOpener;
  document.querySelectorAll('[data-feature], [data-case]').forEach(trigger => trigger.addEventListener('click', event => {
    event.preventDefault();
    dialogOpener = trigger;
    const detail = details[trigger.dataset.feature || trigger.dataset.case];
    document.querySelector('#dialog-label').textContent = detail.label || 'Conheça a plataforma';
    document.querySelector('#dialog-title').textContent = detail.title;
    document.querySelector('#dialog-description').textContent = detail.description;
    document.querySelector('#dialog-note').textContent = detail.note;
    // Cases add a number that is not on the card, its period and the WhatsApp link with the case message.
    const isCase = Boolean(trigger.dataset.case);
    caseBlock.hidden = !isCase;
    if (isCase) {
      document.querySelector('#dialog-extra').textContent = detail.extra;
      document.querySelector('#dialog-period').textContent = `Período: ${detail.period}`;
      whatsapp.href = waLink('case', detail.name);
    } else {
      whatsapp.removeAttribute('href');
    }
    dialog.showModal();
  }));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => dialogOpener?.focus());
}
