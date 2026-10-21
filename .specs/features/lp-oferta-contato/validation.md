# F2 lp-oferta-contato: validação (iteração 2)

**Data**: 2026-10-21
**Spec**: `.specs/features/lp-oferta-contato/spec.md` (31 ACs; mapa lugar → localização em ANALYTICS-07 e exemplos 11/21 em CALC-03, de `c7bcbe3`)
**Intervalo do diff**: F2 original `f903985..4a5b2ac` + correção da iteração 1 `7daf73c` + correção da iteração 2 `e90610e..48e7cf7`:
- `c7bcbe3`: spec (mapa em ANALYTICS-07, exemplos de CALC-03), `tests/e2e/analytics.spec.js:193-246` (ANALYTICS-07 reescrito), `tests/unit/calculator.spec.js:29-35`, `tests/e2e/calculator.spec.js:93-99`.
- `001c060`: endurece PERF-03 (`tests/e2e/mockups.spec.js:14-33`) e MOB-03 (`tests/e2e/hero-mobile.spec.js:41-55`). Fora da F2; conferido que não ficaram mais fracos.
- `48e7cf7`: texto do case da Loum ("do faturamento", `index.html:96`) e limpeza de specs. Nenhum AC da F2 mudou.

**Iteração**: 2 de 3
**Verificador**: sub-agente independente (autor ≠ verificador). Worktree descartável em `48e7cf7`, porta 4179 só local (nunca commitada), `--workers=3`. Cada mutação foi desfeita com `git checkout` e o `git status` ficou só com a porta local depois de cada uma. O worktree foi removido no fim. Nenhuma requisição saiu para `burrito.korza.com.br`, `*.posthog.com` ou outro host da Korza: as mutações de medição rodaram com `analytics.spec.js`, que intercepta o host do PostHog (script falso ou abort) e os destinos (`admin.korza.app`, `wa.me`); os demais arquivos rodam com a chave vazia; o script de inspeção do mapa abortava qualquer requisição fora de `127.0.0.1`.
**Veredito**: ✅ PASS. M30, M31 e M33 agora morrem. As 7 mutações novas foram mortas ou são equivalentes (M41 não tem como acontecer). O mapa da spec bate com a página link a link. Gate verde duas vezes, sem instabilidade.

---

## Conclusão das tarefas

| Tarefa | Status | Observação |
| ------ | ------ | ---------- |
| T1–T14 | ✅ Done | Igual às iterações anteriores. |
| Correção 3 (ANALYTICS-02/07; M30, M31, P4) | ✅ Done | Mapa de 13 lugares na spec. `analytics.spec.js:197-217` acha cada link pelo seu contêiner, `:232` exige 19 links no total, `:235-236` exige 1 por lugar com o `data-track` do mapa, `:245` exige a sequência exata de `cta_click`. |
| Correção 4 (CALC-02/03; M33) | ✅ Done | `unit/calculator.spec.js:31-34` (11 e 21), `e2e/calculator.spec.js:98` (ticket 121 → "11 pedidos"). |
| Correção 5 (diálogo de case instável) | ✅ Done | `analytics.spec.js:225` pausa as animações antes de abrir o case. Passou 26/26 no estresse (ver Gate). |

---

## Critérios de aceite comparados com a spec

Caminhos relativos a `tests/`. Todas as linhas foram conferidas em `48e7cf7`.

### OFFER

| AC | Resultado que a spec define | Evidência (`file:line`, asserção) | Resultado |
| -- | --------------------------- | --------------------------------- | --------- |
| OFFER-01 | Todo link de cadastro diz "Montar meu app grátis" (menos o CTA do teaser da F3) | `e2e/offer.spec.js:15` `expect(labels.filter(label => label !== CTA)).toEqual([])`, `:14` ≥ 11, em 1440 e 390; sem JS `:24-25`. Hoje são 11 links de cadastro, conferidos no DOM | ✅ |
| OFFER-02 | Card com "R$ 399", "/mês" e os 6 fatos | `e2e/offer.spec.js:42` `toContain(fact)` para as 8 strings da spec; `:46` visíveis (M44 morto) | ✅ |
| OFFER-03 | WhatsApp "Falar com especialista" no card com a mensagem de preço | `e2e/offer.spec.js:52,55-57`; literal em `e2e/contact.spec.js:12,55` e `unit/whatsapp.spec.js:13,21` | ✅ |
| OFFER-04 | "próximo/próxima" ≤ 3 | `e2e/offer.spec.js:76` `toBeLessThanOrEqual(3)` | ✅ |
| OFFER-05 | Título sem "tempo real"; selo "Exemplo do painel" ≥ 12px acima das métricas | `e2e/offer.spec.js:87,90,96,97` | ✅ |
| OFFER-06 | Zero "pushs" | `e2e/offer.spec.js:81` `toEqual([])` | ✅ |

### CONTACT

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| CONTACT-01 | "Falar com especialista" no hero, no card de preço e no fechamento | `e2e/contact.spec.js:34` `toHaveCount(1)`, `:36` visível, `:37` `href` por seção, em 1440 e 390 | ✅ |
| CONTACT-02 | Prefixo `https://wa.me/555194553299?text=`, `_blank`, `noopener`, texto = mensagem da localização; `sticky/floating/faq/footer` = padrão | `e2e/contact.spec.js:49-51`, `:55` `searchParams.get('text')` = literais da spec (`:11-14`, mapa `:9`); sem JS `:138,140`; case `e2e/cases.spec.js:100-103`. Mensagens decodificadas dos 8 links de WhatsApp conferidas no DOM | ✅ |
| CONTACT-03 | Barra ≤ 760px com CTA e WhatsApp "Falar com especialista no WhatsApp" | `e2e/contact.spec.js:77-82`, em 390 e 760 | ✅ |
| CONTACT-04 | Flutuante > 760px no canto inferior direito só depois do hero | `e2e/contact.spec.js:91,96,99,103-106,111`, em 1440x900 e 844x390 | ✅ |
| CONTACT-05 | Rodapé com "(51) 9455-3299" (WhatsApp) e `mailto:suporte@korza.com.br` | `e2e/contact.spec.js:121-123,125-127` | ✅ |
| CONTACT-06 | Rodapé sem "Criar app grátis", só o rótulo de OFFER-01 | `e2e/contact.spec.js:22,24,26` | ✅ |

### FAQ

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| FAQ-01 | As 8 perguntas, nesta ordem | `e2e/faq.spec.js:37` `toEqual(QUESTIONS)` (M43 morto) | ✅ |
| FAQ-02 | Fatos de AD-006 em cada resposta | `e2e/faq.spec.js:49` `toContainText(fact)` | ✅ |
| FAQ-03 | Termina com WhatsApp "Falar com especialista" (mensagem padrão) | `e2e/faq.spec.js:56,58,62-66` | ✅ |

### CALC

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| CALC-01 | Campos com `label`, padrão 180 e 30 | `e2e/calculator.spec.js:10-11,24,26` | ✅ |
| CALC-02 | N = ⌈399 ÷ (ticket × margem ÷ 100)⌉ na frase; 180/30 → 8 | `unit/calculator.spec.js:8,10,15-18,31-32`; `e2e/calculator.spec.js:28` | ✅ |
| CALC-03 | N = 1 → "1 pedido"; N ≠ 1 (2, 11, 21) → "N pedidos" | `unit/calculator.spec.js:25,26,33,34` `toBe('O plano se paga com 11 pedidos por mês pelo app.')`; `e2e/calculator.spec.js:37,98` (M33 morto) | ✅ |
| CALC-04 | Atualiza ao digitar; `aria-live="polite"` | `e2e/calculator.spec.js:37,40,41,42-43,46` | ✅ |
| CALC-05 | Mensagem do ticket e nenhum N | `unit/calculator.spec.js:43-44,49-52`; `e2e/calculator.spec.js:53-54,57` | ✅ |
| CALC-06 | Mensagem da margem e nenhum N | `unit/calculator.spec.js:58-59,65-66`; `e2e/calculator.spec.js:64-65,68` | ✅ |
| CALC-07 | "179,90" = 179.90 | `unit/calculator.spec.js:77,82`; `e2e/calculator.spec.js:75` | ✅ |

### ANALYTICS

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| ANALYTICS-01 | Chave vazia: nenhuma requisição ao PostHog e console limpo | `e2e/analytics.spec.js:73` `toEqual([])`, `:74`; `js/config.js:45` `POSTHOG_KEY = ''` | ✅ |
| ANALYTICS-02 | Script do `api_host`; `cta_click {location, destination}`; `location` entre os 13 valores | `e2e/analytics.spec.js:84-88`, `:91-93`, `:111-113`; os 13 valores ligados ao lugar em `:197-217` | ✅ |
| ANALYTICS-03 | `calculator_used` uma vez por carregamento | `e2e/analytics.spec.js:159,163,168` | ✅ |
| ANALYTICS-04 | `faq_open {question}` | `e2e/analytics.spec.js:182-185,190` | ✅ |
| ANALYTICS-05 | `utm_*` em todo link de cadastro, sem duplicar | `e2e/utm.spec.js:17,32`; `unit/utm.spec.js:7-8,24-26,30` | ✅ |
| ANALYTICS-06 | Script bloqueado: CTAs navegam e nenhum erro não tratado | `e2e/analytics.spec.js:134,137-138,142` | ✅ |
| ANALYTICS-07 | Cada lugar do mapa tem exatamente um link de cada destino, com o `location` do mapa, e o clique emite `cta_click` com esse `location` e o `destination` certo | `e2e/analytics.spec.js:232` `toHaveCount(PLACES.length)` (19), `:235` `toHaveCount(1)` por lugar, `:236` `toHaveAttribute('data-track', location)`, `:245` `toEqual(expected)` com `location` e `destination` tirados do mapa, sem usar o código (M30, M31, M39, M40, M45, M46 mortos) | ✅ |

**Mapa da spec comparado com a página** (DOM em 1440x900 com o diálogo da Loum aberto): os 19 links de cadastro e de WhatsApp estão um por lugar, exatamente como na tabela de ANALYTICS-07. São eles: `#navigation`→menu, `.nav-signup`→nav, `#inicio` (cadastro e WhatsApp)→hero, `#plataforma`→platform, `#resultados`→goals, `#precos` (cadastro e WhatsApp)→pricing, `#duvidas` (cadastro e WhatsApp)→faq, `#contato` (cadastro e WhatsApp)→closing, `footer` (cadastro e WhatsApp)→footer, `.sticky-cta` (cadastro e WhatsApp)→sticky, `.whatsapp-float`→floating, `#feature-dialog` (cadastro)→dialog, `#dialog-case` (WhatsApp)→case. Os 8 links de WhatsApp têm `target="_blank"`, `rel="noopener"` e a mensagem da spec para cada lugar.

### COMP

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| COMP-01 | `table` com `th`, "Site mobile"/"App Korza", 4 linhas exatas | `e2e/compare.spec.js:21,26,28,31` | ✅ |
| COMP-02 | ≤ 760px sem rolagem horizontal | `e2e/compare.spec.js:48-49,53`, em 390 e 360 | ✅ |

**Status**: 31/31 ACs com evidência `file:line` e asserção no valor da spec. Nenhuma lacuna de precisão aberta: a P4 foi resolvida pelo mapa e o plural pelos exemplos 11/21.

---

## Casos de borda

- [x] WhatsApp sem app no desktop: só o link `wa.me` nativo, sem tratamento extra (`js/whatsapp.js`, `index.html`).
- [x] `utm_source` repetido: só a primeira ocorrência (`unit/utm.spec.js:18-19`, `e2e/utm.spec.js:25`; M42 morto).
- [x] Sem JavaScript: links de cadastro com o rótulo (`e2e/offer.spec.js:19-27`); todo `wa.me` com o `href` exato da sua localização (`e2e/contact.spec.js:138,140`; M39 também morto aqui); calculadora com "8 pedidos" (`e2e/calculator.spec.js:89`).

---

## Sensor de discriminação

Camada expandida (medição é o núcleo da correção). Cada mutação foi aplicada no worktree descartável por um script que exige exatamente uma ocorrência do trecho. Os arquivos indicados rodaram com `--workers=3`, e o arquivo voltou com `git checkout`.

| # | Arquivo | Mutação | Testes | Resultado (quem matou) |
| - | ------- | ------- | ------ | ---------------------- |
| M30 | `index.html:121-122` | troca o `data-track` do WhatsApp da barra (`sticky`) com o do flutuante (`floating`) | analytics, contact, sticky-cta, offer, faq | ✅ Morto: `analytics.spec.js:236` (`.sticky-cta a[href^="https://wa.me/"]`: esperado "sticky", recebido "floating") |
| M31 | `index.html:96,98` | troca os `data-track` de cadastro `platform` e `goals` | analytics, offer, utm, buttons, behavior | ✅ Morto: `analytics.spec.js:236` (`#plataforma …`: esperado "platform", recebido "goals") |
| M33 | `js/calculator.js:29` | singular quando `orders % 10 === 1` | unit calculator, calculator, analytics | ✅ Morto: `unit/calculator.spec.js:29` e `e2e/calculator.spec.js:93` |
| M39 | `index.html:120` | WhatsApp do rodapé com `data-track="faq"` | analytics, contact, faq, offer | ✅ Morto: `analytics.spec.js:236` (`footer …`: recebido "faq") e `contact.spec.js:138` (sem JS) |
| M40 | `index.html:123` | cadastro do diálogo com `data-track="case"` | analytics, offer, utm, cases, behavior | ✅ Morto: `analytics.spec.js:236` (`#feature-dialog …`: recebido "case") |
| M41 | `js/calculator.js:29` | singular quando `orders <= 1` (0 → "0 pedido") | unit calculator, calculator, analytics | ⚪ Sobreviveu, mas é **equivalente**: N = 0 não acontece. Com ticket ≤ 100000 e margem ≤ 100, N ≥ ⌈399·100 ÷ 10⁷⌉ = 1 (`unit/calculator.spec.js:51`), e o único lugar que chama `paybackMessage` é `js/calculator-ui.js:17`, que só passa `orders` de um resultado válido. Não é lacuna |
| M42 | `js/utm.js:7` | repasse de UTM sem `!utm.has(key)` (a última ocorrência ganha) | unit utm, utm | ✅ Morto: `unit/utm.spec.js:16` e `e2e/utm.spec.js:21` (recebido `utm_source=b`) |
| M43 | `index.html:111` | pergunta 4 do FAQ diz "na Apple ou no Google?" | faq, analytics, offer | ✅ Morto: `faq.spec.js:37` (FAQ-01) e `:49` (FAQ-02), em 1440 e 390 |
| M44 | `index.html:104` | card de preço sem "Sem taxa de implantação." | offer, faq | ✅ Morto: `offer.spec.js:42` em 1440 e 390 (o FAQ continua com "sem taxa", mas o teste lê só `.plan-price`) |
| M45 | `index.html:43-44` | troca `menu` ↔ `nav` (menu mobile e botão do header) | analytics, offer, buttons | ✅ Morto: `analytics.spec.js:236` (`#navigation …`: recebido "nav") |
| M46 | `index.html:123` | WhatsApp do case com `data-track="dialog"` | analytics, cases, contact | ✅ Morto: `analytics.spec.js:236` (`#dialog-case …`: recebido "dialog") |

**Camada**: expandida (11 mutações: M30, M31 e M33 repetidas, mais 8 novas)
**Resultado**: 10/10 mutantes não equivalentes mortos; 1 equivalente (M41). ✅ PASS

---

## Gate

- **Comando**: `npm test -- --workers=3` (porta local 4179 no worktree)
- **Resultado**: rodada 1: **231 passed, 0 failed, 0 skipped** (1.1m), exit 0. Rodada 2: 231 passed (55.5s), exit 0.
- **Contagem**: `npx playwright test --list` dá 231 em 28 arquivos, não os 232 esperados. São 229 + 2: o teste unitário de 11/21 e o e2e de "11 pedidos". O ANALYTICS-07 foi reescrito no mesmo lugar, sem virar teste novo. `001c060` e `48e7cf7` não mudaram a contagem. Nenhum teste foi removido nem pulado.
- **Histórico**: antes da F2 (`f903985`): 89. Depois da F2 (`4a5b2ac`): 169. Iteração 1 (`7daf73c`): 229. Agora: 231.
- **Instabilidade**: nenhuma. Estresse de `analytics` + `cases` + `contact` com `--repeat-each=6`: 210/210. ANALYTICS-07 sozinho com `--repeat-each=20`: 20/20. A falha do diálogo de case vista na iteração 1 não voltou depois da pausa das animações (`analytics.spec.js:225`).
- **PERF-03 e MOB-03 (`001c060`, F1, autorizado pelo usuário)**: nenhum dos dois ficou mais fraco. PERF-03 (`mockups.spec.js:22-32`) continua exigindo os 4 mockups servidos e cada um com ≤ 200.000 bytes. Agora abre cada case pelo ponto e espera o mockup chegar (`expect.poll`), em vez de 4 cliques em "próximo" e `networkidle`, e também exige o mockup do hero. MOB-03 (`hero-mobile.spec.js:53-54`) trocou `if (visible)` por `expect(visible).not.toBeNull()`, então agora falha se a fita sumir. Os dois passaram nas duas rodadas.

---

## Qualidade do código

| Princípio | Status |
| --------- | ------ |
| Correção cirúrgica: em `c7bcbe3` só mudaram spec e testes; em `48e7cf7` só uma palavra do case da Loum | ✅ |
| Nenhum teste enfraquecido: ANALYTICS-07 substituído por uma versão mais forte (contêiner, contagem, valor exato e sequência); PERF-03 e MOB-03 mais fortes | ✅ |
| Asserções no valor da spec: `PLACES` reproduz o mapa da spec; `destination` vem do mapa, sem usar o código; plural com o literal da frase | ✅ |
| AD-004 (chave vazia não carrega nada), AD-005 (número e e-mail) e AD-006 (oferta) continuam valendo | ✅ |
| Cobertura por camada: domínio (`calculator`, `utm`, `whatsapp`) 1:1 com os ACs; e2e cobre caminho feliz, bordas e erro | ✅ |
| Todo teste mapeia para um AC ou caso de borda | ✅ |
| Guias de teste do projeto | nenhum; padrões fortes aplicados |

---

## Lacunas de precisão da spec

Nenhuma aberta. A P4 (qual link usa qual localização) foi resolvida pelo mapa de ANALYTICS-07, que bate com a página. P1–P3 já estavam resolvidas.

Observação, não é lacuna: a spec não diz o que fazer com N = 0 em CALC-03, mas N = 0 não acontece com entradas válidas (ver M41).

---

## Rastreabilidade (proposta; o verificador não alterou o `spec.md`)

| Requisito | Status anterior | Novo status |
| --------- | --------------- | ----------- |
| OFFER-01..06 | ✅ Verified | ✅ Verified |
| CONTACT-01..06 | ✅ Verified | ✅ Verified |
| FAQ-01..03 | ✅ Verified | ✅ Verified |
| CALC-01, 03..07 | ✅ Verified | ✅ Verified |
| CALC-02 | ⚠️ Needs Fix | ✅ Verified |
| ANALYTICS-01, 03..06 | ✅ Verified | ✅ Verified |
| ANALYTICS-02, 07 | ❌ Needs Fix | ✅ Verified |
| COMP-01..02 | ✅ Verified | ✅ Verified |
| Casos de borda | ✅ Verified | ✅ Verified |

---

## Resumo

**Geral**: ✅ Ready
**Comparação com a spec**: 31/31 ACs com o valor da spec; 0 lacunas de precisão
**Sensor**: 10/10 mutantes não equivalentes mortos (M41 equivalente)
**Gate**: 231 passed, 0 failed (2 rodadas, sem instabilidade)

**O que funciona**: cada CTA de cadastro e de WhatsApp está no lugar do mapa da spec e envia a localização desse lugar. Uma troca entre dois links quaisquer agora quebra o ANALYTICS-07 (M30, M31, M39, M40, M45, M46). O plural da calculadora está certo em 11 e 21. O diálogo de case abre de forma estável. A oferta, o FAQ, os contatos e o UTM continuam com os valores da spec.

**Lições**: PASS sem sinal novo. Nenhum mutante não equivalente sobreviveu, não há lacuna de precisão nem desvio, então nenhuma lição foi registrada. A L-003, já confirmada, cobre o problema da iteração 1.

**Próximo passo**: marcar a F2 como verificada no `spec.md` (Requirement Traceability).
