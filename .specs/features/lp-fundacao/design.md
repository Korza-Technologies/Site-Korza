# F1 · Fundação · Design

**Spec**: `.specs/features/lp-fundacao/spec.md`
**Status**: Approved (abordagem confirmada pelo usuário em 2026-10-21: módulos ES nativos, AD-007)

---

## Architecture Overview

Site estático sem build (AD-002). O `app.js` atual vira módulos ES em `js/`, com um controlador de movimento central que todas as animações consultam. Imagens passam por um script de otimização versionado; os arquivos gerados são commitados. Testes Playwright servem o site com `python3 -m http.server`.

```mermaid
graph TD
  HTML[index.html] --> MAIN[js/main.js]
  MAIN --> CFG[js/config.js]
  MAIN --> MOTION[js/motion.js<br/>isPaused / onChange]
  MAIN --> MENU[js/menu.js]
  MAIN --> BRAND[js/brand-picker.js]
  MAIN --> DIALOG[js/dialog.js]
  MAIN --> STICKY[js/sticky-cta.js]
  MOTION --> PUSH[js/push-stack.js]
  MOTION --> CAR[js/cases-carousel.js]
  MOTION --> REV[js/revenue-demo.js]
  MOTION --> GOAL[js/goal-counter.js]
  MOTION --> CSS[body.animations-paused<br/>styles.css]
  OPT[scripts/optimize-assets.sh] --> ASSETS[assets/*.webp *.avif *.woff2]
  TESTS[tests/*.spec.js<br/>@playwright/test + axe] --> HTML
```

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component | Location | How to Use |
| --------- | -------- | ---------- |
| Pausa global via `body.animations-paused` | `app.js` `updateMotion()` + `styles.css` | Vira `js/motion.js`; a classe CSS continua sendo o mecanismo das animações CSS |
| `userPaused` (nunca ativado) | `app.js` | Passa a ser o estado do botão de pausa |
| `prefers-reduced-motion` já tratado | `app.js`, `styles.css` (8 blocos) | `motion.js` trata reduced motion como pausado |
| IntersectionObserver de visibilidade | `app.js` | Reusado em `sticky-cta.js` (hero, `.plan-price`, footer) |
| Dimensões `width/height` nas imagens | `index.html` | Mantidas no `<picture>` para evitar layout shift |
| Posições do sprite em `%` | `index.html` (`style="left:-440%;top:-110%"`) | Sprite reduzido mantendo proporção, as porcentagens continuam válidas |

### Integration Points

| System | Integration Method |
| ------ | ------------------ |
| AWS Amplify | Publica a raiz; nenhum arquivo novo precisa de build |
| Plataforma Korza | Links para `admin.korza.app` inalterados |

---

## Components

### Test harness
- **Purpose**: Gate automatizado de cada tarefa.
- **Location**: `package.json`, `playwright.config.js`, `tests/`
- **Interfaces**: `npm test` (tudo), `npm run test:unit` (`tests/unit/**`, sem navegador). `tests/helpers.js` expõe `gotoAt(page, w, h)`, `scrollToEnd(page)`, `resourceBytes(page, types)`, `smallText(page)`, `rectsIntersect(a, b)`.
- **Dependencies**: `@playwright/test`, `@axe-core/playwright` (devDependencies).

### scripts/optimize-assets.sh
- **Purpose**: Gera WebP/AVIF dos mockups (larguras 480 e 800), sprite WebP reduzido, logo Shopify pequeno, WOFF2 das fontes, `apple-touch-icon.png` e `og-image.jpg`.
- **Dependencies**: `cwebp`, `avifenc`, `magick`, `python3 -m fontTools` (com brotli). Idempotente.

### js/motion.js
- **Purpose**: Fonte única do estado "animações pausadas".
- **Interfaces**: `isPaused(): boolean`, `onChange(cb): void`, `initPauseButton(button)`. Pausado quando: botão ativo, `prefers-reduced-motion`, ou `document.hidden`. Atualiza `body.animations-paused` e `aria-pressed`/texto do botão.

### js/sticky-cta.js
- **Purpose**: Barra fixa inferior (≤760px) visível só quando hero, `.plan-price` e footer estão fora da tela; usa `hidden` + `inert` quando oculta.
- **Interfaces**: `initStickyCta(bar, watched[])`. F2 reutiliza para o botão flutuante de WhatsApp no desktop.

### Módulos migrados (sem mudança de comportamento)
`menu.js`, `brand-picker.js`, `dialog.js`, `push-stack.js`, `cases-carousel.js`, `revenue-demo.js`, `goal-counter.js`: cada um exporta `init*()` chamado por `main.js`; os que animam consultam `motion.isPaused()`.

### styles/components.css
- **Purpose**: CSS novo e legível (botão de pausa, barra fixa, hero mobile, ajustes de alvo de toque e tamanho de texto), carregado depois de `styles.css` para sobrescrever sem editar as linhas longas.

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
| -------------- | -------- | ----------- |
| Navegador sem módulos ES | Conteúdo é HTML estático; só interações somem | Página legível |
| Sem IntersectionObserver | Barra fixa não inicializa | Sem barra; CTAs do conteúdo continuam |
| AVIF não suportado | `<picture>` cai no WebP | Nenhum |

---

## Risks & Concerns

| Concern | Location | Impact | Mitigation |
| ------- | -------- | ------ | ---------- |
| CSS em linhas de até 6.479 caracteres, 12 blocos `max-width:760px` duplicados | `styles.css` | Editar no lugar é frágil | Sobrescrever em `styles/components.css`; tocar `styles.css` só em `@font-face` e remoções pontuais |
| Mockup do hero escondido mas baixado (1,4MB) | `index.html:42`, `styles.css` `.hero-scene{display:none}` | Peso no mobile | `<picture>` + `srcset` e cena visível no mobile (MOB-1) |
| Sem nenhum teste | repo | Regressão silenciosa | Harness na T1 cobre comportamento atual antes da migração (T6) |
| Seletor de marca usa caminhos `.png` fixos no JS | `app.js` `brands` | Quebra ao remover PNG | T3 atualiza `brands` para `srcset` WebP |

---

## Tech Decisions

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| Runner de unidade | O próprio `@playwright/test` em arquivos sem `page` | Um runner só |
| Ocultar barra fixa | `hidden` + `inert` | Fora da ordem de foco (MOB-4) |
| Alvo de toque dos pontos do carrossel | Pseudo-elemento `::before` de 44×44 em volta do ponto visual de 8px | Mantém o visual |
