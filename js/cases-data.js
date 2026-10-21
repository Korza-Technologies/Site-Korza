// Single source of the case studies. Numbers approved by the owner in .specs/features/lp-magia-cases/data-report.md
// (collected 2026-10-21, last 90 days: 23/07/2026 to 20/10/2026). The card HTML in index.html mirrors these values.
export const CASES_PERIOD = 'jul–out 2026';

export const cases = {
  loum: { name: 'Loum', category: 'Faturamento', metric: '26,8%', metricText: 'do faturamento da loja veio do app.', period: CASES_PERIOD },
  hiven: { name: 'Hiven', category: 'Ticket médio', metric: '68%', metricText: 'de ticket médio maior no app do que no site.', period: CASES_PERIOD },
  belletonn: { name: 'Belletonn', category: 'Conversão', metric: '20,7%', metricText: 'de conversão após abrir o push.', period: CASES_PERIOD },
  pe: { name: 'Pé de Algodão', category: 'Faturamento', metric: '9,7%', metricText: 'do faturamento da loja veio do app.', period: CASES_PERIOD }
};
