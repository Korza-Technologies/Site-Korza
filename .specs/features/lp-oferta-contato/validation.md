# F2 lp-oferta-contato: validação (iteração 1)

**Data**: 2026-10-21
**Spec**: `.specs/features/lp-oferta-contato/spec.md` (31 ACs depois da emenda de `7daf73c`)
**Intervalo do diff**: F2 original `f903985..4a5b2ac` (Fase 1 `e6ed16e be87f73 612451b 78a3734 d5c4ea0 3dca42b 57e6417 b301176`; Fase 2 `80b4232 c5aac8b e8b3c4a 6245ab1 22c0d59 a418702 8d05a77`) + correção `7daf73c` (spec, `tests/e2e/analytics.spec.js:192-222`, `tests/e2e/contact.spec.js:131-143`). Conferido por cima da F3 (`a1a5f11..e9c5d5b`), que mexeu em `index.html`, `js/config.js`, `js/dialog.js` e `js/main.js`.
**Iteração**: 1 de 3
**Verificador**: sub-agente independente (autor ≠ verificador). Worktree descartável em `7daf73c`, porta 4177 só local, `--workers=3`. Todas as mutações foram desfeitas com `git checkout` e o worktree foi removido no fim. Nenhuma requisição saiu para `burrito.korza.com.br`, `*.posthog.com` ou outro host da Korza: as mutações de analytics rodaram com `tests/e2e/analytics.spec.js`, que intercepta o host do PostHog (script falso ou abort) e os destinos (`admin.korza.app`, `wa.me`); os demais arquivos rodam com a chave vazia.
**Veredito**: ❌ FAIL. M26, M27 e M28 agora morrem e os 31 ACs têm evidência, mas 3 dos 12 mutantes sobreviveram. Trocar o `data-track` entre dois links que têm a mesma mensagem (barra ↔ flutuante, plataforma ↔ objetivos) passa no gate: os testes conferem se o valor está na lista, mas não se cada link manda a sua própria localização (M30, M31). Também passa o singular da calculadora aplicado a 11, 21... (M33).

---

## Conclusão das tarefas

| Tarefa | Status | Observação |
| ------ | ------ | ---------- |
| T1–T14 | ✅ Done | Igual à iteração 0. |
| Correção 1 (ANALYTICS-02/07) | ⚠️ Parcial | Lista de `location` na spec (ANALYTICS-02) e ANALYTICS-07 novo; teste `analytics.spec.js:196`. Mata M26/M27, mas não confere qual link usa cada localização (M30, M31). |
| Correção 2 (sem JS) | ✅ Done | `contact.spec.js:131`: `href` exato de todo `wa.me` sem JS, comparado com os literais da spec. Mata M28. |
| P2 (mensagem do rodapé) | ✅ Resolvida | CONTACT-02 emendado: `sticky`, `floating`, `faq` e `footer` usam a mensagem padrão; `contact.spec.js:9` segue isso. |
| P3 (WhatsApp nos cases) | ✅ Resolvida pela F3 | `#dialog-whatsapp` com `data-track="case"` (`index.html:123`, `js/dialog.js:23`); mensagem literal da spec, `target` e `rel` em `tests/e2e/cases.spec.js:100-103`; `unit/whatsapp.spec.js:27-29`. |

---

## Critérios de aceite comparados com a spec

Caminhos relativos a `tests/`. Os arquivos de teste da F2 que não mudaram desde `4a5b2ac` (`offer`, `faq`, `calculator`, `utm`, `compare`, `unit/*`) mantêm as linhas da iteração 0. Todos foram conferidos de novo contra o `index.html` atual, que já tem a F3.

### OFFER

| AC | Resultado que a spec define | Evidência (`file:line`, asserção) | Resultado |
| -- | --------------------------- | --------------------------------- | --------- |
| OFFER-01 | Todo link de cadastro diz "Montar meu app grátis" (menos o CTA do teaser da F3) | `e2e/offer.spec.js:15` `expect(labels.filter(label => label !== CTA)).toEqual([])`, `:14` ≥ 11 links, em 1440 e 390; sem JS `:25`. Os 11 links atuais conferidos no HTML | ✅ |
| OFFER-02 | Card com "R$ 399", "/mês" e os 6 fatos | `e2e/offer.spec.js:42` `toContain(fact)` para as 8 strings da spec; `:46` visíveis | ✅ |
| OFFER-03 | WhatsApp "Falar com especialista" no card com a mensagem de preço | `e2e/offer.spec.js:55-57`; literal da spec em `e2e/contact.spec.js:12,55` e `unit/whatsapp.spec.js:13,21` | ✅ |
| OFFER-04 | "próximo/próxima" ≤ 3 | `e2e/offer.spec.js:76` `toBeLessThanOrEqual(3)` (já com o conteúdo da F3) | ✅ |
| OFFER-05 | Título sem "tempo real"; selo "Exemplo do painel" ≥ 12px acima das métricas | `e2e/offer.spec.js:87,90,96,97` | ✅ |
| OFFER-06 | Zero "pushs" | `e2e/offer.spec.js:81` | ✅ |

### CONTACT

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| CONTACT-01 | "Falar com especialista" no hero, no card de preço e no fechamento | `e2e/contact.spec.js:34` `toHaveCount(1)`, `:36` visível, `:37` `href` por seção, em 1440 e 390 | ✅ |
| CONTACT-02 | Prefixo `https://wa.me/555194553299?text=`, `_blank`, `noopener`, texto = mensagem da localização; `sticky/floating/faq/footer` = padrão | `e2e/contact.spec.js:49-51`, `:52` localização conhecida, `:55` `searchParams.get('text')` = `SPEC_MESSAGES` (literais `:11-14`, mapa `:9` igual à emenda); case: `e2e/cases.spec.js:100-103` | ✅ |
| CONTACT-03 | Barra ≤ 760px com CTA e WhatsApp "Falar com especialista no WhatsApp" | `e2e/contact.spec.js:78-82`, em 390 e 760 | ✅ |
| CONTACT-04 | Flutuante > 760px no canto inferior direito só depois do hero | `e2e/contact.spec.js:91,96,99,103-106,111`, em 1440x900 e 844x390 | ✅ |
| CONTACT-05 | Rodapé com "(51) 9455-3299" (WhatsApp) e `mailto:suporte@korza.com.br` | `e2e/contact.spec.js:123,127` | ✅ |
| CONTACT-06 | Rodapé sem "Criar app grátis", só o rótulo de OFFER-01 | `e2e/contact.spec.js:22,26` | ✅ |

### FAQ

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| FAQ-01 | As 8 perguntas, nesta ordem | `e2e/faq.spec.js:37` `toEqual(QUESTIONS)` | ✅ |
| FAQ-02 | Fatos de AD-006 em cada resposta | `e2e/faq.spec.js:49` `toContainText(fact)` (M35 morto) | ✅ |
| FAQ-03 | Termina com WhatsApp "Falar com especialista" (mensagem padrão) | `e2e/faq.spec.js:56,58,66` | ✅ |

### CALC

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| CALC-01 | Campos com `label`, padrão 180 e 30 | `e2e/calculator.spec.js:10-11,24,26` | ✅ |
| CALC-02 | N = ⌈399 ÷ (ticket × margem ÷ 100)⌉ na frase "… N pedidos por mês pelo app." | `unit/calculator.spec.js:8,10,15-18`; `e2e/calculator.spec.js:28` | ⚠️ A frase só é conferida com N = 2, 3, 6, 8 e 16. Com o singular aplicado a todo N terminado em 1, "11 pedido" passa (M33). N = 11 é alcançável: ticket 121, margem 30 |
| CALC-03 | N = 1 → "1 pedido" | `unit/calculator.spec.js:25`; `e2e/calculator.spec.js:37` | ✅ |
| CALC-04 | Atualiza ao digitar; `aria-live="polite"` | `e2e/calculator.spec.js:37,40,41,42-43,46` | ✅ |
| CALC-05 | Mensagem do ticket e nenhum N | `unit/calculator.spec.js:35-36,41-44`; `e2e/calculator.spec.js:53-54` | ✅ |
| CALC-06 | Mensagem da margem e nenhum N | `unit/calculator.spec.js:50-51,57-58`; `e2e/calculator.spec.js:64-65` | ✅ |
| CALC-07 | "179,90" = 179.90 | `unit/calculator.spec.js:69,74`; `e2e/calculator.spec.js:75` | ✅ |

### ANALYTICS

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| ANALYTICS-01 | Chave vazia: nenhuma requisição ao PostHog e console limpo | `e2e/analytics.spec.js:73` `toEqual([])`, `:74` | ✅ |
| ANALYTICS-02 | Script do `api_host`; `cta_click {location, destination}`; `location` entre os 13 valores | `e2e/analytics.spec.js:84,88`, `:91-93` hero/signup exato, `:111-113` pricing e closing/whatsapp exatos; lista `:193` igual à da spec | ⚠️ Só hero, pricing e closing têm a localização ligada ao lugar do link. Nos outros 10 valores, o teste aceita qualquer valor permitido (M30, M31) |
| ANALYTICS-03 | `calculator_used` uma vez por carregamento | `e2e/analytics.spec.js:159,163,168` (M38 morto) | ✅ |
| ANALYTICS-04 | `faq_open {question}` | `e2e/analytics.spec.js:182-185,190` | ✅ |
| ANALYTICS-05 | `utm_*` em todo link de cadastro, sem duplicar | `e2e/utm.spec.js:17`, `unit/utm.spec.js:7-8,24-26,30` (M34 morto) | ✅ |
| ANALYTICS-06 | Script bloqueado: CTAs navegam e nenhum erro não tratado | `e2e/analytics.spec.js:134,137-138,142` | ✅ |
| ANALYTICS-07 | Todo link de cadastro e `wa.me` (com o diálogo de case aberto) tem `data-track` permitido, os 13 valores aparecem e cada clique emite `cta_click` com aquele `location` e o `destination` certo | `e2e/analytics.spec.js:209` `expect(LOCATIONS).toContain(link.location)`, `:210` conjunto = os 13, `:219` `destination` tirado do `href`, sem usar o código, `:221` `toEqual(expected)` na ordem e na quantidade (M26, M27, M32, M36, M37 mortos) | ✅ pelo texto do AC. ⚠️ Lacuna de precisão P4: "aquele `location`" é o próprio `data-track`, então trocar valores entre links passa (M30, M31) |

### COMP

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| COMP-01 | `table` com `th`, "Site mobile"/"App Korza", 4 linhas exatas | `e2e/compare.spec.js:21,26,28,31` | ✅ |
| COMP-02 | ≤ 760px sem rolagem horizontal | `e2e/compare.spec.js:49,53` | ✅ |

**Status**: 31/31 ACs com evidência `file:line` e asserção no valor da spec. 2 lacunas de discriminação (ANALYTICS-02/07 por troca de localização; CALC-02 no plural) e 1 lacuna de precisão (P4).

---

## Casos de borda

- [x] WhatsApp sem app no desktop: só o link `wa.me` nativo, sem tratamento extra (conferido em `js/whatsapp.js` e `index.html`).
- [x] `utm_source` repetido: só a primeira ocorrência (`unit/utm.spec.js:18-19`, `e2e/utm.spec.js:25`; M34 morto).
- [x] Sem JavaScript: links de cadastro (`e2e/offer.spec.js:19-27`); todo `wa.me` do HTML com o `href` exato da sua localização e as 7 localizações esperadas (`e2e/contact.spec.js:138` `toEqual(['closing','faq','floating','footer','hero','pricing','sticky'])`, `:140` `toBe(WA_PREFIX + encodeURIComponent(SPEC_MESSAGES[...]))`; M28 morto); calculadora com "8 pedidos" (`e2e/calculator.spec.js:89`).

---

## Sensor de discriminação

Camada expandida (medição e oferta). Cada mutação foi aplicada no worktree descartável, os arquivos indicados rodaram com `--workers=3` e o arquivo voltou com `git checkout`. O `git status` ficou limpo (só a porta local) depois de cada uma.

| # | Arquivo | Mutação | Testes | Resultado (quem matou) |
| - | ------- | ------- | ------ | ---------------------- |
| M26 | `index.html` (rodapé) | sem `data-track` no CTA de cadastro do rodapé | analytics, offer, contact, utm, sticky-cta | ✅ Morto: `analytics.spec.js:209` (`data-track de …create-account`, recebido `null`). Na 1ª rodada a falha foi outra, o diálogo de case não abriu com a máquina carregada (ver Instabilidade). Na 2ª, falhou pelo motivo certo |
| M27 | `index.html` (diálogo) | sem `data-track` no CTA de cadastro do diálogo | analytics, offer, utm, behavior, cases | ✅ Morto: `analytics.spec.js:209` |
| M28 | `index.html` + `js/main.js` | `href` do WhatsApp do hero = `#` no HTML, preenchido por JS | contact, offer, calculator, analytics, faq | ✅ Morto: `contact.spec.js:138` (falta `hero` sem JS) |
| M30 | `index.html` (barra, flutuante) | troca os `data-track` do WhatsApp da barra (`sticky`) e do flutuante (`floating`) | analytics, contact, sticky-cta, offer, faq | ❌ **Sobreviveu** (50 passed) |
| M31 | `index.html` (plataforma, objetivos) | troca os `data-track` dos CTAs de cadastro `platform` e `goals` | analytics, offer, utm, buttons, behavior | ❌ **Sobreviveu** (42 passed) |
| M32 | `js/analytics.js:14` | `wa.me` classificado como `destination: 'signup'` | analytics | ✅ Morto: `analytics.spec.js:111` e `:221` |
| M33 | `js/calculator.js:29` | singular quando `orders % 10 === 1` (11 → "11 pedido") | unit calculator, calculator, analytics | ❌ **Sobreviveu** (28 passed) |
| M34 | `js/utm.js:7,11` | repassa todas as ocorrências de cada `utm_*` (`append`, duplica `utm_source`) | unit utm, utm | ✅ Morto: `e2e/utm.spec.js:25`, `unit/utm.spec.js:16` |
| M35 | `index.html` (FAQ) | resposta do prazo sem "14 dias úteis" ("duas semanas"; o card continua igual) | faq, offer | ✅ Morto: `faq.spec.js:49` em 1440 e 390 |
| M36 | `index.html` (diálogo) | sem `data-track="case"` no WhatsApp do case (link da F3) | analytics, cases, contact | ✅ Morto: `analytics.spec.js:209` |
| M37 | `js/analytics.js:30` | listener de clique com `{ once: true }` (só o 1º CTA vira evento) | analytics | ✅ Morto: `analytics.spec.js:111`, `:221` |
| M38 | `js/calculator-ui.js:8` | `calculator_used` ao carregar, sem interação | analytics, calculator | ✅ Morto: `analytics.spec.js:159` |

**Camada**: expandida (12 mutações: M26–M28 repetidas e 9 novas)
**Resultado**: 9/12 mortos, 3 sobreviventes (M30, M31, M33). ❌ FAIL

---

## Gate

- **Comando**: `npm test -- --workers=3` (porta local 4177 no worktree)
- **Resultado**: rodada 1: **229 passed, 0 failed, 0 skipped** (1.1m), exit 0. Rodada 2: 229 passed (3.0m, máquina carregada), exit 0.
- **Contagem**: `npx playwright test --list` dá 229 em `7daf73c`, não os 230 esperados pelo orquestrador. Em `e9c5d5b` (antes da correção) são 227, então a correção somou +2 (ANALYTICS-07 e o caso sem JS). Nenhum teste foi removido nem pulado.
- **Antes da F2** (`f903985`): 89. Depois da F2 (`4a5b2ac`): 169. Agora: 229, com a F3 e a correção.
- **PERF-03** (`mockups.spec.js:15`, instabilidade conhecida fora da F2): passou nas duas rodadas.

### Instabilidade observada (não conta contra a F2, mas fica registrada)

Abrir o diálogo de case com `[data-case="loum"]` às vezes falha com a máquina carregada: o diálogo não abre (`toBeVisible` dá timeout). Vi isso uma vez em `analytics.spec.js:204` (ANALYTICS-07, 1ª rodada do M26) e uma vez em `cases.spec.js:114` (CASES-03, F3) num estresse de 210 execuções (`analytics` + `cases` + `contact`, `--repeat-each=6`). Sozinho, ANALYTICS-07 passou 15/15, e no estresse passou 6/6. É provável que seja o carrossel da F3 em movimento durante o clique. É uma área da F3, mas agora o ANALYTICS-07 depende dela. Prioridade Minor.

---

## Qualidade do código

| Princípio | Status |
| --------- | ------ |
| Correção cirúrgica: só spec e testes; nenhum código de produção mudou em `7daf73c` | ✅ |
| Nenhum teste enfraquecido; só `contact.spec.js` e `analytics.spec.js` ganharam testes | ✅ |
| Asserções no valor da spec (`LOCATIONS` = lista da spec; mensagens literais; `destination` tirado do `href`, sem usar o código) | ✅ |
| AD-004 (chave vazia não carrega nada), AD-005 (número e e-mail), AD-006 (oferta) continuam valendo com a F3 | ✅ |
| Cobertura por camada | ⚠️ Localização por link ligada ao lugar só em 3 de 13 valores; plural da calculadora só em N = 2 |
| Todo teste mapeia para AC ou caso de borda | ✅ |
| Guias de teste do projeto | nenhum; padrões fortes aplicados |

---

## Lacunas de precisão da spec

- **P4 · ANALYTICS-02/07: qual link usa qual localização.** A spec lista os 13 valores, mas não diz qual link deve usar cada um. Pelo texto, "aquele `location`" de ANALYTICS-07 é o próprio `data-track`, então trocar valores entre links atende ao AC. Os nomes deixam claro o lugar (barra = `sticky`, flutuante = `floating`, seção `#plataforma` = `platform` etc.), e o código atual está certo (conferido link a link), mas nada impede uma troca. Sugestão: uma tabela na spec ligando cada lugar (seletor ou seção) à sua localização.
- P1, P2 e P3 da iteração 0 foram resolvidas (ver "Conclusão das tarefas").

---

## Planos de correção

### Correção 3: cada link manda a localização do seu lugar (ANALYTICS-02/07; M30, M31, P4)
- **Causa**: `analytics.spec.js:209-221` aceita qualquer valor permitido e compara o evento com o próprio `data-track`. Só hero, pricing e closing são ligados ao lugar (`:90-93`, `:105-113`).
- **Tarefa**: (a) na spec, uma tabela lugar → localização (menu mobile, cabeçalho, hero, `#plataforma`, `#resultados`, card de preço, `#duvidas`, fechamento, rodapé, barra fixa, botão flutuante, diálogo, WhatsApp do case); (b) no ANALYTICS-07, procurar cada link pelo contêiner (ex.: `.sticky-cta a[href^="https://wa.me/"]` → `sticky`, `.whatsapp-float` → `floating`, `#plataforma a[href^=signup]` → `platform`) e conferir o `cta_click` exato de cada um.
- **Feito quando**: M30 e M31 morrem; M26/M27/M36 continuam mortos; gate verde.
- **Prioridade**: Major (a medição existe para saber onde o visitante clica).

### Correção 4: plural da calculadora além de N = 2 (CALC-02; M33)
- **Causa**: `paybackMessage` só é conferida com 1 e 2 (`unit/calculator.spec.js:25-26`), e o e2e usa 3, 6, 8 e 16.
- **Tarefa**: conferir a frase com N = 11 e N = 21 (unit) e um caso e2e que dá 11 (ticket 121, margem 30 → "O plano se paga com 11 pedidos por mês pelo app.").
- **Feito quando**: M33 morre; gate verde.
- **Prioridade**: Minor.

### Correção 5 (opcional, F3/infra de teste): abrir o diálogo de case sem instabilidade
- **Tarefa**: antes do clique em `[data-case]`, esperar o carrossel parar (ou interagir primeiro para pausá-lo) em `analytics.spec.js:201-205` e `cases.spec.js:114`.
- **Prioridade**: Minor.

---

## Rastreabilidade (proposta; o verificador não alterou o `spec.md`)

| Requisito | Status anterior | Novo status |
| --------- | --------------- | ----------- |
| OFFER-01..06 | ✅ Verified (it. 0) | ✅ Verified |
| CONTACT-01..06 | ✅ Verified (it. 0) | ✅ Verified |
| FAQ-01..03 | ✅ Verified (it. 0) | ✅ Verified |
| CALC-01, 03..07 | ✅ Verified (it. 0) | ✅ Verified |
| CALC-02 | ✅ Verified (it. 0) | ⚠️ Needs Fix (Correção 4, Minor) |
| ANALYTICS-01, 03..06 | ✅ Verified (it. 0) | ✅ Verified |
| ANALYTICS-02, 07 | ❌ Needs Fix | ❌ Needs Fix (Correção 3) |
| COMP-01..02 | ✅ Verified (it. 0) | ✅ Verified |
| Caso de borda sem JS | ❌ Needs Fix | ✅ Verified |

---

## Resumo

**Geral**: ❌ Not Ready
**Comparação com a spec**: 31/31 ACs com evidência; 1 lacuna de precisão (P4); 2 lacunas de discriminação (ANALYTICS-02/07, CALC-02)
**Sensor**: 9/12 mortos (M30, M31, M33 sobreviveram)
**Gate**: 229 passed, 0 failed (2 rodadas)

**O que melhorou**: todo link de cadastro e de WhatsApp agora tem `data-track` permitido e gera `cta_click` (M26, M27, M36, M37 mortos); `destination` conferido sem usar o código (M32); WhatsApp sem JS com o `href` exato (M28); mensagem padrão definida para barra, flutuante, FAQ e rodapé; WhatsApp do case coberto pela F3.

**Próximo passo**: Correções 3 e 4 (e a tabela lugar → localização na spec), depois a reverificação (iteração 2 de 3).
