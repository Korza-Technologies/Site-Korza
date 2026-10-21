import { test, expect } from '@playwright/test';
import { parseBRNumber, paybackOrders, paybackMessage } from '../../js/calculator.js';

const TICKET_ERROR = 'Informe um ticket médio entre R$ 1 e R$ 100.000.';
const MARGIN_ERROR = 'Informe uma margem entre 1% e 100%.';

test('CALC-02 com ticket 180 e margem 30 o plano se paga com 8 pedidos', () => {
  expect(paybackOrders(180, 30)).toEqual({ ok: true, orders: 8 });
  expect(paybackOrders('180', '30')).toEqual({ ok: true, orders: 8 });
  expect(paybackMessage(8)).toBe('O plano se paga com 8 pedidos por mês pelo app.');
});

test('CALC-02 N é o teto de 399 ÷ (ticket × margem ÷ 100)', () => {
  // 399 ÷ (100 × 50%) = 7.98 → 8; 399 ÷ (399 × 50%) = 2 exato; 399 ÷ (1 × 1%) = 39900.
  expect(paybackOrders(100, 50)).toEqual({ ok: true, orders: 8 });
  expect(paybackOrders(399, 50)).toEqual({ ok: true, orders: 2 });
  expect(paybackOrders(400, 50)).toEqual({ ok: true, orders: 2 });
  expect(paybackOrders(1, 1)).toEqual({ ok: true, orders: 39900 });
});

test('CALC-03 quando N = 1 a frase usa "1 pedido"', () => {
  expect(paybackOrders(399, 100)).toEqual({ ok: true, orders: 1 });
  expect(paybackOrders(1330, 30)).toEqual({ ok: true, orders: 1 });
  expect(paybackOrders(5000, 30)).toEqual({ ok: true, orders: 1 });
  expect(paybackMessage(1)).toBe('O plano se paga com 1 pedido por mês pelo app.');
  expect(paybackMessage(2)).toBe('O plano se paga com 2 pedidos por mês pelo app.');
});

const ticketError = { ok: false, errors: [{ field: 'ticket', message: TICKET_ERROR }] };
const marginError = { ok: false, errors: [{ field: 'margin', message: MARGIN_ERROR }] };

test('CALC-05 ticket vazio, não numérico, ≤ 0 ou acima de 100000 dá a mensagem do ticket e nenhum N', () => {
  for (const ticket of ['', '   ', 'abc', '12abc', 0, '0', '-5', 100000.01, '100000,01', '100.000,01']) {
    const result = paybackOrders(ticket, 30);
    expect(result, String(ticket)).toEqual(ticketError);
    expect(result, String(ticket)).not.toHaveProperty('orders');
  }
});

test('CALC-05 limites válidos do ticket: 1 e 100000', () => {
  expect(paybackOrders(1, 30)).toEqual({ ok: true, orders: 1330 });
  expect(paybackOrders('1', '30')).toEqual({ ok: true, orders: 1330 });
  expect(paybackOrders(100000, 30)).toEqual({ ok: true, orders: 1 });
  expect(paybackOrders('100.000', '30')).toEqual({ ok: true, orders: 1 });
});

test('CALC-06 margem vazia, não numérica, ≤ 0 ou acima de 100 dá a mensagem da margem e nenhum N', () => {
  for (const margin of ['', 'abc', 0, '0', '-1', 101, '101', '100,5']) {
    const result = paybackOrders(180, margin);
    expect(result, String(margin)).toEqual(marginError);
    expect(result, String(margin)).not.toHaveProperty('orders');
  }
});

test('CALC-06 limites válidos da margem: 1 e 100', () => {
  // 399 ÷ (180 × 1%) = 221.67 → 222; 399 ÷ (180 × 100%) = 2.22 → 3.
  expect(paybackOrders(180, 1)).toEqual({ ok: true, orders: 222 });
  expect(paybackOrders(180, 100)).toEqual({ ok: true, orders: 3 });
});

test('CALC-05/06 os dois campos inválidos dão as duas mensagens', () => {
  expect(paybackOrders('', '')).toEqual({
    ok: false,
    errors: [{ field: 'ticket', message: TICKET_ERROR }, { field: 'margin', message: MARGIN_ERROR }]
  });
});

test('CALC-07 vírgula decimal: "179,90" vale 179.90', () => {
  expect(parseBRNumber('179,90')).toBe(179.9);
  expect(parseBRNumber('1.234,5')).toBe(1234.5);
  expect(parseBRNumber('180')).toBe(180);
  expect(parseBRNumber(' 30 ')).toBe(30);
  // 399 ÷ (179.90 × 30%) = 7.393 → 8.
  expect(paybackOrders('179,90', '30')).toEqual({ ok: true, orders: 8 });
});

test('CALC-05/07 texto vazio ou não numérico não vira número', () => {
  expect(parseBRNumber('')).toBeNaN();
  expect(parseBRNumber('abc')).toBeNaN();
  expect(parseBRNumber('12abc')).toBeNaN();
  expect(parseBRNumber('1,2,3')).toBeNaN();
});
