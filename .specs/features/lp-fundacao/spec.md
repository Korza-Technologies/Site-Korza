# F1 · Fundação: performance, mobile, acessibilidade e botões

## Problem Statement

A landing page tem visual premium, mas no celular esconde o produto, deixa o botão principal pequeno e baixa cerca de 8MB de imagens. Há textos de 4 a 8px com contraste baixo, quatro animações em loop sem controle de pausa, elementos com cara de botão que não fazem nada, e links compartilhados no WhatsApp chegam sem prévia. Isso derruba a conversão justamente no device onde está a maior parte do tráfego.

## Goals

- [ ] Peso de imagens e fontes no carregamento inicial (390×844, sem rolar) ≤ 1,5MB; com a página inteira rolada ≤ 3MB.
- [ ] Zero violações do axe-core (tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`) em 1440×900 e 390×844.
- [ ] Nenhum texto fora de ilustrações com menos de 12px, em qualquer tamanho testado.
- [ ] Mockup do app e CTA principal visíveis no primeiro scroll do celular.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Reescrita de copy, oferta, WhatsApp, FAQ, rodapé | Feature F2 `lp-oferta-contato` |
| Teaser interativo e cases com dados reais | Feature F3 `lp-magia-cases` |
| Etapa de build, bundler ou framework | AD-002 |
| Refatorar o CSS inteiro (blocos de media query duplicados) | Só tocar o necessário; refatoração ampla não muda resultado para o visitante |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| O que conta como "ilustração" isenta do mínimo de 12px | Conteúdo dentro de containers marcados `data-illustration` (telas de celular desenhadas: pilha de pushs, lock screen, mockups) | São réplicas de UI de celular em escala; o texto equivalente fica em `aria-label` | y |
| Formato das imagens | WebP via `<picture>` com AVIF como primeira fonte quando menor | Suporte universal do WebP; AVIF reduz mais onde suportado | y |
| Arquivos não usados em `assets/` | Removidos (continuam no histórico do git) | Não são referenciados por nenhum arquivo | y |
| Selo "Mobile commerce" acima do título | Vira prova social "60+ marcas · Nuvemshop e Shopify" com link para `#cases` | O próprio site já afirma "Mais de 60 e-commerces" | y |
| Chips dos cases | Viram texto simples listando apenas as categorias existentes nos cases (Recompra · Aplicativo · Conversão · Faturamento) | Não existe case de ticket médio | y |
| Selos App Store / Google Play | Viram legenda não interativa "Publicado na App Store e no Google Play" com os ícones das lojas, sem fundo escuro de botão | Hoje parecem botões de download | y |
| Controle de pausa | Um botão "Pausar animações" fixo no canto inferior esquerdo da tela; o estado vale até recarregar a página | WCAG 2.2.2; o código já tem `userPaused` | y |
| CTA fixo no mobile | Barra inferior em ≤760px com o CTA principal; F2 acrescenta o WhatsApp nela | Botão visível durante a rolagem longa | y |
| Imagem Open Graph | Gerada a partir do próprio site: celular com app de cliente + título, 1200×630 JPG | Sem material de marketing pronto | y |

**Open questions:** none.

---

## User Stories

### P1: Página leve no celular ⭐ MVP

**User Story**: Como lojista acessando pelo celular em 4G, quero que a página carregue rápido para ver o produto sem esperar.

**Acceptance Criteria** (PERF):

1. WHEN a página carrega em 390×844 sem rolagem THEN a soma dos bytes transferidos de imagens e fontes SHALL ser ≤ 1.500.000 bytes.
2. WHEN a página é rolada até o fim em 390×844 THEN a soma dos bytes de imagens e fontes SHALL ser ≤ 3.000.000 bytes.
3. WHEN qualquer mockup de app (`hiven`, `loum`, `belletonn`, `pe-de-algodao`) é servido THEN o arquivo SHALL ter ≤ 200.000 bytes.
4. WHEN o logo da Shopify é servido THEN o arquivo SHALL ter ≤ 20.000 bytes.
5. WHEN o sprite de logos de clientes é servido THEN o arquivo SHALL ter ≤ 250.000 bytes.
6. WHEN qualquer fonte é carregada THEN ela SHALL estar em formato WOFF2.
7. WHEN o HTML referencia um arquivo em `assets/` THEN esse arquivo SHALL existir, e todo arquivo em `assets/` (exceto licença) SHALL ser referenciado por HTML, CSS ou JS.

**Independent Test**: medir recursos com Playwright em 390×844 antes e depois da rolagem.

---

### P1: Hero que vende no celular ⭐ MVP

**User Story**: Como lojista no celular, quero ver o app e o botão principal logo de cara.

**Acceptance Criteria** (MOB):

1. WHEN a página abre em 390×844 ou 360×740 THEN o mockup do app no hero SHALL estar visível com altura ≥ 200px e topo ≤ 900px a partir do início da página.
2. WHEN a largura é ≤ 760px THEN o CTA principal do hero SHALL ter fonte ≥ 16px, altura ≥ 48px e largura igual à largura da coluna de conteúdo (±2px).
3. WHEN a largura é ≤ 760px THEN o retângulo visível da fita decorativa SHALL NOT interceptar o retângulo do `h1` do hero.
4. WHEN a largura é ≤ 760px e o hero saiu totalmente da tela THEN uma barra fixa inferior com o CTA principal SHALL ficar visível; WHEN o hero, o card de preço (`.plan-price`) ou o rodapé estão visíveis THEN a barra SHALL ficar oculta (e fora da ordem de foco).
5. WHEN a largura é > 760px THEN a barra fixa inferior SHALL NOT aparecer.
6. WHEN a tela é 844×390 (celular deitado) THEN o header SHALL ter altura ≤ 64px e o CTA principal do hero SHALL estar inteiro dentro da primeira tela.
7. WHEN a página é renderizada em 1440, 1280, 820, 390 e 360 de largura THEN `scrollWidth` do documento SHALL ser igual a `clientWidth`.

**Independent Test**: screenshots e medições Playwright nos cinco tamanhos.

---

### P1: Leitura e acessibilidade ⭐ MVP

**User Story**: Como qualquer visitante, incluindo quem usa leitor de tela ou é sensível a movimento, quero ler tudo e controlar as animações.

**Acceptance Criteria** (A11Y, TXT):

1. WHEN o axe-core roda com as tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` em 1440×900 e 390×844 (após rolar a página inteira) THEN SHALL haver zero violações.
2. WHEN a página é renderizada em 1440×900 ou 390×844 THEN todo elemento visível com texto próprio fora de `[data-illustration]` SHALL ter `font-size` ≥ 12px.
3. WHEN existe animação em loop THEN um botão visível "Pausar animações" SHALL existir com `aria-pressed="false"`.
4. WHEN o botão de pausa é ativado THEN `aria-pressed` SHALL virar `true`, o texto SHALL virar "Retomar animações", a faixa de logos SHALL ter `animation-play-state: paused`, nenhum push novo SHALL entrar na pilha em 5s, o carrossel de cases SHALL NOT avançar em 8s e o contador de faturamento SHALL NOT mudar em 5s.
5. WHEN o botão é ativado de novo THEN as animações SHALL voltar.
6. WHEN `prefers-reduced-motion: reduce` está ativo THEN o comportamento SHALL ser o mesmo do estado pausado.
7. WHEN o leitor de tela percorre a faixa de logos THEN nenhuma imagem SHALL repetir um `alt` não vazio, e logos sem nome conhecido SHALL ter `alt=""`.
8. WHEN conteúdo fica dentro de `[data-illustration]` THEN o container SHALL ter `role="img"` com `aria-label` descritivo ou `aria-hidden="true"`.

---

### P1: Botões que fazem o que parecem ⭐ MVP

**User Story**: Como visitante, quero que tudo que parece clicável funcione e que nada importante seja difícil de tocar.

**Acceptance Criteria** (BTN):

1. WHEN o card "Aplicativo" é exibido THEN `.store-marks` SHALL conter o texto "Publicado na App Store e no Google Play", não SHALL conter `a` nem `button`, e cada marca SHALL ter fundo transparente.
2. WHEN a seção de cases é exibida THEN a lista de categorias SHALL ter borda 0, fundo transparente e cursor `auto`, e SHALL listar exatamente as categorias dos cards (`.case-category`) sem "Ticket médio".
3. WHEN o seletor de marca é exibido THEN um rótulo visível "Veja o app de:" SHALL estar associado ao grupo (`aria-labelledby`), e cada botão SHALL ter altura ≥ 44px e fonte ≥ 14px.
4. WHEN os controles do carrossel são exibidos THEN cada ponto e cada seta SHALL ter área clicável ≥ 44×44px.
5. WHEN o card de preço é exibido THEN `.plan-price` SHALL NOT conter link para `/login`.
6. WHEN o hero é exibido THEN o selo acima do título SHALL ter `href="#cases"` e o texto SHALL conter "60+".
7. WHEN a seção de objetivos é exibida THEN o texto-pergunta SHALL vir antes do botão na ordem do DOM e na posição visual (topo menor).

---

### P2: Prévia ao compartilhar

**User Story**: Como lojista que recebe o link no WhatsApp, quero ver imagem e título para confiar e clicar.

**Acceptance Criteria** (META):

1. WHEN o HTML é analisado THEN SHALL existir `og:title`, `og:description`, `og:type=website`, `og:locale=pt_BR`, `og:url=https://korza.com.br/`, `og:image` com URL absoluta `https://korza.com.br/assets/og-image.jpg`, `og:image:width=1200`, `og:image:height=630`, `twitter:card=summary_large_image`.
2. WHEN `assets/og-image.jpg` é lido THEN SHALL ter 1200×630 px e ≤ 300.000 bytes.
3. WHEN o HTML é analisado THEN SHALL existir `link rel="apple-touch-icon"` apontando para um PNG 180×180 existente.

---

## Edge Cases

- WHEN JavaScript está desligado THEN todo conteúdo SHALL continuar visível e a barra fixa SHALL NOT aparecer.
- WHEN o navegador não suporta AVIF THEN a imagem WebP SHALL ser usada.
- WHEN a pausa está ativa e o usuário troca de aba e volta THEN as animações SHALL continuar pausadas.

## Implicit-Requirement Dimensions

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | N/A because F1 não tem entrada de usuário |
| Failure / partial-failure | Imagem que falha: `width/height` mantêm o layout (já existe); sem JS: conteúdo visível (Edge Cases) |
| Idempotency / retry | N/A because não há operações com efeito colateral |
| Auth & rate limits | N/A because site estático público |
| Concurrency / ordering | N/A because não há estado compartilhado |
| Data lifecycle | N/A because nada é armazenado |
| Observability | N/A in F1; eventos de analytics são da F2 |
| External-dependency failure | N/A because F1 não adiciona dependência externa em runtime |
| State-transition integrity | Pausa ↔ retomada (A11Y-4/5) e barra fixa visível ↔ oculta (MOB-4) |

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| PERF-01..07 | P1: Página leve | Tasks | In Tasks |
| MOB-01..07 | P1: Hero mobile | Tasks | In Tasks |
| A11Y-01..08 | P1: Acessibilidade (inclui TXT) | Tasks | In Tasks |
| BTN-01..07 | P1: Botões | Tasks | In Tasks |
| META-01..03 | P2: Prévia | Tasks | In Tasks |

**Coverage:** 32 total, all mapped to tasks.

## Success Criteria

- [ ] `npm test` verde em todos os ACs acima.
- [ ] Página inicial no celular ≤ 1,5MB (antes: ~8MB).
