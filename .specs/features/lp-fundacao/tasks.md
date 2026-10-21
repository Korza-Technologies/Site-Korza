# F1 · Fundação · Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/lp-fundacao/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from project guidelines and spec. Guidelines found: none (repo sem testes) — strong defaults applied; test types confirmed with the user via AD-002/AD-007.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Funções puras em `js/` (sem DOM) | unit | Todos os ramos; 1:1 com os ACs; todo edge case listado | `tests/unit/*.spec.js` | `npm run test:unit` |
| Página (HTML, CSS, módulos DOM em `js/`) | e2e | Todo AC no(s) viewport(s) citados: caminho feliz + edge + falha | `tests/e2e/*.spec.js` | `npm run test:e2e` |
| Assets gerados (`scripts/optimize-assets.sh`) | e2e | Tamanho, dimensão, formato e referência de cada arquivo | `tests/e2e/assets.spec.js` | `npm run test:e2e` |
| Docs / `.specs` / configuração do harness | none | — | — | gate full |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Tarefas só com testes unitários | `npm run test:unit` |
| Full | Tarefas com e2e | `npm test` |
| Build | Fim de fase (não há build; equivale ao full) | `npm test` |

---

## Execution Plan

### Phase 1: Harness e performance
```
T1 → T2 → T3 → T4 → T5
```
### Phase 2: Módulos e movimento
```
T6 → T7 → T8
```
### Phase 3: Mobile, botões e acessibilidade
```
T9 → T10 → T11 → T12 → T13 → T14
```

---

## Task Breakdown

### T1: Harness de testes
**What**: `package.json` (scripts `test`, `test:unit`, `test:e2e`; devDeps `@playwright/test`, `@axe-core/playwright`), `playwright.config.js` (webServer `python3 -m http.server 4173`), `.gitignore` (`node_modules/`, `test-results/`, `playwright-report/`), `tests/helpers.js` e smoke test.
**Where**: raiz, `tests/`
**Depends on**: None
**Requirement**: AD-002 (suporte a todos os ACs)
**Tools**: Skill NONE
**Done when**:
- [ ] Smoke e2e: página carrega em 1440 e 390 sem erro de console e com `h1` visível
- [ ] Teste MOB-07 (sem rolagem horizontal em 1440/1280/820/390/360) passa (já vale hoje)
- [ ] `npm test` verde · Test count: ≥ 2
**Tests**: e2e · **Gate**: full
**Commit**: `test: adiciona harness Playwright e smoke test`
**Status**: ✅ Done (8a68067)

### T2: Fontes em WOFF2
**What**: Converter `jakarta-{400,600,700}.ttf` para WOFF2, atualizar `@font-face` e `preload`, remover TTF.
**Where**: `scripts/optimize-assets.sh`, `assets/`, `styles.css`, `index.html`
**Depends on**: T1 · **Requirement**: PERF-06
**Done when**:
- [ ] Teste: toda fonte carregada tem `content-type`/extensão WOFF2 e o texto usa "Jakarta" (não fallback)
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `perf(fonts): converte Plus Jakarta Sans para WOFF2`
**Status**: ✅ Done (1dcdd32)

### T3: Mockups em WebP/AVIF responsivos
**What**: Gerar mockups 480w/800w em AVIF e WebP; trocar `<img>` por `<picture>` com `srcset/sizes` no hero, card do app e cases; atualizar `brands` do seletor.
**Where**: `scripts/optimize-assets.sh`, `assets/`, `index.html`, `app.js`
**Depends on**: T2 · **Requirement**: PERF-03
**Done when**:
- [ ] Teste: cada arquivo de mockup servido ≤ 200.000 bytes
- [ ] Teste: seletor de marca troca a imagem para a marca escolhida (comportamento atual preservado)
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `perf(images): serve mockups em AVIF/WebP responsivos`
**Status**: ✅ Done

### T4: Logo Shopify e sprite de clientes otimizados
**What**: Logo Shopify ≤ 20KB; sprite de clientes em WebP reduzido mantendo proporção; atualizar referências.
**Where**: `scripts/optimize-assets.sh`, `assets/`, `index.html`
**Depends on**: T3 · **Requirement**: PERF-04, PERF-05
**Done when**:
- [ ] Testes: logo Shopify ≤ 20.000 bytes; sprite ≤ 250.000 bytes; logos aparecem recortados como antes (screenshot de um emblema com conteúdo não vazio)
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `perf(images): reduz logo Shopify e sprite de clientes`

### T5: Limpeza de assets e orçamento de peso
**What**: Remover arquivos não referenciados de `assets/`; testes de referência e de peso total.
**Where**: `assets/`, `tests/e2e/assets.spec.js`, `tests/e2e/performance.spec.js`
**Depends on**: T4 · **Requirement**: PERF-01, PERF-02, PERF-07
**Done when**:
- [ ] Teste PERF-07 (todo asset referenciado e existente)
- [ ] Teste PERF-01 (≤ 1.500.000 bytes sem rolar, 390×844) e PERF-02 (≤ 3.000.000 após rolar)
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `perf: remove assets sem uso e adiciona orçamento de peso`

### T6: Migrar app.js para módulos ES
**What**: Dividir `app.js` em `js/main.js`, `js/config.js` e módulos por comportamento (design); `<script type="module" src="js/main.js">`; remover `app.js`.
**Where**: `js/`, `index.html`
**Depends on**: T5 · **Requirement**: AD-007
**Done when**:
- [ ] Testes e2e de comportamento preservado: menu mobile abre/fecha com Esc; seletor de marca; diálogo abre e fecha devolvendo foco; setas do carrossel mudam o ponto ativo; ano do rodapé
- [ ] `npm test` verde · Test count não diminui
**Tests**: e2e · **Gate**: full
**Commit**: `refactor(js): migra app.js para módulos ES nativos`

### T7: Controlador de movimento e botão de pausa
**What**: `js/motion.js` + botão "Pausar animações" (canto inferior esquerdo) integrado a marquee, pushs, carrossel, faturamento e contador.
**Where**: `js/motion.js`, módulos animados, `index.html`, `styles/components.css` (cria e linka)
**Depends on**: T6 · **Requirement**: A11Y-03, A11Y-04, A11Y-05, A11Y-06
**Done when**:
- [ ] Testes: estado inicial `aria-pressed=false`; ao pausar, os 4 critérios de A11Y-04 nos tempos definidos; retomar volta; reduced motion = pausado; trocar de aba mantém pausa
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(a11y): adiciona controle para pausar animações`

### T8: Barra fixa de CTA no mobile
**What**: `js/sticky-cta.js` + barra inferior com o CTA principal em ≤ 760px.
**Where**: `js/sticky-cta.js`, `index.html`, `styles/components.css`
**Depends on**: T7 · **Requirement**: MOB-04, MOB-05
**Done when**:
- [ ] Testes: oculta no topo; visível no meio da página; oculta com `.plan-price` visível; oculta no footer; `inert` quando oculta; nunca visível em 1440; sem JS não aparece
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(mobile): adiciona barra fixa de CTA`

### T9: Hero mobile e celular deitado
**What**: Mostrar a cena do hero no mobile, CTA largo de 16px/48px, fita fora do título, header compacto em altura ≤ 500px.
**Where**: `styles/components.css`, `index.html`
**Depends on**: T8 · **Requirement**: MOB-01, MOB-02, MOB-03, MOB-06, MOB-07
**Done when**:
- [ ] Testes MOB-01/02/03 em 390×844 e 360×740; MOB-06 em 844×390; MOB-07 continua verde
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(mobile): mostra o app e reforça o CTA no hero mobile`

### T10: Botões estranhos (selos, chips, seletor)
**What**: Selos das lojas como legenda; chips como texto com as categorias reais; seletor com rótulo "Veja o app de:" e alvos de 44px.
**Where**: `index.html`, `styles/components.css`, `js/brand-picker.js`
**Depends on**: T9 · **Requirement**: BTN-01, BTN-02, BTN-03
**Done when**:
- [ ] Testes BTN-01, BTN-02, BTN-03
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `fix(ui): remove aparência de botão de elementos estáticos`

### T11: Botões estranhos (carrossel, preço, selo, objetivos)
**What**: Alvos 44×44 no carrossel; remover login do card de preço; selo do hero com "60+" e `#cases`; pergunta antes do botão nos objetivos.
**Where**: `index.html`, `styles/components.css`
**Depends on**: T10 · **Requirement**: BTN-04, BTN-05, BTN-06, BTN-07
**Done when**:
- [ ] Testes BTN-04..07
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `fix(ui): corrige alvos de toque e ordem dos CTAs`

### T12: Texto mínimo, ilustrações e alt
**What**: Marcar ilustrações com `data-illustration` (+ `role="img"`/`aria-label` ou `aria-hidden`); subir todo texto restante para ≥ 12px; corrigir `alt` repetidos da faixa de logos.
**Where**: `index.html`, `styles/components.css`
**Depends on**: T11 · **Requirement**: A11Y-02, A11Y-07, A11Y-08
**Done when**:
- [ ] Testes A11Y-02 (1440 e 390), A11Y-07, A11Y-08
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `fix(a11y): garante texto mínimo de 12px e alt únicos`

### T13: Zero violações do axe
**What**: Corrigir contraste e demais violações apontadas pelo axe.
**Where**: `styles/components.css`, `index.html`
**Depends on**: T12 · **Requirement**: A11Y-01
**Done when**:
- [ ] Teste axe (tags da spec) com zero violações em 1440×900 e 390×844 após rolar
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `fix(a11y): zera violações WCAG 2.2 AA do axe`

### T14: Open Graph e ícone
**What**: Gerar `og-image.jpg` 1200×630 e `apple-touch-icon.png` 180×180; metatags OG/Twitter.
**Where**: `scripts/optimize-assets.sh`, `assets/`, `index.html`
**Depends on**: T13 · **Requirement**: META-01, META-02, META-03
**Done when**:
- [ ] Testes META-01..03
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(seo): adiciona prévia Open Graph e apple-touch-icon`

---

## Phase Execution Map
```
Phase 1:  T1 ──→ T2 ──→ T3 ──→ T4 ──→ T5
Phase 2:  T6 ──→ T7 ──→ T8
Phase 3:  T9 ──→ T10 ──→ T11 ──→ T12 ──→ T13 ──→ T14
```

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | harness (config + helpers) | ✅ coeso |
| T2 | 1 tipo de asset | ✅ |
| T3 | 1 tipo de asset + suas referências | ✅ |
| T4 | 2 assets relacionados | ⚠️ OK, coeso |
| T5 | limpeza + orçamento | ⚠️ OK, coeso |
| T6 | refatoração 1:1 de 1 arquivo | ⚠️ OK, sem mudança de comportamento |
| T7 | 1 componente | ✅ |
| T8 | 1 componente | ✅ |
| T9 | 1 seção (hero) | ✅ |
| T10 | 3 correções de 1 tipo | ⚠️ OK, coeso |
| T11 | 4 correções de 1 tipo | ⚠️ OK, coeso |
| T12 | 1 regra (texto/alt) | ✅ |
| T13 | 1 regra (axe) | ✅ |
| T14 | 1 recurso (OG) | ✅ |

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram | Status |
| ---- | ----------------- | ------- | ------ |
| T1 | None | início | ✅ |
| T2 | T1 | T1→T2 | ✅ |
| T3 | T2 | T2→T3 | ✅ |
| T4 | T3 | T3→T4 | ✅ |
| T5 | T4 | T4→T5 | ✅ |
| T6 | T5 | Phase1→T6 | ✅ |
| T7 | T6 | T6→T7 | ✅ |
| T8 | T7 | T7→T8 | ✅ |
| T9 | T8 | Phase2→T9 | ✅ |
| T10 | T9 | T9→T10 | ✅ |
| T11 | T10 | T10→T11 | ✅ |
| T12 | T11 | T11→T12 | ✅ |
| T13 | T12 | T12→T13 | ✅ |
| T14 | T13 | T13→T14 | ✅ |

## Test Co-location Validation

| Task | Layer | Matrix Requires | Task Says | Status |
| ---- | ----- | --------------- | --------- | ------ |
| T1 | harness + página | e2e | e2e | ✅ |
| T2–T5 | assets + página | e2e | e2e | ✅ |
| T6–T8 | módulos DOM | e2e | e2e | ✅ |
| T9–T14 | página | e2e | e2e | ✅ |
