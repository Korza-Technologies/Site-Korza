# F3 · Mágica e cases · Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/lp-magia-cases/design.md`
**Status**: Approved · **Requires**: F1 e F2 concluídas

---

## Test Coverage Matrix

> Same matrix as F1. Guidelines found: none — strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Funções puras (`preview.js`) | unit | Todos os ramos; 1:1 com ACs; todo edge case | `tests/unit/*.spec.js` | `npm run test:unit` |
| Página e módulos DOM | e2e | Todo AC: feliz + edge + falha | `tests/e2e/*.spec.js` | `npm run test:e2e` |
| Relatório de dados | none | — (revisão humana obrigatória) | — | — |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Só unit | `npm run test:unit` |
| Full | Com e2e | `npm test` |
| Build | Fim de fase | `npm test` |

---

## Execution Plan

### Phase 1: Dados dos cases
```
T1 ⏸ (aprovação do usuário)
```
### Phase 2: Teaser no hero
```
T2 → T3 → T4 → T5 → T6
```
### Phase 3: Cases
```
T7 → T8 → T9
```

---

## Task Breakdown

### T1: Coletar métricas dos cases (somente leitura)
**What**: Usar a skill `prod-debug` (monorepo) com o papel somente leitura para levantar métricas percentuais de Loum, Hiven, Belletonn e Pé de Algodão (incluindo reproduzir as atuais); escrever `data-report.md`; parar para aprovação.
**Where**: `.specs/features/lp-magia-cases/data-report.md`
**Depends on**: None · **Requirement**: DATA-01, DATA-02, DATA-03
**Tools**: Skill `prod-debug` (AWS SSO perfil `korza`, `~/.korza-debug.env`)
**Done when**:
- [ ] Nenhuma SQL de escrita executada; só `SELECT`
- [ ] Relatório com métrica, período e data da coleta por case, sem consultas/IDs/credenciais
- [ ] Usuário aprovou os números (registrado no relatório)
**Tests**: none · **Gate**: — (gate humano)
**Commit**: `docs(cases): relatório de métricas dos cases`
**Status**: ✅ Done (aprovado pelo usuário em 2026-10-21)

### T2: Regras puras do teaser
**What**: `normalizeStoreName`, `readableTextColor`, `validateLogo`.
**Where**: `js/preview.js`, `tests/unit/preview.spec.js`
**Depends on**: T1 · **Requirement**: PREVIEW-04, PREVIEW-05 (texto literal garantido no T4), PREVIEW-06 (validação)
**Done when**:
- [x] Unit: vazio/espaços → "Sua Loja"; corta em 24; colapsa espaços; contraste ≥ 4,5 para as 6 cores e para #FFFF00/#000000; tipos aceitos/recusados; 2MB exato aceito, 2MB+1 recusado
- [x] `npm run test:unit` verde
**Tests**: unit · **Gate**: quick
**Commit**: `feat(teaser): regras de nome, contraste e logo`
**Status**: ✅ Done (a1a5f11; 2MB = 2 × 1024 × 1024 bytes; `readableTextColor` cai para `#000000` quando nem branco nem `#0f1a33` chegam a 4,5:1, ex.: `#808080`, para cumprir o edge case de contraste com qualquer "outra cor")

### T3: App desenhado no hero
**What**: Marcação `.app-render` (cabeçalho, banner, grade, abas, push) dentro de `.hero-device`, oculta por padrão, estilizada por `--brand`/`--on-brand`.
**Where**: `index.html`, `styles/components.css`
**Depends on**: T2 · **Requirement**: PREVIEW-03 (estrutura)
**Done when**:
- [x] e2e: com `is-custom` forçado, a aba ativa, o botão e o banner usam exatamente `--brand`; sem `is-custom`, a foto real aparece e `.app-render` não
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(teaser): desenha o app de exemplo no hero`
**Status**: ✅ Done (3551084; testes em `tests/e2e/teaser.spec.js`; o logo será desenhado como `background-image` de um `span`, não como `<img>`, porque os testes VIS/MOB da F1 localizam `.hero-device img` como um único elemento; o push fica na parte de baixo da tela para não cobrir o nome no cabeçalho; `components.css` vai para `?v=20261021i`)

### T4: Formulário do teaser
**What**: Campo "Nome da sua loja", 6 cores + "outra cor", ligação ao app desenhado, região `aria-live`.
**Where**: `index.html`, `js/preview-ui.js`, `js/main.js`, `styles/components.css`
**Depends on**: T3 · **Requirement**: PREVIEW-01, PREVIEW-02, PREVIEW-03, PREVIEW-04, PREVIEW-05, PREVIEW-09
**Done when**:
- [x] e2e: teclado opera tudo; digitar "Loja da Ana" atualiza cabeçalho e push em ≤ 150ms; cor exata aplicada; vazio → "Sua Loja"; `<img onerror=alert(1)>` aparece literal e não cria `img`; 390 e 360 sem rolagem horizontal e alvos ≥ 44px; sem JS o formulário fica oculto
- [x] Testes MOB da F1 continuam verdes
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(teaser): visitante vê o nome e a cor da loja no app`
**Status**: ✅ Done (5ecfec4; o formulário fica logo abaixo dos CTAs do hero, para o CTA continuar inteiro na primeira tela em 844×390 (MOB-06); acima de 1100px nome e cores ficam lado a lado e o `padding-bottom` do hero cai para 40px, para a faixa de logos continuar visível na primeira tela em 1440×900 (A11Y-05 da F1); a atualização é síncrona a cada `input`, sem `requestAnimationFrame`, para garantir os 150ms sob carga; o `aria-label` do `.hero-scene` passa a "Prévia do app da NOME")

### T5: Envio de logo
**What**: Link "Enviar logo", validação, exibição no cabeçalho e no ícone do push, revogação da URL anterior.
**Where**: `index.html`, `js/preview-ui.js`
**Depends on**: T4 · **Requirement**: PREVIEW-06, PREVIEW-10
**Done when**:
- [x] e2e: PNG válido aparece nos 2 lugares; GIF e PNG de 2MB+1 mostram a mensagem e mantêm o logo anterior; segundo logo revoga a URL do primeiro (espião em `URL.revokeObjectURL`)
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(teaser): permite enviar o logo da loja`
**Status**: ✅ Done (6542c66; "Enviar logo" é um `button` que abre o `input type=file` oculto, na linha do título do teaser; o logo vai como `background-image` do `.app-logo` no cabeçalho e no ícone do push; estilos do botão e da mensagem em `styles/components.css`, que vai para `?v=20261021k`)

### T6: CTA, evento e privacidade do teaser
**What**: Na primeira interação, o CTA do hero vira "Continuar montando meu app" e `brand_preview_used` é emitido uma vez, sem o nome.
**Where**: `js/preview-ui.js`
**Depends on**: T5 · **Requirement**: PREVIEW-07, PREVIEW-08
**Done when**:
- [x] e2e: texto e `href` do CTA após interação; 1 evento com `{has_name, has_logo}` após várias interações; nenhuma requisição contém o nome digitado, a cor ou o logo
- [x] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(teaser): leva o visitante do teaser ao cadastro`
**Status**: ✅ Done (`has_name` e `has_logo` refletem o momento da primeira interação: nome não vazio e logo válido já aplicado; um logo inválido não conta como interação; só o texto do CTA muda, o ícone e o `href` com UTM ficam)

### T7: Cases com métricas aprovadas
**What**: `js/cases-data.js` com os dados aprovados; cards com métrica e período (Hiven ganha métrica).
**Where**: `js/cases-data.js`, `index.html`
**Depends on**: T6 · **Requirement**: CASES-01, CASES-02
**Done when**:
- [ ] e2e CASES-01; CASES-02 comparando cada card com `cases-data.js`, que espelha `data-report.md`
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(cases): atualiza cases com métricas reais e período`

### T8: Diálogo do case mais rico
**What**: Diálogo mostra métrica extra, período e "Quero um resultado assim" (WhatsApp do case).
**Where**: `js/dialog.js`, `index.html`
**Depends on**: T7 · **Requirement**: CASES-03
**Done when**:
- [ ] e2e CASES-03 para os 4 cases (href = `waLink('case', nome)`)
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `feat(cases): diálogo com métricas extras e WhatsApp`

### T9: Carrossel para na primeira interação
**What**: Autoplay para de vez após ponteiro, toque, foco, tecla ou rolagem na seção; respeita a pausa global.
**Where**: `js/cases-carousel.js`
**Depends on**: T8 · **Requirement**: CASES-04, CASES-05
**Done when**:
- [ ] e2e: sem interação avança em ~6,5s; após foco/clique/rolagem não avança em 8s; com pausa global não avança
- [ ] `npm test` verde
**Tests**: e2e · **Gate**: full
**Commit**: `fix(cases): carrossel para quando o visitante interage`

---

## Phase Execution Map
```
Phase 1:  T1 ⏸
Phase 2:  T2 ──→ T3 ──→ T4 ──→ T5 ──→ T6
Phase 3:  T7 ──→ T8 ──→ T9
```

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | 1 relatório | ✅ |
| T2 | 3 funções do mesmo domínio | ⚠️ OK, coeso |
| T3 | 1 componente | ✅ |
| T4 | 1 componente | ✅ |
| T5 | 1 comportamento | ✅ |
| T6 | 1 comportamento | ✅ |
| T7 | dados + cards | ✅ |
| T8 | 1 componente | ✅ |
| T9 | 1 comportamento | ✅ |

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram | Status |
| ---- | ----------------- | ------- | ------ |
| T1 | None | início | ✅ |
| T2 | T1 | Phase1→T2 | ✅ |
| T3..T6 | anterior | cadeia Phase 2 | ✅ |
| T7 | T6 | Phase2→T7 | ✅ |
| T8, T9 | anterior | cadeia Phase 3 | ✅ |

## Test Co-location Validation

| Task | Layer | Matrix Requires | Task Says | Status |
| ---- | ----- | --------------- | --------- | ------ |
| T1 | relatório | none | none | ✅ |
| T2 | funções puras | unit | unit | ✅ |
| T3–T9 | página / DOM | e2e | e2e | ✅ |
