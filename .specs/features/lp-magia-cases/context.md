# F3 · Mágica e cases · Context

**Gathered:** 2026-10-21
**Spec:** `.specs/features/lp-magia-cases/spec.md`
**Status:** Ready for design

## Feature Boundary

Teaser "veja sua loja virar app" no hero e cases das quatro lojas já citadas, com métricas reais coletadas do banco de produção.

## Implementation Decisions

### Teaser
- Versão leve, só no site: nome + cor (+ logo opcional), o celular do hero se recolore. O CTA leva ao cadastro; o onboarding do admin continua a experiência.
- Inspiração: o onboarding do admin (mockup de iPhone com tela inicial, app aberto, tela bloqueada e banner de notificação).

### Cases
- Só Loum, Hiven, Belletonn e Pé de Algodão.
- Métricas coletadas com a skill `prod-debug` (somente leitura) e aprovadas pelo usuário antes de publicar.

### Agent's Discretion
- Layout do app desenhado e paleta das 6 cores.

### Declined / Undiscussed Gray Areas → Assumptions
- Estado inicial do celular, envio de logo, publicar só percentuais: ver Assumptions na spec.

## Specific References

- `admin/src/pages/onboarding/mockup/*` no monorepo (referência visual, sem copiar código entre repositórios).

## Deferred Ideas

- Push real via QR code.
- Ler a loja pela URL (backend).
- Levar nome e cor para o onboarding do admin.
- Depoimentos em vídeo.
