// Single source of the case studies. Numbers approved by the owner in .specs/features/lp-magia-cases/data-report.md
// (collected 2026-10-21, last 90 days: 23/07/2026 to 20/10/2026). The card HTML in index.html mirrors these values.
export const CASES_PERIOD = 'jul–out 2026';

const NOTE = 'Resultado específico apresentado pela Korza, medido de 23/07/2026 a 20/10/2026. O desempenho varia entre operações.';

export const cases = {
  loum: {
    name: 'Loum', category: 'Faturamento', metric: '26,8%', metricText: 'do faturamento da loja veio do app.', period: CASES_PERIOD,
    label: 'Case Korza · Loum', title: '26,8% do faturamento da Loum veio do app.',
    description: 'Entre julho e outubro de 2026, mais de um quarto de tudo o que a Loum faturou veio de pedidos feitos no aplicativo.',
    extra: '13,7% do faturamento veio de notificações push.', note: NOTE
  },
  hiven: {
    name: 'Hiven', category: 'Ticket médio', metric: '68%', metricText: 'de ticket médio maior no app do que no site.', period: CASES_PERIOD,
    label: 'Case Korza · Hiven', title: 'No app, o ticket médio da Hiven é 68% maior.',
    description: 'Entre julho e outubro de 2026, cada pedido feito no aplicativo da Hiven teve, em média, um valor 68% maior que os pedidos feitos no site.',
    extra: '3,8% do faturamento veio do app.', note: NOTE
  },
  belletonn: {
    name: 'Belletonn', category: 'Conversão', metric: '20,7%', metricText: 'de conversão após abrir o push.', period: CASES_PERIOD,
    label: 'Case Korza · Belletonn', title: '20,7% de conversão após a abertura do push.',
    description: 'Entre julho e outubro de 2026, as notificações push não segmentadas da Belletonn geraram 20,7 pedidos pagos a cada 100 aberturas.',
    extra: '11% do faturamento veio do app.', note: NOTE
  },
  pe: {
    name: 'Pé de Algodão', category: 'Faturamento', metric: '9,7%', metricText: 'do faturamento da loja veio do app.', period: CASES_PERIOD,
    label: 'Case Korza · Pé de Algodão', title: '9,7% do faturamento da Pé de Algodão veio do app.',
    description: 'Entre julho e outubro de 2026, quase um décimo do faturamento da Pé de Algodão veio de pedidos feitos no aplicativo.',
    extra: '3,4% do faturamento veio de notificações push.', note: NOTE
  }
};
