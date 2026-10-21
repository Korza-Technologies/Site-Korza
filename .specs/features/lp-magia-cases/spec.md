# F3 · "Veja sua loja virar app" e cases com dados reais

## Problem Statement

Hoje o visitante assiste a uma demonstração com marcas de outras pessoas. A decisão de compra acontece quando ele vê a própria marca dentro do app, e isso hoje só acontece depois do cadastro, no onboarding. Além disso, os cases são rasos: o modal repete o card, o case da Hiven não tem número e os números não dizem a que período se referem.

## Goals

- [ ] O visitante vê o nome e a cor da própria loja dentro de um app no hero, em menos de 10 segundos, sem cadastro.
- [ ] Todo case mostra pelo menos uma métrica real, com período, coletada do banco de produção (somente leitura) e aprovada pelo usuário.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Ler a loja pela URL (logo, cores, produtos reais) | Exige backend; decisão do usuário: teaser leve + cadastro |
| Levar nome e cor para o cadastro/onboarding | Exige mudança no admin; fora desta entrega |
| Push real via QR code | Adiado pelo usuário |
| Depoimentos, fotos e vídeos de clientes | Sem material; usuário pediu só mencionar as lojas |
| Novos cases além de Loum, Hiven, Belletonn e Pé de Algodão | Usuário pediu só as lojas já citadas |
| Publicar valores absolutos em R$ de clientes | Dado sensível do cliente; só percentuais e razões (ver Assumptions) |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Onde fica o teaser | No hero: campo "Nome da sua loja" + 6 cores + "outra cor", abaixo do subtítulo; o celular do hero passa a mostrar o app desenhado com a marca do visitante | Escolha do usuário: "o celular do hero se recolore" | y |
| Estado inicial do celular | Mockup real da Hiven (foto) até a primeira interação | Um app real convence mais que um genérico | y |
| Envio de logo | Opcional, link "Enviar logo"; PNG, JPG, WebP ou SVG até 2MB; processado só no navegador | Logo aumenta o efeito; nunca sai do aparelho | y |
| Texto do CTA após interação | O CTA principal do hero muda para "Continuar montando meu app" (mesmo destino) | Liga o teaser ao onboarding real | y |
| Métricas publicáveis dos cases | Apenas percentuais e razões (ex.: % dos pedidos, % de conversão, crescimento %); contagens e R$ absolutos não | Proteger dados dos clientes | y |
| Aprovação dos números | A tarefa de coleta gera um relatório; o usuário aprova os números antes de entrarem no site | Dado de produção publicado precisa de dono | y |
| Período padrão das métricas | Últimos 90 dias até a data da coleta, salvo quando o case original usa outro período | Recente e estável | y |

**Open questions:** none.

---

## User Stories

### P1: Veja sua loja virar app ⭐ MVP

**User Story**: Como lojista no site, quero digitar o nome da minha loja e escolher minha cor para ver como meu app fica antes de me cadastrar.

**Acceptance Criteria** (PREVIEW):

1. WHEN o hero é exibido THEN SHALL existir um campo com `label` "Nome da sua loja" (`maxlength=24`) e um grupo de 6 cores predefinidas + um seletor "outra cor", todos operáveis por teclado.
2. WHEN o visitante digita no campo THEN em até 150ms o celular do hero SHALL mostrar o app desenhado com o texto digitado no cabeçalho e no push de exemplo.
3. WHEN o visitante escolhe uma cor THEN a cor de destaque do app desenhado (barra de abas ativa, botão e banner) SHALL ser exatamente a cor escolhida.
4. WHEN o campo está vazio ou só tem espaços THEN o app desenhado SHALL usar "Sua Loja".
5. WHEN o texto contém HTML (ex.: `<img onerror=…>`) THEN ele SHALL aparecer como texto literal, sem criar elementos.
6. WHEN o visitante envia um logo PNG/JPG/WebP/SVG ≤ 2MB THEN o logo SHALL aparecer no cabeçalho e no ícone do push; WHEN o arquivo é de outro tipo ou > 2MB THEN SHALL aparecer "Envie PNG, JPG, WebP ou SVG de até 2MB." e o logo anterior SHALL ser mantido.
7. WHEN o teaser é usado THEN nenhuma requisição de rede SHALL conter o nome, a cor ou o logo digitados.
8. WHEN o visitante interage pela primeira vez (digita, escolhe cor ou envia logo) THEN o CTA principal do hero SHALL mudar para "Continuar montando meu app", com o mesmo `href` de cadastro, e SHALL emitir `brand_preview_used` uma única vez, com `{has_name, has_logo}` e sem o nome.
9. WHEN a largura é ≤ 760px THEN o teaser e o celular SHALL caber na tela sem rolagem horizontal, com alvos de toque ≥ 44px.
10. WHEN um logo novo substitui o anterior THEN a URL de objeto anterior SHALL ser revogada.

**Independent Test**: digitar "Loja da Ana", escolher uma cor e conferir o celular do hero e o CTA.

---

### P1: Cases com dados reais ⭐ MVP

**User Story**: Como lojista, quero ver resultados reais e recentes de marcas parecidas com a minha.

**Acceptance Criteria** (CASES):

1. WHEN a seção de cases é exibida THEN SHALL conter exatamente os cases Loum, Hiven, Belletonn e Pé de Algodão.
2. WHEN cada card é exibido THEN SHALL mostrar pelo menos uma métrica percentual ou razão, com o período de medição visível (ex.: "jul–set 2026"), e o valor SHALL ser igual ao aprovado no relatório de dados (`data-report.md`).
3. WHEN "Conheça a história" é ativado THEN o diálogo SHALL mostrar pelo menos uma métrica que não está no card, o período e um link "Quero um resultado assim" para o WhatsApp com a mensagem do case (F2).
4. WHEN o visitante interage com a seção de cases (ponteiro, toque, foco, tecla ou rolagem do carrossel) THEN o avanço automático SHALL parar e não voltar até recarregar a página.
5. WHEN as animações estão pausadas (F1 A11Y-4) THEN o carrossel SHALL NOT avançar sozinho.

---

### P2: Coleta de dados dos cases

**User Story**: Como time da Korza, quero que os números dos cases venham do banco de produção, com período e data de coleta.

**Acceptance Criteria** (DATA):

1. WHEN a coleta roda THEN SHALL usar apenas o acesso somente leitura da skill `prod-debug`, sem nenhuma escrita.
2. WHEN a coleta termina THEN `.specs/features/lp-magia-cases/data-report.md` SHALL listar, para cada case, as métricas candidatas, o período e a data da coleta, sem consultas, credenciais ou IDs internos (AD-003).
3. WHEN o usuário ainda não aprovou o relatório THEN nenhum número novo SHALL entrar no site.

---

## Edge Cases

- WHEN o visitante cola um nome com mais de 24 caracteres THEN o campo SHALL truncar em 24.
- WHEN a cor escolhida tem pouco contraste com o texto branco THEN o texto sobre a cor SHALL trocar para escuro (contraste ≥ 4,5:1).
- WHEN JavaScript está desligado THEN o hero SHALL mostrar o mockup real e o formulário do teaser SHALL ficar oculto.
- WHEN um case não tiver métrica percentual disponível no banco THEN o case SHALL manter a métrica atual com seu período original, sinalizado no relatório.

## Implicit-Requirement Dimensions

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | PREVIEW-4/5/6, truncamento em 24 (Edge Cases) |
| Failure / partial-failure | Arquivo inválido mantém logo anterior (PREVIEW-6); sem JS (Edge Cases) |
| Idempotency / retry | `brand_preview_used` uma vez por carregamento (PREVIEW-8) |
| Auth & rate limits | Coleta só com o papel somente leitura (DATA-1); site sem backend |
| Concurrency / ordering | N/A because o estado do teaser é local a uma aba |
| Data lifecycle | Logo nunca sai do navegador e a URL de objeto é revogada (PREVIEW-7/10); relatório sem dados internos (DATA-2) |
| Observability | `brand_preview_used` (PREVIEW-8) |
| External-dependency failure | Banco de produção indisponível: a coleta para e os números atuais permanecem (DATA-3) |
| State-transition integrity | Celular: foto real → app desenhado (PREVIEW-2); carrossel: automático → manual, sem volta (CASES-4) |

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| PREVIEW-01..10 | P1: Teaser | Execute | Implemented, tests green (T2–T6); awaiting Verifier |
| CASES-01..05 | P1: Cases | Execute | Implemented, tests green (T7–T9); awaiting Verifier |
| DATA-01..03 | P2: Coleta | Execute | Verified |

**Coverage:** 18 total, all mapped to tasks.

## Success Criteria

- [ ] `npm test` verde em todos os ACs acima.
- [ ] Do primeiro toque ao celular mostrando a marca do visitante: menos de 10 segundos.
