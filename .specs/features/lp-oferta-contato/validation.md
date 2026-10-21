# F2 lp-oferta-contato: validação (iteração 0)

**Data**: 2026-10-21
**Spec**: `.specs/features/lp-oferta-contato/spec.md`
**Intervalo do diff**: `f903985..4a5b2ac`, só os commits da F2: Fase 1 `e6ed16e be87f73 612451b 78a3734 d5c4ea0 3dca42b 57e6417 b301176` (+ `3dd5a03` docs); Fase 2 `80b4232 c5aac8b e8b3c4a 6245ab1 22c0d59 a418702 8d05a77` (+ `23d3b67` docs). Ficam de fora `3fafe22`, `157a838` e `4a5b2ac` (F1).
**Superfície da F2**: `index.html`, `js/config.js`, `js/whatsapp.js`, `js/calculator.js`, `js/calculator-ui.js`, `js/analytics.js`, `js/utm.js`, `js/main.js`, `styles/components.css`, `tests/unit/{whatsapp,calculator,utm}.spec.js`, `tests/e2e/{offer,contact,faq,calculator,analytics,utm,compare}.spec.js`, `tests/e2e/sticky-cta.spec.js:42`
**Iteração**: 0 de 3
**Verificador**: sub-agente independente (autor ≠ verificador). Worktree descartável em `4a5b2ac`, porta 4176 só local, `--workers=3`. Todas as mutações foram desfeitas e o worktree foi removido no fim. Nenhuma requisição saiu para `burrito.korza.com.br`, `*.posthog.com` ou outro host da Korza: as mutações de analytics rodaram só com `tests/e2e/analytics.spec.js`, onde todo teste intercepta o host do PostHog (abort ou script falso) e os destinos (`admin.korza.app`, `wa.me`).
**Veredito**: ❌ FAIL. Os 30 ACs têm evidência e o gate está verde, mas 3 dos 29 mutantes sobreviveram: o `cta_click` não é garantido em todos os CTAs (ANALYTICS-02) e não há evidência dos links de WhatsApp sem JavaScript (caso de borda).

---

## Conclusão das tarefas

| Tarefa | Status | Observação |
| ------ | ------ | ---------- |
| T1–T14 | ✅ Done | Hashes em `tasks.md` batem com `git log`. Desvios declarados pelo autor conferidos: `paybackOrders` devolve `{ok:false, errors:[...]}` (`js/calculator.js:24`); `calculator_used` sem propriedades (`js/calculator-ui.js:20`); UTM substitui a mesma chave já existente (`js/utm.js:11`, `set`); WhatsApp do FAQ e do rodapé usa a mensagem padrão (`index.html`, `data-track="faq"`/`"footer"`); `tests/e2e/sticky-cta.spec.js:42` mudou só o texto ("Criar conta grátis" → "Montar meu app grátis"), coerente com OFFER-01, sem enfraquecer a asserção. |

---

## Critérios de aceite comparados com a spec

Caminhos relativos a `tests/`.

### OFFER

| AC | Resultado que a spec define | Evidência (`file:line`, asserção) | Resultado |
| -- | --------------------------- | --------------------------------- | --------- |
| OFFER-01 | Todo link de cadastro com o texto "Montar meu app grátis" | `e2e/offer.spec.js:15` `expect(labels.filter(label => label !== CTA)).toEqual([])` com `:14` ≥ 11 links, em 1440 e 390; sem JS `:25` | ✅ |
| OFFER-02 | Card com "R$ 399", "/mês" e os 6 fatos | `e2e/offer.spec.js:42` `expect(text, fact).toContain(fact)` para as 8 strings literais da spec; `:46` fatos visíveis | ✅ |
| OFFER-03 | WhatsApp "Falar com especialista" no card com a mensagem de preço | `e2e/offer.spec.js:55` `toHaveAttribute('href', waLink('pricing'))`, `:56` `target`, `:57` `rel` noopener; a mensagem de `waLink('pricing')` é ancorada no literal da spec em `unit/whatsapp.spec.js:13,21` e `e2e/contact.spec.js:12,55` (M10 morto) | ✅ |
| OFFER-04 | "próximo/próxima" ≤ 3 no texto visível | `e2e/offer.spec.js:76` `toBeLessThanOrEqual(3)` sobre `innerText` + textos injetados por JS (diálogo e pushs) | ✅ |
| OFFER-05 | Título sem "tempo real"; selo "Exemplo do painel" ≥ 12px acima das métricas | `e2e/offer.spec.js:87` `not.toContainText(/tempo real/i)`, `:90` visível, `:96` `size ≥ 12`, `:97` `bottom ≤ firstCardTop` | ✅ |
| OFFER-06 | Zero "pushs" | `e2e/offer.spec.js:81` `expect(text.match(/\bpushs\b/gi) \|\| []).toEqual([])` | ✅ |

**AD-006 (revisão manual do texto visível de `index.html` e de `js/config.js`)**: as afirmações de oferta são só as aprovadas (cadastro grátis com onboarding e prévia; app construído e publicado com o plano de R$ 399/mês; sem fidelidade nem taxa de implantação; média de 7 e máximo de 14 dias úteis; contas da Korza e migração sem custo, pagando só a conta de desenvolvedor). Nenhuma afirmação de oferta fora da lista. ✅

### CONTACT

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| CONTACT-01 | "Falar com especialista" no hero, no card de preço e no fechamento | `e2e/contact.spec.js:34` `toHaveCount(1)`, `:36` visível, `:37` `href` = `waLink(location)` por seção, em 1440 e 390 | ✅ |
| CONTACT-02 | `href` com prefixo `https://wa.me/555194553299?text=`, `target=_blank`, `rel` com noopener, texto decodificado = mensagem da localização | `e2e/contact.spec.js:49` prefixo, `:50` target, `:51` noopener, `:55` `searchParams.get('text')` = `SPEC_MESSAGES[...]` (literais da spec em `:11-14`), para todo `a[href*="wa.me"]`; `unit/whatsapp.spec.js:21-22` | ✅ (ver lacuna de precisão P2) |
| CONTACT-03 | Barra ≤ 760px com CTA principal e WhatsApp com nome acessível "Falar com especialista no WhatsApp" | `e2e/contact.spec.js:78` CTA visível, `:79-81` `getByRole('link', {name, exact})` visível com `href` `waLink('floating')`, `:82` não coberto, em 390 e 760 | ✅ |
| CONTACT-04 | > 760px: flutuante no canto inferior direito depois do hero; oculto com o hero visível | `e2e/contact.spec.js:91,96` oculto no topo e com parte do hero, `:99` visível depois, `:103-106` canto inferior direito, `:111` oculto ao voltar; em 1440x900 e 844x390 | ✅ |
| CONTACT-05 | Rodapé com "(51) 9455-3299" (WhatsApp) e "suporte@korza.com.br" (`mailto:`) | `e2e/contact.spec.js:123` `href` `waLink('floating')`, `:127` `toHaveAttribute('href', 'mailto:suporte@korza.com.br')`, em 1440 e 390 | ✅ |
| CONTACT-06 | Rodapé sem "Criar app grátis" e só com o rótulo de OFFER-01 | `e2e/contact.spec.js:22` `not.toContainText('Criar app grátis')`, `:26` `toHaveText(CTA)` | ✅ |

### FAQ

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| FAQ-01 | Exatamente as 8 perguntas, nesta ordem | `e2e/faq.spec.js:37` `expect(await questionTexts(page)).toEqual(QUESTIONS)` (literais da spec em `:6-15`) | ✅ |
| FAQ-02 | Respostas com os fatos de AD-006 | `e2e/faq.spec.js:49` `toContainText(fact)` para os 4 pares da spec, depois de abrir (`:47-48`) | ✅ |
| FAQ-03 | FAQ termina com WhatsApp "Falar com especialista" (mensagem padrão) | `e2e/faq.spec.js:56` texto, `:58` `text` = mensagem padrão, `:66` depois da última pergunta | ✅ |

### CALC

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| CALC-01 | Campos "Ticket médio (R$)" = 180 e "Margem (%)" = 30 com `label` | `e2e/calculator.spec.js:10-11` `getByLabel(..., {exact:true})`, `:24` `toHaveValue('180')`, `:26` `toHaveValue('30')` | ✅ |
| CALC-02 | N = ⌈399 ÷ (ticket × margem ÷ 100)⌉; 180/30 → 8; frase exata | `unit/calculator.spec.js:8` `toEqual({ok:true, orders:8})`, `:10` frase exata, `:15-18` teto; `e2e/calculator.spec.js:28` | ✅ |
| CALC-03 | N = 1 → "1 pedido" | `unit/calculator.spec.js:25` `toBe('O plano se paga com 1 pedido por mês pelo app.')`; `e2e/calculator.spec.js:37` | ✅ |
| CALC-04 | Atualiza sem recarregar nem clicar; `aria-live="polite"` | `e2e/calculator.spec.js:37,40` texto muda ao digitar, `:41` `aria-live` polite, `:42-43` mesma página, `:46` nenhum botão | ✅ |
| CALC-05 | Ticket vazio, não numérico, ≤ 0 ou > 100000 → mensagem exata e nenhum N | `unit/calculator.spec.js:35-36` para `''`, `'abc'`, `0`, `-5`, `100000.01` etc.; `:41-44` limites 1 e 100000 válidos; `e2e/calculator.spec.js:53-54` | ✅ |
| CALC-06 | Margem vazia, não numérica, ≤ 0 ou > 100 → mensagem exata e nenhum N | `unit/calculator.spec.js:50-51`, `:57-58` limites 1 e 100; `e2e/calculator.spec.js:64-65` | ✅ |
| CALC-07 | "179,90" = 179.90 | `unit/calculator.spec.js:69` `toBe(179.9)`, `:74`; `e2e/calculator.spec.js:75` 179,90/100% → 3 | ✅ |

### ANALYTICS

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| ANALYTICS-01 | Chave vazia: zero requisições aos hosts do PostHog e console sem erro | `e2e/analytics.spec.js:73` `requests.filter(ANALYTICS_HOSTS)` `toEqual([])` depois de FAQ, calculadora e cliques; `:74` `errors` `toEqual([])` | ✅ |
| ANALYTICS-02 | Script do `api_host`; todo clique em CTA emite `cta_click {location, destination: signup\|whatsapp}` | `e2e/analytics.spec.js:84` script de `POSTHOG_API_HOST`, `:88` `options.api_host`, `:91-93` `{location:'hero', destination:'signup'}` exato; `:111-113` `{location:'pricing'\|'closing', destination:'whatsapp'}` | ❌ Lacuna: só 3 dos 18 links com `data-track` são exercitados; tirar `data-track` de um CTA de cadastro (rodapé, diálogo) cala o evento e nenhum teste falha (M26, M27). Também lacuna de precisão P1 |
| ANALYTICS-03 | `calculator_used` uma única vez por carregamento, no primeiro N válido depois de mexer | `e2e/analytics.spec.js:159` 0 com valor inválido, `:163` 1 no primeiro N válido, `:168` continua 1 | ✅ |
| ANALYTICS-04 | `faq_open {question}` | `e2e/analytics.spec.js:182-185` `toEqual([{event:'faq_open', properties:{question:'O que é grátis e o que é pago?'}}, ...])`, `:190` fechar não emite | ✅ |
| ANALYTICS-05 | Links de cadastro recebem os mesmos `utm_*`, sem duplicar | `e2e/utm.spec.js:17` `toBe(\`${SIGNUP}?utm_source=ig&utm_campaign=x\`)` para todos (≥ 11), `:16` sem `foo`; `unit/utm.spec.js:7-8,24-26,30` | ✅ |
| ANALYTICS-06 | Script bloqueado: CTAs navegam e nenhum erro não tratado | `e2e/analytics.spec.js:134` popup `wa.me/555194553299?text=`, `:137-138` cadastro abre, `:142` só a nota do navegador sobre o recurso bloqueado | ✅ |

### COMP

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| COMP-01 | `table` com `th`, colunas "Site mobile" e "App Korza", exatamente as 4 linhas | `e2e/compare.spec.js:21` colunas, `:26` 4 linhas, `:28` `toEqual(ROWS)` (literais da spec em `:5-10`), `:31` 2 células por linha | ✅ |
| COMP-02 | ≤ 760px sem rolagem horizontal do documento | `e2e/compare.spec.js:49` tabela dentro da largura, `:53` `scrollWidth ≤ clientWidth`, em 390 e 360 | ✅ |

**Status**: 29/30 ACs com a asserção no valor da spec; ANALYTICS-02 com lacuna de cobertura (mutantes sobreviventes).

---

## Casos de borda

- [x] WhatsApp sem app no desktop: nenhum tratamento extra, só o link `wa.me` nativo (conferido em `js/whatsapp.js` e `index.html`). Não há o que testar.
- [x] `utm_source` repetido: só a primeira ocorrência (`unit/utm.spec.js:18-19`, `e2e/utm.spec.js:25`; M07 morto).
- [ ] Sem JavaScript: links de cadastro com o texto e o `href` certos (`e2e/offer.spec.js:19-27`) ✅; calculadora mostra "8 pedidos" (`e2e/calculator.spec.js:89`) ✅; **links de WhatsApp sem JS: nenhuma evidência**. O M28 (`href` do WhatsApp do hero só preenchido por JS) sobreviveu. ❌

---

## Sensor de discriminação

Camada expandida (P0 de medição e oferta). Cada mutação foi aplicada no worktree descartável, os testes indicados rodaram com `--workers=3` e o arquivo voltou com `git checkout`.

| # | Arquivo | Mutação | Testes | Resultado (quem matou) |
| - | ------- | ------- | ------ | ---------------------- |
| M01 | `js/calculator.js:25` | `Math.ceil` → `Math.round` | unit + calculator | ✅ Morto (CALC-02/03/05/06) |
| M02 | `js/calculator.js:23` | aceita margem 0 (`> 0` → `>= 0`) | unit + calculator | ✅ Morto (CALC-06) |
| M03 | `js/calculator.js:11` | vírgula decimal ignorada (`replace(',', '')`) | unit + calculator | ✅ Morto (CALC-07) |
| M04 | `js/calculator.js:29` | singular em N = 0 em vez de N = 1 | unit + calculator | ✅ Morto (CALC-03/04) |
| M05 | `js/calculator.js:22` | ticket 100000 vira inválido (`<=` → `<`) | unit + calculator | ✅ Morto (CALC-05) |
| M06 | `js/utm.js:7` | repassa parâmetros que não são `utm_*` | unit + utm | ✅ Morto (ANALYTICS-05) |
| M07 | `js/utm.js:7` | última ocorrência no lugar da primeira | unit + utm | ✅ Morto (caso de borda UTM) |
| M08 | `js/utm.js:11` | `set` → `append` (duplica a chave) | unit + utm | ✅ Morto (ANALYTICS-05 sem duplicar) |
| M09 | `js/main.js:15` | `initUtm()` removido | unit + utm | ✅ Morto (ANALYTICS-05 e2e) |
| M10 | `js/config.js:34` | mensagem de preço sem "R$ 399" | unit + contact + offer | ✅ Morto (CONTACT-02 contra literal da spec; o espelho `waLink` não esconde) |
| M11 | `index.html` | WhatsApp do card com a mensagem padrão | contact + offer | ✅ Morto (OFFER-03, CONTACT-01/02) |
| M12 | `index.html` | 1ª e 2ª perguntas do FAQ trocadas | faq | ✅ Morto (FAQ-01) |
| M13 | `index.html` | linha "Ícone na tela inicial" reescrita | compare | ✅ Morto (COMP-01) |
| M14 | `index.html` | 4ª linha do comparativo removida | compare | ✅ Morto (COMP-01) |
| M15 | `index.html` | resultado padrão "7 pedidos" no HTML | calculator | ✅ Morto (CALC-01, sem JS) |
| M16 | `index.html` | e-mail do rodapé sem `mailto:` | contact | ✅ Morto (CONTACT-05) |
| M17 | `index.html` | "Sem taxa de implantação" → "Taxa de implantação reduzida" | offer | ✅ Morto (OFFER-02) |
| M18 | `js/analytics.js:20` | carrega o PostHog com chave vazia | analytics | ✅ Morto (ANALYTICS-01) |
| M19 | `js/analytics.js:25,36` | script com falha + `track` sem `try` lança | analytics | ✅ Morto (ANALYTICS-06) |
| M20 | `js/calculator-ui.js:19` | `calculator_used` a cada N válido | analytics | ✅ Morto (ANALYTICS-03) |
| M21 | `js/main.js:39` | `question` com o "+" decorativo | analytics | ✅ Morto (ANALYTICS-04) |
| M22 | `js/analytics.js:29` | `location` fixo `'cta'` | analytics | ✅ Morto (ANALYTICS-02) |
| M23 | `js/analytics.js:29` | `preventDefault` no clique (CTA não navega) | analytics | ✅ Morto (ANALYTICS-02/06) |
| M24 | `js/main.js:42` | flutuante observa o rodapé em vez do hero | contact | ✅ Morto (CONTACT-04) |
| M25 | `index.html` | nome acessível do WhatsApp da barra → "WhatsApp" | contact | ✅ Morto (CONTACT-03) |
| M26 | `index.html` | sem `data-track` no CTA de cadastro do rodapé | analytics + offer + contact + utm + sticky-cta | ❌ **Sobreviveu** (45 passed) |
| M27 | `index.html` | sem `data-track` no CTA de cadastro do diálogo | analytics + offer + contact + utm + behavior | ❌ **Sobreviveu** (37 passed) |
| M28 | `index.html` + `js/main.js` | `href` do WhatsApp do hero = `#` no HTML, preenchido por JS | contact + offer + calculator + analytics + faq | ❌ **Sobreviveu** (46 passed) |
| M29 | `styles/components.css:150` | flutuante também visível em ≤ 760px | contact + sticky-cta + visual | ✅ Morto (CONTACT-03: o flutuante cobre o WhatsApp da barra) |

**Camada**: expandida (29 mutações)
**Resultado**: 26/29 mortos, 3 sobreviventes. ❌ FAIL

---

## Gate

- **Comando**: `npm test -- --workers=3` (porta local 4176 no worktree)
- **Resultado**: 169 passed, 0 failed, 0 skipped (1.5m), exit 0. Bate com os 169 informados pelos autores.
- **Testes antes da F2** (`f903985`): 89. **Depois** (`4a5b2ac`): 169. Delta +80: 75 nos arquivos da F2 (3 unit + 7 e2e) e 5 da correção da F1 em `157a838`.
- **Testes da F1**: verdes. Única alteração da F2 em teste anterior: `tests/e2e/sticky-cta.spec.js:42` (troca de texto, mesma força).
- **Pulados**: nenhum.

---

## Qualidade do código

| Princípio | Status |
| --------- | ------ |
| Código mínimo, sem abstração de uso único | ✅ |
| Mudanças cirúrgicas, sem escopo extra | ✅ (`waLink('case')` existe e é testado, mas nenhum link de case usa ainda; ver P3) |
| Segue os padrões (módulos ES em `js/`, config em `js/config.js`, AD-007) | ✅ |
| AD-004: chave vazia não carrega nada (`js/analytics.js:20`, M18 morto) | ✅ |
| AD-005: número e e-mail certos | ✅ |
| AD-006: nenhuma afirmação de oferta fora da lista | ✅ (revisão manual) |
| AD-008: todo commit que mexe em CSS troca `?v=` (612451b b, 78a3734 c, 3dca42b d, 80b4232 f, e8b3c4a g, 8d05a77 h) | ✅ |
| Asserções no valor da spec (literais da spec nos testes, não só o espelho `waLink`) | ✅ |
| Cobertura por camada (funções puras 1:1 com ACs; e2e feliz + borda + falha) | ⚠️ ANALYTICS-02 só por amostra; sem JS do WhatsApp sem evidência |
| Todo teste mapeia para AC, caso de borda ou "Done when" | ✅ |
| Guias de teste do projeto | nenhum; padrões fortes aplicados |

---

## Lacunas de precisão da spec (não bloqueiam sozinhas)

- **P1 · ANALYTICS-02**: a spec não define os valores de `location`. O código usa os nomes de `data-track` (`hero`, `pricing`, `closing`, `nav`, `menu`, `platform`, `goals`, `faq`, `footer`, `sticky`, `floating`, `dialog`), e só três são conferidos. Sem a lista, nenhum teste consegue afirmar o conjunto completo.
- **P2 · CONTACT-02 no rodapé**: "a mensagem definida para aquela localização" não tem mensagem definida para o rodapé (e o FAQ só diz "mensagem padrão"). O código usa a mensagem do flutuante; os testes aceitam essa escolha (`e2e/contact.spec.js:9`).
- **P3 · Meta "cases"**: o objetivo da spec cita WhatsApp nos cases e as Assumptions definem a mensagem do case, mas nenhum AC exige o link e a página não tem nenhum. `waLink('case')` só é usado no teste unitário.

---

## Planos de correção

### Correção 1: `cta_click` garantido em todo CTA (ANALYTICS-02; M26, M27)
- **Causa**: o evento depende de `data-track` em cada `<a>` (`js/analytics.js:27-29`), e os testes só clicam no cadastro do hero e no WhatsApp do card e do fechamento. Um CTA sem `data-track` não emite nada e o gate fica verde.
- **Tarefa**: (a) fixar na spec a lista de `location` (P1); (b) teste e2e que lista todo `a[href^="https://admin.korza.app/create-account"]` e todo `a[href^="https://wa.me/"]` e exige `data-track` dentro dessa lista; e/ou, com a chave de teste, dispara um clique em cada CTA (com destinos interceptados) e confere `{location, destination}` exato para cada um.
- **Feito quando**: M26 e M27 morrem; gate verde.
- **Prioridade**: Major.

### Correção 2: links de WhatsApp sem JavaScript (caso de borda; M28)
- **Causa**: os testes de sem JS cobrem só os links de cadastro e a calculadora.
- **Tarefa**: teste e2e com `javaScriptEnabled: false` que confere, para todo `a[href*="wa.me"]`, o `href` exato da sua localização (mesma tabela de `e2e/contact.spec.js:9-15`) e a presença dos links do hero, do card, do FAQ, do fechamento e do rodapé.
- **Feito quando**: M28 morre; gate verde.
- **Prioridade**: Major.

---

## Rastreabilidade (proposta; `spec.md` não foi alterado pelo verificador)

| Requisito | Status anterior | Novo status |
| --------- | --------------- | ----------- |
| OFFER-01..06 | Implemented, aguardando Verifier | ✅ Verified |
| CONTACT-01..06 | Implemented, aguardando Verifier | ✅ Verified |
| FAQ-01..03 | Implemented, aguardando Verifier | ✅ Verified |
| CALC-01..07 | Implemented, aguardando Verifier | ✅ Verified |
| ANALYTICS-01, 03..06 | Implemented, aguardando Verifier | ✅ Verified |
| ANALYTICS-02 | Implemented, aguardando Verifier | ❌ Needs Fix (Correção 1) |
| COMP-01..02 | Implemented, aguardando Verifier | ✅ Verified |
| Caso de borda sem JS | — | ❌ Needs Fix (Correção 2) |

---

## Resumo

**Geral**: ❌ Not Ready
**Comparação com a spec**: 29/30 ACs com asserção no valor da spec; ANALYTICS-02 com lacuna; 3 lacunas de precisão (P1–P3)
**Sensor**: 26/29 mortos (M26, M27, M28 sobreviveram)
**Gate**: 169 passed, 0 failed

**O que funciona**: oferta e AD-006, todos os links de WhatsApp com a mensagem literal da spec, FAQ, calculadora (fórmula, limites, vírgula, `aria-live`, sem JS), PostHog desligado com chave vazia, falha do script sem quebrar a página, `calculator_used` único, `faq_open` com o texto, UTM, comparativo.

**Próximo passo**: Correções 1 e 2 (mais a lista de `location` na spec) e depois a reverificação (iteração 1 de 3).
