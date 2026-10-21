import { test, expect } from '@playwright/test';
import { normalizeStoreName, readableTextColor, validateLogo, LOGO_ERROR } from '../../js/preview.js';

// WCAG 2.x relative luminance and contrast ratio, written from the definition (not from js/preview.js).
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PALETTE = ['#155DFC', '#0F1A33', '#E11D48', '#16A34A', '#F59E0B', '#7C3AED'];
const MB2 = 2 * 1024 * 1024;

test.describe('PREVIEW-04 normalizeStoreName', () => {
  test('vazio ou só espaços vira "Sua Loja"', () => {
    for (const raw of ['', ' ', '   \t\n  ']) expect(normalizeStoreName(raw), JSON.stringify(raw)).toBe('Sua Loja');
  });

  test('tira espaços das pontas e colapsa espaços internos', () => {
    expect(normalizeStoreName('  Loja   da\tAna  ')).toBe('Loja da Ana');
  });

  test('Edge case: nome com mais de 24 caracteres é cortado em 24', () => {
    expect(normalizeStoreName('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe('ABCDEFGHIJKLMNOPQRSTUVWX');
    expect(normalizeStoreName('ABCDEFGHIJKLMNOPQRSTUVWX')).toBe('ABCDEFGHIJKLMNOPQRSTUVWX');
  });

  test('PREVIEW-05 HTML é devolvido como texto, sem ser removido nem escapado', () => {
    expect(normalizeStoreName('<img onerror=alert(1)>')).toBe('<img onerror=alert(1)>');
  });
});

test.describe('Edge case: readableTextColor garante contraste ≥ 4,5:1 sobre a cor da marca', () => {
  for (const color of [...PALETTE, '#FFFF00', '#000000']) {
    test(`texto sobre ${color} tem contraste ≥ 4,5`, () => {
      const text = readableTextColor(color);
      expect(['#ffffff', '#0f1a33', '#000000']).toContain(text);
      expect(contrast(color, text)).toBeGreaterThanOrEqual(4.5);
    });
  }

  test('cor com pouco contraste com o branco troca o texto para escuro', () => {
    // White on #F59E0B (amber) and #FFFF00 (yellow) is below 4.5:1.
    expect(contrast('#F59E0B', '#ffffff')).toBeLessThan(4.5);
    expect(readableTextColor('#F59E0B')).not.toBe('#ffffff');
    expect(readableTextColor('#FFFF00')).not.toBe('#ffffff');
    expect(readableTextColor('#16A34A')).not.toBe('#ffffff');
  });

  test('cor escura mantém o texto branco', () => {
    for (const color of ['#155DFC', '#0F1A33', '#7C3AED', '#000000']) expect(readableTextColor(color), color).toBe('#ffffff');
  });

  test('qualquer cor do seletor "outra cor" (cinzas e tons médios) chega a 4,5:1', () => {
    const colors = [];
    for (let v = 0; v <= 255; v += 5) colors.push(`#${v.toString(16).padStart(2, '0').repeat(3)}`);
    for (const hex of ['#ff0000', '#00ff00', '#0000ff', '#808080', '#767676', '#8a8a8a', '#ff7f00', '#00a0a0']) colors.push(hex);
    for (const color of colors) expect(contrast(color, readableTextColor(color)), color).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('PREVIEW-06 validateLogo', () => {
  test('aceita PNG, JPG, WebP e SVG', () => {
    for (const type of ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']) {
      expect(validateLogo({ type, size: 1000 }), type).toEqual({ ok: true });
    }
  });

  test('recusa outros tipos com a mensagem da spec', () => {
    for (const type of ['image/gif', 'application/pdf', 'image/bmp', '']) {
      expect(validateLogo({ type, size: 1000 }), type).toEqual({ ok: false, message: 'Envie PNG, JPG, WebP ou SVG de até 2MB.' });
    }
    expect(LOGO_ERROR).toBe('Envie PNG, JPG, WebP ou SVG de até 2MB.');
  });

  test('2MB exatos são aceitos e 2MB + 1 byte é recusado', () => {
    expect(validateLogo({ type: 'image/png', size: MB2 })).toEqual({ ok: true });
    expect(validateLogo({ type: 'image/png', size: MB2 + 1 })).toEqual({ ok: false, message: 'Envie PNG, JPG, WebP ou SVG de até 2MB.' });
  });
});
