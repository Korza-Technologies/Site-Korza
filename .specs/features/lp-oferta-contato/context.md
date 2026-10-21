# F2 · Oferta e contato · Context

**Gathered:** 2026-10-21
**Spec:** `.specs/features/lp-oferta-contato/spec.md`
**Status:** Ready for design

## Feature Boundary

Oferta clara no card de preço e nos CTAs, WhatsApp com contexto, FAQ com objeções, rodapé de contato, calculadora de payback, PostHog e comparativo site × app.

## Implementation Decisions

### Oferta
- Cadastro grátis = onboarding com prévia do app; o app só é feito e publicado com o plano (R$ 399/mês).
- Sem fidelidade e sem taxa de implantação.
- Prazo: média de 7 dias úteis, máximo de 14 dias úteis.
- Korza publica nas contas dela; migra para a conta do lojista sem custo, se ele quiser (ele só compra a conta de desenvolvedor).

### Contato
- WhatsApp Business +55 51 9455-3299 (`wa.me/555194553299`), testado pelo usuário.
- E-mail no rodapé: suporte@korza.com.br. Sem CNPJ, política ou termos nesta entrega.

### Medição
- PostHog. Nunca usar contas logadas na máquina: o usuário tem várias empresas. Só a chave do projeto da Korza, fornecida por ele.
- Leads vão direto para o cadastro (sem formulário no site).

### Calculadora
- Fórmula com margem: ⌈399 ÷ (ticket × margem)⌉, margem padrão 30%.

### Copy
- Tom direto e concreto.

### Agent's Discretion
- Textos exatos dos CTAs e mensagens de WhatsApp (registrados como assumptions na spec).

### Declined / Undiscussed Gray Areas → Assumptions
- Linhas do comparativo, valores padrão da calculadora e host do PostHog: ver Assumptions na spec.

## Specific References

- O onboarding do admin (6 passos com iPhone ao vivo) é a experiência que o site deve antecipar.

## Deferred Ideas

- Política de Privacidade, Termos e CNPJ.
- Big numbers gerais da plataforma.
- Teste A/B.
