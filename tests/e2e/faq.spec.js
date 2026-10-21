import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';
import { waLink } from '../../js/whatsapp.js';

// FAQ-01: exact questions, in this order.
const QUESTIONS = [
  'O que é grátis e o que é pago?',
  'Tem fidelidade ou taxa de implantação?',
  'Quanto tempo leva para o app ficar pronto?',
  'Preciso ter conta de desenvolvedor na Apple e no Google?',
  'Com quais plataformas a Korza se conecta?',
  'O app terá a identidade da minha marca?',
  'Como funcionam as notificações push?',
  'Consigo acompanhar os resultados?'
];
// FAQ-02: AD-006 facts each answer must contain.
const FACTS = {
  'O que é grátis e o que é pago?': ['onboarding', 'R$ 399'],
  'Tem fidelidade ou taxa de implantação?': ['Sem fidelidade', 'sem taxa'],
  'Quanto tempo leva para o app ficar pronto?': ['7 dias úteis', '14 dias úteis'],
  'Preciso ter conta de desenvolvedor na Apple e no Google?': ['contas da Korza', 'sem custo']
};
const DEFAULT_MESSAGE = 'Oi! Vim pelo site da Korza e tenho uma dúvida.';

// Question text without the decorative "+" marker.
const questionTexts = page => page.locator('#duvidas details > summary').evaluateAll(list => list.map(summary => {
  const copy = summary.cloneNode(true);
  copy.querySelectorAll('[aria-hidden="true"]').forEach(node => node.remove());
  return copy.textContent.replace(/\s+/g, ' ').trim();
}));

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test.describe(`FAQ em ${width}x${height}`, () => {
    test.beforeEach(async ({ page }) => { await gotoAt(page, width, height); });

    test('FAQ-01 exatamente as 8 perguntas da spec, nesta ordem', async ({ page }) => {
      expect(await questionTexts(page)).toEqual(QUESTIONS);
    });

    test('FAQ-02 cada resposta aberta mostra os fatos da oferta', async ({ page }) => {
      for (const [question, facts] of Object.entries(FACTS)) {
        const item = page.locator('#duvidas details').filter({ has: page.locator('summary', { hasText: question }) });
        await expect(item, question).toHaveCount(1);
        const answer = item.locator('p');
        await expect(answer, question).toBeHidden();
        await item.locator('summary').click();
        await expect(item, question).toHaveAttribute('open', '');
        await expect(answer, question).toBeVisible();
        for (const fact of facts) await expect(answer, `${question} → ${fact}`).toContainText(fact);
      }
    });

    test('FAQ-03 o FAQ termina com "Falar com especialista" no WhatsApp com a mensagem padrão', async ({ page }) => {
      const section = page.locator('#duvidas');
      const last = section.locator('a').last();
      await expect(last).toHaveText('Falar com especialista');
      await expect(last).toHaveAttribute('href', waLink('floating'));
      expect(new URL(await last.getAttribute('href')).searchParams.get('text')).toBe(DEFAULT_MESSAGE);
      await expect(last).toHaveAttribute('target', '_blank');
      await expect(last).toHaveAttribute('rel', /\bnoopener\b/);
      // It comes after the last question.
      const after = await last.evaluate(link => {
        const questions = document.querySelectorAll('#duvidas details');
        return Boolean(questions[questions.length - 1].compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      expect(after).toBe(true);
      await last.scrollIntoViewIfNeeded();
      await expect(last).toBeVisible();
    });
  });
}
