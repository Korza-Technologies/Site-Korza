import { paybackOrders, paybackMessage } from './calculator.js';
import { track } from './analytics.js';

// Payback calculator: the result (or what to fix) updates on every keystroke. The default result is already in the HTML.
// The first valid result after the visitor types is reported once per page load.
export function initCalculator(root = document.querySelector('.payback')) {
  if (!root) return;
  let reported = false;
  const ticket = root.querySelector('#payback-ticket');
  const margin = root.querySelector('#payback-margin');
  const result = root.querySelector('.payback-result');
  root.addEventListener('input', () => {
    const outcome = paybackOrders(ticket.value, margin.value);
    const invalid = outcome.ok ? [] : outcome.errors.map(error => error.field);
    ticket.setAttribute('aria-invalid', String(invalid.includes('ticket')));
    margin.setAttribute('aria-invalid', String(invalid.includes('margin')));
    result.textContent = outcome.ok ? paybackMessage(outcome.orders) : outcome.errors.map(error => error.message).join(' ');
    if (outcome.ok && !reported) {
      reported = true;
      track('calculator_used');
    }
  });
}
