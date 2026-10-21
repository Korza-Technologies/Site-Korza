# STATE

## Decisions

### AD-001
- **Decision**: Todo trabalho acontece em branches com um commit por tarefa e PR para revisão; nada é enviado direto para `main`.
- **Reason**: Cada push em `main` publica automaticamente em korza.com.br pelo AWS Amplify.
- **Trade-off**: O site em produção só muda depois do merge manual do PR.
- **Scope**: Todas as features do site.
- **Date**: 2026-10-21
- **Status**: active

### AD-002
- **Decision**: O site continua estático (HTML, CSS e JS sem build). Testes ficam em `tests/` com `@playwright/test` e `@axe-core/playwright`, servidos por `python3 -m http.server`; `npm test` é o gate de cada tarefa.
- **Reason**: O Amplify publica a raiz do repositório como está; uma etapa de build mudaria o deploy.
- **Trade-off**: `package.json` e `tests/` também ficam publicados (inofensivos); `node_modules/` fica no `.gitignore`.
- **Scope**: Todas as features do site.
- **Date**: 2026-10-21
- **Status**: active

### AD-003
- **Decision**: A pasta `.specs/` não guarda segredos, credenciais, IDs de infraestrutura nem detalhes internos do produto, só requisitos e decisões.
- **Reason**: O Amplify publica a raiz do repositório, então `.specs/` pode ficar acessível publicamente.
- **Trade-off**: Evidências de dados de produção ficam resumidas (métrica, período, data da coleta), sem consultas.
- **Scope**: Todas as features.
- **Date**: 2026-10-21
- **Status**: active

### AD-004
- **Decision**: O analytics é PostHog, com chave de projeto em uma única constante de configuração; com a chave vazia, nenhum script ou requisição de analytics é feito.
- **Reason**: O usuário tem várias empresas e contas PostHog logadas; só a chave do projeto da Korza, fornecida por ele, pode ser usada.
- **Trade-off**: O analytics fica desligado até a chave ser preenchida.
- **Scope**: Todas as features que emitem eventos.
- **Date**: 2026-10-21
- **Status**: active

### AD-005
- **Decision**: O contato humano é o WhatsApp Business +55 51 9455-3299 (`https://wa.me/555194553299`) e o e-mail suporte@korza.com.br.
- **Reason**: Confirmado pelo usuário em 2026-10-21 (o link de 8 dígitos abre a conversa correta).
- **Trade-off**: Nenhum.
- **Scope**: Todas as features com contato.
- **Date**: 2026-10-21
- **Status**: active

### AD-006
- **Decision**: Os textos são diretos e concretos. Fatos de oferta aprovados: o cadastro é grátis e dá acesso ao onboarding com prévia do app; o app só é construído e publicado com o plano de R$ 399/mês; não há fidelidade nem taxa de implantação; o app fica pronto em média em 7 dias úteis, com prazo máximo de 14 dias úteis; a Korza publica nas próprias contas da Apple e do Google, e a migração para a conta do lojista é gratuita (ele só paga a conta de desenvolvedor).
- **Reason**: Respostas do usuário em 2026-10-21.
- **Trade-off**: Nenhuma afirmação de oferta fora desta lista pode ser escrita sem nova confirmação.
- **Scope**: Toda a copy do site.
- **Date**: 2026-10-21
- **Status**: active

### AD-007
- **Decision**: O JavaScript é organizado em módulos ES nativos em `js/` (entrada `js/main.js`, `<script type="module">`), com configuração centralizada em `js/config.js`; o CSS novo fica em `styles/components.css`, carregado depois de `styles.css`; funções puras são testadas como unidade importando o módulo direto no Node.
- **Reason**: Mantém o site sem build (AD-002) e permite testar regras de negócio isoladas.
- **Trade-off**: Um arquivo CSS a mais e vários arquivos JS pequenos (HTTP/2 do CloudFront absorve).
- **Scope**: Todas as features do site.
- **Date**: 2026-10-21
- **Status**: active

## Handoff

- **Feature**: `lp-fundacao` → `lp-oferta-contato` → `lp-magia-cases`
- **Phase / Task**: Tasks prontas (F1: 14, F2: 14, F3: 9), aguardando aprovação e modo de execução
- **Completed**: Specify, Design, Tasks das três features
- **In-progress** (file:line): none
- **Next step**: Usuário aprova os tasks e escolhe inline ou sub-agentes; começar por F1 T1.
- **Blockers**: Chave PostHog da Korza (não bloqueia); aprovação dos números dos cases (bloqueia F3 T7)
- **Uncommitted files**: none
- **Branch**: feat/ux-conversao
