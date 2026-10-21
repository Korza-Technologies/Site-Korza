# F1 lp-fundacao: validação

**Data**: 2026-10-21
**Spec**: `.specs/features/lp-fundacao/spec.md`
**Intervalo do diff**: `4dd8709..f903985` (commits de código: 8a68067 … 43b8150; commits só de docs da lp-magia-cases ignorados)
**Verificador**: sub-agente independente (autor ≠ verificador), worktree descartável em `f903985` com porta 4175
**Veredito**: ❌ FAIL. Todos os ACs têm evidência e o gate está verde, mas 1 mutante não equivalente sobreviveu num caminho P0 de conversão (o ícone de pausa pode cobrir o CTA da barra fixa e nenhum teste percebe).

---

## Conclusão das tarefas

| Tarefa | Status | Commit |
| ------ | ------ | ------ |
| T1 harness | ✅ | 8a68067 |
| T2 WOFF2 | ✅ | 1dcdd32 |
| T3 mockups AVIF/WebP | ✅ | 764f10a |
| T4 Shopify e sprite | ✅ | c754ede |
| T5 limpeza e orçamento | ✅ | 6f8917b |
| T6 módulos ES | ✅ | 61ebb2e |
| T7 pausa | ✅ | e31d21b |
| T8 barra fixa | ✅ | e225291 |
| T9 hero mobile | ✅ | 6e1dbf9 |
| T10 botões estáticos | ✅ | 06abaa6 |
| T11 alvos e ordem | ✅ | ac33fea |
| T12 texto mínimo e alt | ✅ | d744c7d |
| T13 axe | ✅ | 43286de |
| T14 Open Graph | ✅ | b48c0ab |
| T15 hero sem corte e legendas | ✅ | 499b3d2 |
| T16 pausa compacta | ✅ | 43b8150 |

---

## Critérios de aceite comparados com a spec

Todos os caminhos são relativos a `tests/`. As asserções foram conferidas linha a linha contra o valor que a spec define.

### PERF

| AC | Resultado que a spec define | Evidência (`file:line`, asserção) | Resultado |
| -- | --------------------------- | --------------------------------- | --------- |
| PERF-01 | imagens+fontes ≤ 1.500.000 B, 390×844, sem rolar | `e2e/performance.spec.js:10`, `expect(bytes).toBeLessThanOrEqual(1_500_000)` (medido: 249.204 B) | ✅ |
| PERF-02 | ≤ 3.000.000 B depois de rolar até o fim | `e2e/performance.spec.js:19`, `toBeLessThanOrEqual(3_000_000)` | ✅ |
| PERF-03 | cada mockup servido ≤ 200.000 B | `e2e/mockups.spec.js:11` (todo arquivo em disco) + `:27-28` (as 4 marcas servidas em 1440 e 390, `bytes ≤ LIMIT`) | ✅ |
| PERF-04 | logo Shopify ≤ 20.000 B | `e2e/logos.spec.js:20-21`, bytes servidos e em disco `≤ 20_000` | ✅ |
| PERF-05 | sprite ≤ 250.000 B | `e2e/logos.spec.js:27-30`, `served.size === 1`, `≤ 250_000` | ✅ |
| PERF-06 | toda fonte em WOFF2 | `e2e/fonts.spec.js:16-19,22`: extensão `.woff2`, `content-type font/woff2`, magic `wOF2`, nenhuma fonte fora de woff2 | ✅ |
| PERF-07 | toda referência a `assets/` existe; todo asset (exceto a licença) é referenciado | `e2e/assets.spec.js:27` `existsSync(...)===true`; `:33` `unused toEqual([])` | ✅ |

### MOB

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| MOB-01 | mockup visível, altura ≥ 200, topo ≤ 900 (390×844 e 360×740) | `e2e/hero-mobile.spec.js:15-20` | ✅ |
| MOB-02 | fonte ≥ 16, altura ≥ 48, largura = coluna ±2 (≤ 760) | `e2e/hero-mobile.spec.js:34-36` (390, 360) e `:65-67` (760) | ⚠️ "coluna de conteúdo" foi interpretada como a largura do conteúdo de `.hero-copy`. Em `:31` o padding é descontado e em `:63` não, o que é inconsistente (hoje não muda o resultado) |
| MOB-03 | o retângulo visível da fita não intercepta o `h1` | `e2e/hero-mobile.spec.js:52`, `rectsIntersect(visible,h1)===false` | ⚠️ "Retângulo visível" virou a fita recortada por `.hero` (`:44-49`). A asserção fica condicional (`if (visible)`), mas o mutante M3 mostrou que ela roda e mata |
| MOB-04 | barra visível quando o hero sai da tela; oculta e fora do foco com hero, `.plan-price` ou rodapé visíveis | `e2e/sticky-cta.spec.js:13-15` (toBeHidden + `focus()` falha), `:28-63` em 390 e 760 | ✅ |
| MOB-05 | nunca aparece com largura > 760 | `e2e/sticky-cta.spec.js:67-76` (761 e 1440, varrendo a página inteira) | ✅ |
| MOB-06 | 844×390: header ≤ 64, CTA inteiro na 1ª tela | `e2e/hero-mobile.spec.js:73-80`, mais o teste de que nada cobre o CTA em `:82-87` | ✅ |
| MOB-07 | scrollWidth == clientWidth em 1440/1280/820/390/360 | `e2e/smoke.spec.js:17-24` | ✅ |

### A11Y

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| A11Y-01 | 0 violações do axe (wcag2a/2aa/21aa/22aa), 1440 e 390, página rolada | `e2e/axe.spec.js:12-16`, `summary toEqual([])` | ✅ |
| A11Y-02 | todo texto visível fora de `[data-illustration]` ≥ 12px | `e2e/text-a11y.spec.js:7,9` + `helpers.js:37-51` | ✅ |
| A11Y-03 | botão "Pausar animações" visível com `aria-pressed=false` | `e2e/motion.spec.js:48-50` | ✅ (o "texto visível" virou nome acessível com ícone depois da emenda VIS-04) |
| A11Y-04 | pressed=true; texto "Retomar animações"; marquee pausado; 0 pushs em 5s; carrossel parado por 8s; contador parado por 5s | `e2e/motion.spec.js:63-65` + `expectFrozen` `:24,29,35,41` | ✅ |
| A11Y-05 | ao retomar, as animações voltam | `e2e/motion.spec.js:73-91` | ✅ |
| A11Y-06 | reduced motion = estado pausado | `e2e/motion.spec.js:94-98` | ✅ |
| A11Y-07 | nenhum alt não vazio repetido; logo sem nome conhecido com `alt=""` | `e2e/text-a11y.spec.js:22` (únicos), `:24` (rejeita nomes genéricos) | ⚠️ "Nome desconhecido" só é aproximado por uma lista de nomes genéricos proibidos. Nenhum teste compara os alts com uma lista de marcas conhecidas |
| A11Y-08 | `[data-illustration]` com role=img + aria-label, ou aria-hidden=true | `e2e/text-a11y.spec.js:37-38` | ✅ |

### BTN

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| BTN-01 | texto exato, sem a/button, fundo transparente | `e2e/buttons.spec.js:13-19` | ✅ |
| BTN-02 | borda 0, fundo transparente, cursor auto, mesmas categorias, mesma ordem, sem repetição | `e2e/buttons.spec.js:38-43` | ✅ |
| BTN-03 | rótulo visível "Veja o app de:" via aria-labelledby; altura ≥ 44 e fonte ≥ 14 | `e2e/buttons.spec.js:50-62` | ✅ |
| BTN-04 | área clicável ≥ 44×44 em pontos e setas | `e2e/buttons.spec.js:90-94` + `hitArea44` `:69-82` (amostragem com elementFromPoint numa grade de 11×11 sobre o quadrado de 44px) | ✅ A medição é operacional, mas boa o bastante. M11 foi morto |
| BTN-05 | `.plan-price` sem link `/login` | `e2e/buttons.spec.js:99-102` | ✅ |
| BTN-06 | selo acima do h1 com `href="#cases"` e "60+" | `e2e/buttons.spec.js:107-111` | ✅ |
| BTN-07 | pergunta antes do botão no DOM e na tela | `e2e/buttons.spec.js:120-123` | ✅ |

### META

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| META-01 | 9 tags com valores exatos | `e2e/meta.spec.js:20-36` (title/description não vazios, os outros 7 com `toHaveAttribute('content', value)`) | ✅ |
| META-02 | 1200×630, ≤ 300.000 B | `e2e/meta.spec.js:41-44` | ✅ |
| META-03 | apple-touch-icon PNG 180×180 existente | `e2e/meta.spec.js:49-54` | ✅ |

### VIS

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| VIS-01 | celular inteiro em `.hero`, 420–560 px (1440×900, 1280×720) | `e2e/visual.spec.js:23-25` | ✅ |
| VIS-02 | idem, 280–440 px (390×844, 360×740) | `e2e/visual.spec.js:23-25` | ✅ |
| VIS-03 | legenda visível não intercepta o celular mais próximo | `e2e/visual.spec.js:53-57` em 5 tamanhos | ✅ |
| VIS-04 | ≤ 44×44, nome acessível, não cobre links/botões da 1ª tela "em qualquer largura" | `e2e/visual.spec.js:67-90` em 1440×900, 390×844 e 844×390 | ⚠️ "Qualquer largura" virou 3 tamanhos (faltam 360, 820 e 1280). A sobreposição com a barra fixa do mobile não é testada, e o mutante M8 sobreviveu por isso |
| VIS-05 | CTA da barra ≥ 70% da largura da barra | `e2e/visual.spec.js:101` | ⚠️ Só a razão de larguras é verificada. O CTA continua ≥ 70% mesmo com o ícone de pausa em cima dele (M8) |

**Status**: 37/37 ACs têm evidência `file:line` com o valor da spec. Há 5 lacunas de precisão da spec (MOB-02, MOB-03, A11Y-07, VIS-04, VIS-05).

Regra de payload e conjunção: os ACs com vários resultados (A11Y-04 com 6 itens, MOB-04 com oculta + fora do foco, BTN-02 com 5 itens, META-01 com 9 tags, PERF-06 com extensão + MIME + magic) afirmam cada parte pelo valor, não só pela presença. Nenhuma asserção superficial foi encontrada.

---

## Casos de borda

- [x] Barra oculta sem JS: `e2e/sticky-cta.spec.js:79-87`.
- [~] Conteúdo visível sem JS: **nenhuma evidência em teste** (só a barra é verificada). Uma sonda do verificador com JS desligado em 390×844 achou 0 seções, `.reveal`, títulos ou parágrafos ocultos fora do `<dialog>`. O comportamento está certo, mas falta cobertura.
- [~] Sem AVIF, usa WebP: só há evidência estrutural, em `e2e/mockups.spec.js:43-46` (ordem das fontes `image/avif` → `image/webp`, `<img>` de fallback em `.webp`, arquivos existem). Nenhum teste força um navegador sem AVIF, o que é aceitável porque é comportamento nativo do `<picture>`.
- [x] Pausa continua depois de trocar de aba: `e2e/motion.spec.js:100-113`.

---

## Gate

- **Comando**: `npm test` (`playwright test`), rodado na worktree descartável com a porta 4175
- **Resultado**: **89 passaram, 0 falharam, 0 pulados** (55,0s). Bate com o número informado pelos autores.
- **Testes antes da feature**: 0 (não existia `tests/` em `4dd8709`)
- **Testes depois**: 89 (+89)
- **Pulados e falhas**: nenhum

---

## Sensor de discriminação (nível expandido, P0)

Cada mutação foi aplicada na worktree descartável, rodou contra as specs relevantes e foi revertida com `git checkout -- <file>`.

| # | Arquivo | Mutação | Specs rodadas | Morto? |
| - | ------- | ------- | ------------- | ------ |
| M1 | `js/main.js:31` | a barra fixa deixa de observar `.plan-price` | sticky-cta, visual | ✅ Morto (MOB-04 "oculta com o card de preço", 390 e 760) |
| M2 | `js/cases-carousel.js:35` | o carrossel ignora `isPaused()` | motion | ✅ Morto (A11Y-04, A11Y-06, troca de aba) |
| M3 | `styles/components.css` (mobile) | `.hero-scene{display:none}` | hero-mobile, visual | ✅ Morto (MOB-01, MOB-03, VIS-02, ×2 tamanhos) |
| M4 | `js/sticky-cta.js:9` | apaga `bar.inert = !show` (o `inert` do HTML nunca sai) | sticky-cta | ✅ Morto (o CTA visível não recebe foco) |
| M4b | `js/sticky-cta.js:8` | `bar.hidden = false` (sempre visível) | sticky-cta | ✅ Morto (8 testes) |
| M4c | `js/sticky-cta.js:9` | `bar.inert = false` (nunca inert quando oculta) | sticky-cta | ➖ Sobreviveu, **equivalente**: `hidden` (display:none) já tira o link da ordem de foco, e o teste tenta `focus()` (`sticky-cta.spec.js:14`) |
| M5 | `index.html:56` | o `<picture>` do hero no mobile usa `sizes` 800px (as duas fontes), carregando `hiven-mockup-800.avif` | performance, mockups, hero-mobile, visual | ➖ Sobreviveu, **equivalente para a spec**: o peso foi de 249.204 para 298.031 B, ainda dentro do limite de 1.500.000 B do PERF-01. Nenhum AC fixa qual variante é servida |
| M6 | `index.html:16` | remove `og:image:width` | meta | ✅ Morto (META-01) |
| M7 | `js/motion.js:19` | o rótulo fica sempre "Pausar animações" | motion, visual | ✅ Morto (A11Y-04, VIS-04 ×3) |
| M8 | `styles/components.css` (`.sticky-cta{padding-left:72px}` → `16px`) | o ícone de pausa cobre os 44 px da esquerda do CTA na barra fixa. A sonda confirmou: `elementFromPoint` na borda esquerda do CTA cai em `.motion-toggle` | sticky-cta, visual, axe | ❌ **Sobreviveu (não equivalente)** |
| M9 | `js/revenue-demo.js:39` | o contador ignora `isPaused()` | motion | ✅ Morto (3 testes) |
| M10 | `styles/components.css:17` | remove a regra `animations-paused .logo-track` | motion | ✅ Morto (A11Y-06) |
| M11 | `styles/components.css` | pontos do carrossel com 30×30 | buttons | ✅ Morto (BTN-04 ×2) |
| M12 | `styles/components.css` | CTA do hero sem `width:100%`/`flex-basis 100%` | hero-mobile | ✅ Morto (MOB-02 ×3) |
| M13 | `js/push-stack.js:37` | a pilha de pushs ignora `isPaused()` | motion | ✅ Morto (3 testes) |

**Profundidade**: expandida (15 mutações em nível de comportamento).
**Resultado**: 12 mortos, 2 equivalentes (M4c, M5), **1 sobrevivente não equivalente (M8)**. ❌ FAIL.

---

## Qualidade do código

| Princípio | Status |
| --------- | ------ |
| Código mínimo e sem escopo extra | ✅ (a migração `app.js` → módulos ES está prevista na T6) |
| Mudanças cirúrgicas | ⚠️ `components.css` impõe o piso de 12px com `!important` sobre `styles.css`. Isso está documentado no arquivo e é consequente com "não refatorar o CSS inteiro" |
| Segue os padrões | ✅ |
| Asserções comparadas com a spec | ✅ com as lacunas acima |
| Todo teste mapeia para AC, caso de borda ou "Done when" | ✅ (smoke, behavior, logos-crop e brand-picker ficam nos "Done when" das T1, T3, T4 e T6) |
| Guias documentados | nenhum guia de testes no projeto; valeram os padrões da skill |

---

## Planos de correção

### Fix 1 (bloqueante): ícone de pausa sobre o CTA da barra fixa sem teste (M8)
- **Causa raiz**: VIS-04 limita a não sobreposição ao "conteúdo da primeira tela", onde a barra fixa nunca está visível. VIS-05 só mede a razão de larguras. Hoje quem impede a sobreposição é só o `padding-left:72px` em `styles/components.css`.
- **Tarefa**: emendar a spec, estendendo VIS-04 ou VIS-05 com "WHEN a barra fixa está visível THEN o botão de pausa SHALL NOT interceptar o retângulo do CTA da barra". Depois, adicionar um teste em 390×844 e 360×740 com a barra visível que afirme `rectsIntersect(toggle, barCta) === false` (ou elementFromPoint nos cantos do CTA).
- **Concluído quando**: o teste passa no código atual e M8 é morto.

### Fix 2 (menor): conteúdo visível sem JS sem cobertura
- **Tarefa**: estender `sticky-cta.spec.js:79` (contexto sem JS) para afirmar que `.reveal`, `h1`, `h2` e `p` fora do `<dialog>` estão visíveis (opacity > 0, visibility ≠ hidden, display ≠ none).

### Fix 3 (menor, precisão da spec): VIS-04 "qualquer largura"
- **Tarefa**: acrescentar 360×740, 820×1180 e 1280×720 à matriz do VIS-04 e unificar o cálculo de coluna do MOB-02 entre `:31` e `:63`.

### Informativo
- A11Y-07: para tirar a aproximação, seria preciso uma lista de marcas conhecidas na spec (os alts não vazios devem pertencer a ela).
- M5: o limite do PERF-01 tem folga de 6× (249 kB contra 1,5 MB). Uma regressão na escolha de `srcset`/`sizes` passa despercebida. Se isso importar, acrescentar um AC como "em ≤ 760px o hero carrega a variante de 480w".

---

## Rastreabilidade dos requisitos

| Requisito | Antes | Agora |
| --------- | ----- | ----- |
| PERF-01..07 | Implementado, aguardando o verificador | ✅ Verificado |
| MOB-01..07 | Implementado, aguardando o verificador | ✅ Verificado (⚠️ precisão em MOB-02/03) |
| A11Y-01..08 | Implementado, aguardando o verificador | ✅ Verificado (⚠️ precisão em A11Y-07) |
| BTN-01..07 | Implementado, aguardando o verificador | ✅ Verificado |
| META-01..03 | Implementado, aguardando o verificador | ✅ Verificado |
| VIS-01..05 | Implementado, aguardando o verificador | ❌ Precisa de correção (VIS-04/05: sobreposição pausa × barra fixa, M8) |

(O `spec.md` não foi alterado por este verificador. O orquestrador atualiza o status.)

---

## Resumo

**Geral**: ❌ Não está pronto. Falta uma correção pequena, de teste e emenda de spec, sem mudança de código de produção.

- **Spec**: 37/37 ACs com evidência; 5 lacunas de precisão da spec.
- **Sensor**: 15 mutações. 12 mortas, 2 equivalentes, 1 sobrevivente (M8).
- **Gate**: 89 passaram, 0 falharam.

**O que funciona**: orçamento de peso (249 kB na primeira tela do mobile), estado de pausa centralizado e todas as animações congeladas por pausa, reduced motion e troca de aba, ciclo de vida da barra fixa (hero, preço e rodapé, mais o foco), hero mobile, alvos de toque, Open Graph e axe zerado.

**Próximo passo**: Fix 1, depois rodar o verificador de novo (iteração 1 de 3).

## Candidatos a lição (só falhas com base em evidência)
1. `surviving_mutant` (M8): "Quando dois elementos fixos dividem o mesmo canto da tela, afirme que eles não se sobrepõem em cada estado em que ambos ficam visíveis, não só na primeira tela."
2. `spec_precision_gap` (VIS-04): "Quando um AC diz 'em qualquer largura', enumere na spec a matriz de viewports que o teste deve cobrir."
3. `spec_precision_gap` (A11Y-07): "Quando um AC depende de 'nome conhecido', defina na spec a lista de nomes conhecidos para que a asserção seja exata."
