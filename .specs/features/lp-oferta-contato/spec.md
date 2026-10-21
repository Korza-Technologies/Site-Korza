# F2 · Oferta clara, contato humano e medição

## Problem Statement

O visitante vê "Criar conta grátis" em oito lugares e um único preço de R$ 399/mês, sem entender o que é grátis. Não existe nenhum caminho para falar com uma pessoa, o FAQ evita as perguntas que decidem a compra, e o site não mede nada. O lojista adia a decisão e a Korza não sabe onde ele parou.

## Goals

- [ ] A oferta (o que é grátis, quanto custa, prazo, fidelidade) pode ser entendida só pelo card de preço.
- [ ] Todo ponto de decisão (hero, preço, cases, fechamento, celular) tem WhatsApp com mensagem de contexto.
- [ ] Cada clique em CTA, uso da calculadora e abertura de FAQ vira evento no PostHog quando a chave estiver configurada.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Política de Privacidade, Termos, CNPJ | Decisão do usuário: rodapé só com contato |
| Preencher dados no cadastro/onboarding do admin | Exige mudança no admin (outro repositório); decisão do usuário |
| Formulário de leads, RD Station, HubSpot | Leads vão direto para o cadastro |
| Banner de consentimento de cookies | Sem política de privacidade nesta entrega; PostHog fica desligado até a chave existir (AD-004). Reavaliar junto com a página legal |
| Números gerais da plataforma (prova social viva) | Usuário não quer big numbers gerais |
| Teste A/B | Depende do PostHog ativo; fica para depois |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Texto único do CTA de cadastro | "Montar meu app grátis" | Diz exatamente o que é grátis (montar e ver o app), coerente com AD-006 | y |
| Texto do CTA de WhatsApp | "Falar com especialista" | Padrão do mercado B2B | y |
| Mensagens pré-preenchidas do WhatsApp | hero: "Oi! Vim pelo site da Korza e quero entender como ter o app da minha loja." · preço: "Oi! Quero entender o plano de R$ 399 da Korza." · fechamento: "Oi! Quero colocar minha loja em um app com a Korza." · barra mobile/botão flutuante: "Oi! Vim pelo site da Korza e tenho uma dúvida." · case X: "Oi! Vi o case da X no site e quero um resultado parecido." | Vendedor recebe o contexto da conversa | y |
| Botão flutuante no desktop | Botão redondo de WhatsApp no canto inferior direito, visível depois que o hero sai da tela | Mesmo comportamento da barra mobile | y |
| Valores padrão da calculadora | Ticket médio R$ 180, margem 30% | Valores plausíveis para moda e beleza, os nichos dos cases | y |
| Host do PostHog | `api_host: https://burrito.korza.com.br` (proxy da Korza) e `ui_host: https://us.posthog.com`, ambos em constantes ao lado da chave | Proxy existe no DNS da Korza; a região deve ser confirmada quando a chave for informada | y |
| Linhas do comparativo site × app | 4 linhas: ícone na tela inicial; push na tela bloqueada sem pagar por clique; presença na App Store e no Google Play com a marca; painel com vendas e recompras do app | Só afirmações verificáveis pelo produto atual | y |
| Horário de atendimento | Não exibido | Não confirmado pelo usuário | y |

**Open questions:** none.

---

## User Stories

### P1: Oferta que se entende sozinha ⭐ MVP

**User Story**: Como lojista avaliando a Korza, quero entender o que é grátis, quanto custa e quando fica pronto, sem precisar perguntar.

**Acceptance Criteria** (OFFER):

1. WHEN a página é renderizada THEN todo link para `https://admin.korza.app/create-account` (exceto o CTA do teaser da F3) SHALL ter o mesmo texto visível "Montar meu app grátis".
2. WHEN o card de preço é exibido THEN ele SHALL conter: "R$ 399" e "/mês"; "Monte e veja seu app grátis"; "Você só assina para publicar"; "Sem fidelidade"; "Sem taxa de implantação"; "7 dias úteis"; "14 dias úteis".
3. WHEN o card de preço é exibido THEN SHALL conter um link de WhatsApp "Falar com especialista" com a mensagem de contexto de preço.
4. WHEN o texto visível da página é extraído THEN as palavras "próximo" ou "próxima" SHALL aparecer no máximo 3 vezes.
5. WHEN a seção de analytics é exibida THEN o título SHALL NOT conter "tempo real", e um selo visível "Exemplo do painel" (≥ 12px) SHALL ficar acima dos cards de métricas.
6. WHEN o texto "pushs" é procurado no HTML visível THEN SHALL haver zero ocorrências.

---

### P1: Falar com uma pessoa ⭐ MVP

**User Story**: Como lojista com dúvida, quero falar com alguém da Korza pelo WhatsApp no momento em que a dúvida aparece.

**Acceptance Criteria** (CONTACT):

1. WHEN a página é renderizada THEN SHALL existir links "Falar com especialista" no hero, no card de preço e na seção de fechamento.
2. WHEN qualquer link de WhatsApp é analisado THEN o `href` SHALL começar com `https://wa.me/555194553299?text=`, SHALL ter `target="_blank"` e `rel` contendo `noopener`, e o `text` decodificado SHALL ser exatamente a mensagem definida para aquela localização.
3. WHEN a largura é ≤ 760px THEN a barra fixa inferior (F1 MOB-4) SHALL conter o CTA principal e um botão de WhatsApp com rótulo acessível "Falar com especialista no WhatsApp".
4. WHEN a largura é > 760px e o hero saiu da tela THEN um botão flutuante de WhatsApp SHALL ficar visível no canto inferior direito; WHEN o hero está visível THEN SHALL ficar oculto.
5. WHEN o rodapé é exibido THEN SHALL mostrar "(51) 9455-3299" com link de WhatsApp e "suporte@korza.com.br" com `mailto:`.
6. WHEN o rodapé é exibido THEN SHALL NOT existir o texto "Criar app grátis" nem rótulos de CTA diferentes de OFFER-1.

---

### P1: FAQ que responde objeções ⭐ MVP

**User Story**: Como lojista, quero respostas objetivas às dúvidas que me impedem de assinar.

**Acceptance Criteria** (FAQ):

1. WHEN o FAQ é exibido THEN SHALL conter exatamente estas 8 perguntas, nesta ordem: "O que é grátis e o que é pago?"; "Tem fidelidade ou taxa de implantação?"; "Quanto tempo leva para o app ficar pronto?"; "Preciso ter conta de desenvolvedor na Apple e no Google?"; "Com quais plataformas a Korza se conecta?"; "O app terá a identidade da minha marca?"; "Como funcionam as notificações push?"; "Consigo acompanhar os resultados?".
2. WHEN cada resposta é aberta THEN o conteúdo SHALL conter os fatos de AD-006 correspondentes: grátis → "onboarding" e "R$ 399"; fidelidade → "Sem fidelidade" e "sem taxa"; prazo → "7 dias úteis" e "14 dias úteis"; contas → "contas da Korza" e "sem custo".
3. WHEN o FAQ é exibido THEN SHALL terminar com um link de WhatsApp "Falar com especialista" (mensagem padrão).

---

### P2: Calculadora "o app se paga com…"

**User Story**: Como lojista que acha R$ 399 caro, quero ver quantos pedidos pagam o plano.

**Acceptance Criteria** (CALC):

1. WHEN a seção de preço é exibida THEN SHALL existir os campos "Ticket médio (R$)" (padrão 180) e "Margem (%)" (padrão 30), com `label` associado.
2. WHEN os valores são válidos THEN o resultado SHALL mostrar N = ⌈399 ÷ (ticket × margem ÷ 100)⌉ na frase "O plano se paga com N pedidos por mês pelo app." (com 180 e 30 → 8).
3. WHEN N = 1 THEN a frase SHALL usar "1 pedido".
4. WHEN qualquer campo muda THEN o resultado SHALL atualizar sem recarregar e sem clicar em botão, e a região do resultado SHALL ter `aria-live="polite"`.
5. WHEN o ticket está vazio, não é número, é ≤ 0 ou > 100000 THEN SHALL aparecer "Informe um ticket médio entre R$ 1 e R$ 100.000." e nenhum N.
6. WHEN a margem está vazia, não é número, é ≤ 0 ou > 100 THEN SHALL aparecer "Informe uma margem entre 1% e 100%." e nenhum N.
7. WHEN o ticket usa vírgula decimal ("179,90") THEN SHALL ser interpretado como 179.90.

---

### P2: Medição com PostHog

**User Story**: Como time da Korza, quero saber de onde vêm os visitantes e onde eles clicam.

**Acceptance Criteria** (ANALYTICS):

1. WHEN a constante da chave PostHog está vazia THEN nenhuma requisição SHALL ser feita para `posthog`, `i.posthog.com` ou `burrito.korza.com.br`, e nenhum erro SHALL aparecer no console.
2. WHEN a chave está preenchida THEN o script SHALL carregar com `api_host` da constante, e cliques em CTA SHALL emitir `cta_click` com `{location, destination: "signup" | "whatsapp"}`.
3. WHEN a calculadora produz um N válido pela primeira vez após interação THEN SHALL emitir `calculator_used` uma única vez por carregamento.
4. WHEN uma pergunta do FAQ é aberta THEN SHALL emitir `faq_open` com `{question}`.
5. WHEN a URL da página contém parâmetros `utm_*` THEN todo link para `admin.korza.app/create-account` SHALL receber os mesmos parâmetros `utm_*`, sem duplicar.
6. WHEN o script do PostHog falha ao carregar (bloqueador) THEN os CTAs SHALL continuar navegando normalmente e nenhum erro não tratado SHALL aparecer no console.

---

### P3: Comparativo site × app

**User Story**: Como lojista, quero explicar para meu sócio por que um app vale além do site.

**Acceptance Criteria** (COMP):

1. WHEN a seção é exibida THEN SHALL existir uma tabela semântica (`table` com `th`) com colunas "Site mobile" e "App Korza" e exatamente as 4 linhas definidas em Assumptions.
2. WHEN a largura é ≤ 760px THEN a tabela SHALL caber na largura sem rolagem horizontal do documento.

---

## Edge Cases

- WHEN o visitante está em um desktop sem WhatsApp instalado THEN `wa.me` SHALL abrir o WhatsApp Web (comportamento nativo do link; nenhum tratamento extra).
- WHEN a URL tem `utm_source` repetido THEN só a primeira ocorrência SHALL ser repassada.
- WHEN JavaScript está desligado THEN todos os links (cadastro e WhatsApp) SHALL funcionar e a calculadora SHALL mostrar o resultado padrão (8 pedidos) já escrito no HTML.

## Implicit-Requirement Dimensions

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | CALC-5/6/7 |
| Failure / partial-failure | ANALYTICS-6; sem JS (Edge Cases) |
| Idempotency / retry | `calculator_used` uma vez por carregamento (ANALYTICS-3); UTM sem duplicar (ANALYTICS-5) |
| Auth & rate limits | N/A because site estático, sem backend |
| Concurrency / ordering | N/A because não há estado compartilhado |
| Data lifecycle | N/A because nada é armazenado pelo site; dados do PostHog seguem a conta da Korza |
| Observability | ANALYTICS-1..4 |
| External-dependency failure | ANALYTICS-6; WhatsApp sem app instalado (Edge Cases) |
| State-transition integrity | Botão flutuante visível ↔ oculto (CONTACT-4) |

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| OFFER-01..06 | P1: Oferta | Execute | Implemented, tests green (T2–T4); awaiting Verifier |
| CONTACT-01..06 | P1: Contato | Execute | Implemented, tests green (T1–T3, T5–T7); awaiting Verifier |
| FAQ-01..03 | P1: FAQ | Execute | Implemented, tests green (T8); awaiting Verifier |
| CALC-01..07 | P2: Calculadora | Execute | Implemented, tests green (T9–T10); awaiting Verifier |
| ANALYTICS-01..06 | P2: Medição | Execute | In progress: ANALYTICS-01..04, 06 (T11–T12) tests green |
| COMP-01..02 | P3: Comparativo | Tasks | In Tasks |

**Coverage:** 30 total, all mapped to tasks.

## Success Criteria

- [ ] `npm test` verde em todos os ACs acima.
- [ ] Um lojista consegue responder "o que é grátis, quanto custa, quanto tempo leva" lendo só o card de preço.
