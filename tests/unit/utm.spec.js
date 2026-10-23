import { test, expect } from '@playwright/test';
import { appendUtm } from '../../js/utm.js';

const SIGNUP = 'https://admin.korza.app/create-account';

test('ANALYTICS-05 repassa só os parâmetros utm_*', () => {
  expect(appendUtm(SIGNUP, '?utm_source=ig&utm_campaign=x&foo=1')).toBe(`${SIGNUP}?utm_source=ig&utm_campaign=x`);
  expect(appendUtm(SIGNUP, '?gclid=abc&utm_medium=cpc&ref=site')).toBe(`${SIGNUP}?utm_medium=cpc`);
});

test('ANALYTICS-05 sem utm_* na URL o link fica igual', () => {
  expect(appendUtm(SIGNUP, '')).toBe(SIGNUP);
  expect(appendUtm(SIGNUP, '?foo=1&utmsource=x')).toBe(SIGNUP);
});

test('Edge case: utm_source repetido repassa só a primeira ocorrência', () => {
  const href = appendUtm(SIGNUP, '?utm_source=a&utm_campaign=x&utm_source=b');
  expect(href).toBe(`${SIGNUP}?utm_source=a&utm_campaign=x`);
  expect(new URL(href).searchParams.getAll('utm_source')).toEqual(['a']);
});

test('ANALYTICS-05 não duplica um utm_* que o link já tem e repetir o repasse não muda o link', () => {
  const once = appendUtm(`${SIGNUP}?utm_source=site`, '?utm_source=ig&utm_medium=cpc');
  expect(new URL(once).searchParams.getAll('utm_source')).toEqual(['ig']);
  expect(once).toBe(`${SIGNUP}?utm_source=ig&utm_medium=cpc`);
  expect(appendUtm(once, '?utm_source=ig&utm_medium=cpc')).toBe(once);
});

test('ANALYTICS-05 preserva a query que o link já tem', () => {
  expect(appendUtm(`${SIGNUP}?plan=monthly`, '?utm_source=ig')).toBe(`${SIGNUP}?plan=monthly&utm_source=ig`);
});
