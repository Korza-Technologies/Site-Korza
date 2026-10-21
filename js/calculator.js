import { PLAN_PRICE } from './config.js';

const TICKET_ERROR = 'Informe um ticket médio entre R$ 1 e R$ 100.000.';
const MARGIN_ERROR = 'Informe uma margem entre 1% e 100%.';

// Number typed the Brazilian way: "179,90", "1.234,5", "100.000" or plain "180". Anything else is NaN.
export function parseBRNumber(value) {
  if (typeof value === 'number') return value;
  const text = String(value ?? '').trim();
  let normalized;
  if (/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(text) || /^\d+(,\d+)?$/.test(text)) normalized = text.replace(/\./g, '').replace(',', '.');
  else if (/^\d+(\.\d+)?$/.test(text)) normalized = text;
  else return NaN;
  return Number(normalized);
}

// Orders per month whose margin pays the plan: ⌈price ÷ (ticket × margin ÷ 100)⌉.
export function paybackOrders(ticketInput, marginInput) {
  const ticket = parseBRNumber(ticketInput);
  const margin = parseBRNumber(marginInput);
  const errors = [];
  if (!(ticket > 0 && ticket <= 100000)) errors.push({ field: 'ticket', message: TICKET_ERROR });
  if (!(margin > 0 && margin <= 100)) errors.push({ field: 'margin', message: MARGIN_ERROR });
  if (errors.length) return { ok: false, errors };
  return { ok: true, orders: Math.ceil((PLAN_PRICE * 100) / (ticket * margin)) };
}

export function paybackMessage(orders) {
  return `O plano se paga com ${orders} ${orders === 1 ? 'pedido' : 'pedidos'} por mês pelo app.`;
}
