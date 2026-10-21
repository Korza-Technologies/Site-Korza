# F2 · Oferta e contato · Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/lp-oferta-contato/design.md`
**Status**: Approved · **Requires**: F1 concluída (harness, módulos, `sticky-cta.js`)

---

## Test Coverage Matrix

> Same matrix as F1 (`.specs/features/lp-fundacao/tasks.md`). Guidelines found: none — strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Funções puras (`whatsapp.js`, `calculator.js`, `utm.js`) | unit | Todos os ramos; 1:1 com ACs; todo edge case | `tests/unit/*.spec.js` | `npm run test:unit` |
| Página e módulos DOM | e2e | Todo AC: feliz + edge + falha | `tests/e2e/*.spec.js` | `npm run test:e2e` |
| Docs | none | — | — | gate full |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Só unit | `npm run test:unit` |
| Full | Com e2e | `npm test` |
| Build | Fim de fase | `npm test` |

---

## Execution Plan

### Phase 1: Oferta e contato
```
T1 → T2 → T3 → T4 → T5 → T6 → T7
```
### Phase 2: FAQ, calculadora, medição e comparativo
```
T8 → T9 → T10 → T11 → T12 → T13 → T14
```

---

## Task Breakdown

### T1: Configuração e gerador de links de WhatsApp
**What**: Constantes de contato e mensagens em `js/config.js`; `waLink(location, caseName?)` puro.
**Where**: `js/config.js`, `js/whatsapp.js`, `tests/unit/whatsapp.spec.js`
**Depends on**: F1 · **Requirement**: CONTACT-02 (formato e mensagens)
**Done when**:
- [x] Unit: cada localização gera `https://wa.me/555194553299?text=` + mensagem exata codificada; case usa o nome; localização desconhecida lança erro
- [x] `npm run test:unit` verde
**Tests**: unit · **Gate**: quick
**Commit**: `feat(contato): centraliza número e mensagens do WhatsApp`
**Status**: ✅ Done (e6ed16e)

### T2: CTA único "Montar meu app grátis"
**What**: Trocar o texto de todos os links de cadastro, inclusive o rodapé ("Criar app grátis" sai); `data-track` em cada CTA.
**Where**: `index.html`
**Depends on**: T1 · **Requirement**: OFFER-01, CONTACT-06
**Done when**:
- [x] e2e OFFER-01 e CONTACT-06
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(oferta): unifica o CTA em "Montar meu app grátis"`
**Status**: ✅ Done (be87f73)

### T3: Card de preço reescrito
**What**: Card com R$ 399/mês, os 6 fatos de OFFER-02 e o link de WhatsApp de preço.
**Where**: `index.html`, `styles/components.css`
**Depends on**: T2 · **Requirement**: OFFER-02, OFFER-03
**Done when**:
- [x] e2e OFFER-02, OFFER-03 (href = `waLink('pricing')`)
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(oferta): deixa claro o que é grátis e o que é pago`
**Status**: ✅ Done (612451b)

### T4: Copy direta
**What**: Reescrever headlines e subtítulos em tom direto; "próximo/próxima" ≤ 3; zero "pushs"; analytics com selo "Exemplo do painel" e sem "tempo real".
**Where**: `index.html`, `js/dialog.js` (textos), `styles/components.css`
**Depends on**: T3 · **Requirement**: OFFER-04, OFFER-05, OFFER-06
**Done when**:
- [x] e2e OFFER-04..06; nenhuma afirmação fora de AD-006
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(copy): reescreve textos em tom direto e concreto`
**Status**: ✅ Done (78a3734; textos do diálogo e dos pushs ficam em `js/config.js`, não em `js/dialog.js`; "nenhuma afirmação fora de AD-006" é revisão manual, sem teste automático)

### T5: WhatsApp no hero e no fechamento
**What**: Links "Falar com especialista" no hero e no fechamento.
**Where**: `index.html`
**Depends on**: T4 · **Requirement**: CONTACT-01, CONTACT-02
**Done when**:
- [x] e2e CONTACT-01; CONTACT-02 para todo `wa.me` da página (comparado com `waLink`)
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(contato): adiciona WhatsApp no hero e no fechamento`
**Status**: ✅ Done (d5c4ea0)

### T6: WhatsApp na barra mobile e botão flutuante desktop
**What**: Botão de WhatsApp na barra fixa (F1) e botão flutuante no desktop, ambos pelo `sticky-cta.js`.
**Where**: `index.html`, `js/sticky-cta.js`, `styles/components.css`
**Depends on**: T5 · **Requirement**: CONTACT-03, CONTACT-04
**Done when**:
- [x] e2e CONTACT-03 (390) e CONTACT-04 (1440: oculto no hero, visível depois)
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(contato): adiciona WhatsApp fixo no mobile e flutuante no desktop`
**Status**: ✅ Done (3dca42b; `js/sticky-cta.js` reaproveitado sem mudança; a ligação do botão flutuante fica em `js/main.js`; cópia do push de exemplo corrigida em 57e6417)

### T7: Rodapé de contato
**What**: Rodapé com "(51) 9455-3299" (WhatsApp) e suporte@korza.com.br (`mailto:`).
**Where**: `index.html`
**Depends on**: T6 · **Requirement**: CONTACT-05
**Done when**:
- [x] e2e CONTACT-05
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(contato): adiciona WhatsApp e e-mail ao rodapé`
**Status**: ✅ Done (b301176; o link de WhatsApp do rodapé usa a mensagem padrão, a spec não define uma própria)

### T8: FAQ com objeções
**What**: 8 perguntas na ordem da spec, respostas com os fatos de AD-006 e link de WhatsApp no fim.
**Where**: `index.html`
**Depends on**: T7 · **Requirement**: FAQ-01, FAQ-02, FAQ-03
**Done when**:
- [x] e2e FAQ-01..03
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(faq): responde fidelidade, prazo, contas e o que é grátis`
**Status**: ✅ Done (o link de WhatsApp do FAQ ganhou uma regra em `styles/components.css` para ficar com 13px, A11Y-02; `components.css` vai para `?v=20261021f`)

### T9: Regra da calculadora
**What**: `parseBRNumber`, `paybackOrders`, `paybackMessage` puras.
**Where**: `js/calculator.js`, `tests/unit/calculator.spec.js`
**Depends on**: T8 · **Requirement**: CALC-02, CALC-03, CALC-05, CALC-06, CALC-07
**Done when**:
- [ ] Unit: 180/30 → 8; caso N=1 no singular; limites do ticket (0, 1, 100000, 100000.01, vazio, "abc"); limites da margem (0, 1, 100, 101, vazio); "179,90"; "1.234,5"
- [ ] `npm run test:unit` verde
**Tests**: unit · **Gate**: quick
**Commit**: `feat(calculadora): calcula pedidos para pagar o plano`

### T10: Interface da calculadora
**What**: Campos com `label`, resultado `aria-live`, atualização ao digitar, resultado padrão no HTML para quem está sem JS.
**Where**: `index.html`, `js/calculator-ui.js`, `styles/components.css`
**Depends on**: T9 · **Requirement**: CALC-01, CALC-04
**Done when**:
- [ ] e2e CALC-01, CALC-04, mensagens de erro na tela, sem JS mostra "8 pedidos"
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(calculadora): adiciona calculadora ao card de preço`

### T11: Módulo de analytics
**What**: `initAnalytics`/`track` com PostHog condicionado à chave; delegação `cta_click`.
**Where**: `js/analytics.js`, `js/main.js`, `tests/e2e/analytics.spec.js`
**Depends on**: T10 · **Requirement**: ANALYTICS-01, ANALYTICS-02, ANALYTICS-06
**Done when**:
- [ ] e2e: chave vazia → zero requisições aos hosts e console limpo; chave de teste (via injeção na página) + rota interceptada → script carrega do `api_host` e `cta_click` é capturado com `{location, destination}`; script bloqueado → CTAs navegam e console sem erro não tratado
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(analytics): integra PostHog desligado por padrão`

### T12: Eventos da calculadora e do FAQ
**What**: `calculator_used` uma vez por carregamento; `faq_open {question}`.
**Where**: `js/calculator-ui.js`, `js/main.js`
**Depends on**: T11 · **Requirement**: ANALYTICS-03, ANALYTICS-04
**Done when**:
- [ ] e2e: duas alterações na calculadora → 1 evento; abrir 2 perguntas → 2 eventos com o texto correto
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(analytics): mede uso da calculadora e do FAQ`

### T13: Repasse de UTM
**What**: `appendUtm` pura + `initUtm`.
**Where**: `js/utm.js`, `tests/unit/utm.spec.js`, `tests/e2e/utm.spec.js`
**Depends on**: T12 · **Requirement**: ANALYTICS-05
**Done when**:
- [ ] Unit: só `utm_*`; primeira ocorrência; não duplica; preserva query existente
- [ ] e2e: abrir `/?utm_source=ig&utm_campaign=x&foo=1` → todo link de cadastro tem `utm_source=ig&utm_campaign=x` e não tem `foo`
- [ ] `npm test` verde
**Tests**: unit + e2e · **Gate**: full
**Commit**: `feat(analytics): repassa UTM para o cadastro`

### T14: Comparativo site × app
**What**: Seção com `table` semântica e 4 linhas.
**Where**: `index.html`, `styles/components.css`
**Depends on**: T13 · **Requirement**: COMP-01, COMP-02
**Done when**:
- [ ] e2e COMP-01 e COMP-02 (390); axe da F1 continua com zero violações
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(conteudo): adiciona comparativo site mobile × app`

---

## Phase Execution Map
```
Phase 1:  T1 ──→ T2 ──→ T3 ──→ T4 ──→ T5 ──→ T6 ──→ T7
Phase 2:  T8 ──→ T9 ──→ T10 ──→ T11 ──→ T12 ──→ T13 ──→ T14
```

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | config + 1 função | ✅ |
| T2 | 1 texto em N links | ✅ |
| T3 | 1 componente | ✅ |
| T4 | copy (1 arquivo + textos) | ⚠️ OK, coeso |
| T5 | 2 links | ✅ |
| T6 | 1 comportamento em 2 tamanhos | ✅ |
| T7 | 1 componente | ✅ |
| T8 | 1 componente | ✅ |
| T9 | 3 funções do mesmo domínio | ⚠️ OK, coeso |
| T10 | 1 componente | ✅ |
| T11 | 1 módulo | ✅ |
| T12 | 2 eventos | ✅ |
| T13 | 1 função + init | ✅ |
| T14 | 1 seção | ✅ |

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram | Status |
| ---- | ----------------- | ------- | ------ |
| T1 | F1 | início | ✅ |
| T2..T7 | anterior | cadeia Phase 1 | ✅ |
| T8 | T7 | Phase1→T8 | ✅ |
| T9..T14 | anterior | cadeia Phase 2 | ✅ |

## Test Co-location Validation

| Task | Layer | Matrix Requires | Task Says | Status |
| ---- | ----- | --------------- | --------- | ------ |
| T1, T9 | funções puras | unit | unit | ✅ |
| T13 | função pura + página | unit + e2e | unit + e2e | ✅ |
| T2–T8, T10–T12, T14 | página / DOM | e2e | e2e | ✅ |
