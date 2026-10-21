# Relatório de métricas dos cases

**Coleta**: 2026-10-21 · banco de produção da Korza, acesso somente leitura (`SELECT` em sessão read-only)
**Período principal**: últimos 90 dias, de 23/07/2026 a 20/10/2026 (rótulo no site: "jul–out 2026")
**Base**: pedidos pagos da loja inteira (app + site) e campanhas push enviadas no período
**Status**: ✅ aprovado pelo usuário em 2026-10-21 (DATA-3)

> Conforme o spec, só percentuais e razões são candidatos à publicação. Contagens e valores em R$ ficam fora.

## Definições

- **Participação do app no faturamento**: faturamento dos pedidos feitos no app ÷ faturamento total da loja.
- **Faturamento via push**: faturamento dos pedidos atribuídos a uma campanha push ÷ faturamento total da loja.
- **Conversão do push**: pedidos pagos atribuídos ÷ aberturas da notificação (mesma fórmula do painel da Korza).
- **Ticket médio no app vs. site**: ticket médio dos pedidos do app comparado ao dos pedidos do site.

## Por case

| Case | Métrica atual no site | Reproduz? | Candidatas (90 dias) | Recomendação para o card | Extra para o diálogo |
| ---- | --------------------- | --------- | -------------------- | ------------------------ | -------------------- |
| **Loum** | 42% dos pedidos no app de quem já tinha comprado | ❌ Não reproduzível com os dados atuais | App = 24,3% dos pedidos e 26,8% do faturamento · push = 13,7% do faturamento · conversão do push 16,1% · ticket no app +14,3% | **26,8% do faturamento da loja veio do app** | 13,7% do faturamento veio de pushs |
| **Hiven** | (sem número) | — | Ticket médio no app 67,7% maior que no site · app = 3,8% do faturamento · sem campanhas push no período | **Ticket médio 68% maior no app** | App = 3,8% do faturamento |
| **Belletonn** | 26,6% de conversão em pushs não segmentados | ⚠️ 90 dias: 20,7% · desde o início: 36,4% | Conversão do push não segmentado 20,7% · app = 11,0% do faturamento · ticket no app +10,4% | **20,7% de conversão após abrir o push** | 11% do faturamento veio do app |
| **Pé de Algodão** | +4,98% de faturamento via push | ⚠️ 90 dias: 3,43% · desde o início: 2,42% | Push = 3,43% do faturamento · app = 9,7% do faturamento · conversão do push 13,7% | **9,7% do faturamento da loja veio do app** | 3,4% do faturamento veio de pushs |

## Observações

1. Os números atuais do site para Loum, Belletonn e Pé de Algodão não são reproduzidos com os dados de hoje. A recomendação troca todos por métricas recentes com período.
2. Hiven ganha um case de **ticket médio**, a categoria que faltava. Com isso o chip "Ticket médio" volta a ter um case correspondente.
3. Nenhuma métrica de recompra foi recomendada: os marcadores de recompra disponíveis não permitiram uma definição consistente. Detalhes foram repassados ao time por fora deste repositório.
4. A taxa de abertura (CTR) não foi recomendada para publicação.

## Aprovação

- [x] Usuário aprovou os números da coluna "Recomendação para o card" e "Extra para o diálogo" (data: 2026-10-21, "Aprovar todos")
