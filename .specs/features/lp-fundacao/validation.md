# F1 lp-fundacao: validação (reverificação, iteração 1 de 3)

**Data**: 2026-10-21
**Spec**: `.specs/features/lp-fundacao/spec.md` (com a emenda de 2026-10-21: VIS-04 em 6 tamanhos, VIS-05 com "pausa não intercepta controles da barra", caso de borda sem JS)
**Intervalo do diff**: `4dd8709..157a838` (código da F1: 8a68067 … 43b8150; correção desta iteração: 157a838; commits da F2 Fase 1 no meio: e6ed16e … 3dd5a03)
**Iteração**: 1 de 3 (correção do FAIL anterior: mutante M8)
**Verificador**: sub-agente independente (autor ≠ verificador), worktree descartável em `157a838`, porta 4175 só local, removida no fim
**Veredito**: ✅ PASS. O M8 e suas variantes agora morrem, os 37 ACs seguem com evidência sobre a F2 Fase 1, e o gate está verde. Ficam 3 lacunas menores de precisão, herdadas e não bloqueantes.

---

## O que mudou desde a verificação anterior

| Commit | O que toca na F1 |
| ------ | ---------------- |
| 157a838 | `styles/components.css`: regra `@media(max-width:380px)` (barra com `gap:4px;padding-left:52px;padding-right:4px`, pausa em `left:4px`); `tests/e2e/visual.spec.js`: VIS-04 em 6 tamanhos, VIS-05 em 390 e 360 com a verificação de sobreposição, teste de conteúdo sem JS; `spec.md`: emenda de VIS-04/VIS-05 e do caso de borda |
| be87f73, 3dca42b (F2) | Texto do CTA virou "Montar meu app grátis" em todos os `.signup-cta`; a barra fixa ganhou `.sticky-whatsapp` (44px) à direita, e a pausa foi para `left:8px` com `padding-left:57px` na barra |
| be87f73 (F2) | `tests/e2e/sticky-cta.spec.js:42`: `toContainText('Criar conta grátis')` → `toContainText('Montar meu app grátis')` |

**Fidelidade de `sticky-cta.spec.js:42` ao MOB-04**: o MOB-04 exige "o CTA principal" na barra e não fixa a redação. O teste localiza o link pelo `href` do CTA principal (`:5`, `https://admin.korza.app/create-account`) e confere o texto, que é o mesmo do CTA do hero (`data-track="hero"`) e dos outros 6 `.signup-cta` em `index.html`. ✅ Continua fiel; a troca foi só de texto.

---

## Critérios de aceite comparados com a spec

Caminhos relativos a `tests/`. Os arquivos de teste de PERF, A11Y, BTN e META não mudaram desde `f903985`, então as linhas abaixo foram conferidas de novo em `157a838`.

### PERF

| AC | Resultado que a spec define | Evidência (`file:line`, asserção) | Resultado |
| -- | --------------------------- | --------------------------------- | --------- |
| PERF-01 | imagens+fontes ≤ 1.500.000 B em 390×844, sem rolar | `e2e/performance.spec.js:10`, `expect(bytes).toBeLessThanOrEqual(1_500_000)` | ✅ |
| PERF-02 | ≤ 3.000.000 B depois de rolar até o fim | `e2e/performance.spec.js:19`, `toBeLessThanOrEqual(3_000_000)` | ✅ |
| PERF-03 | cada mockup servido ≤ 200.000 B | `e2e/mockups.spec.js:11`, `:27-28` | ✅ |
| PERF-04 | logo Shopify ≤ 20.000 B | `e2e/logos.spec.js:20-21` | ✅ |
| PERF-05 | sprite ≤ 250.000 B | `e2e/logos.spec.js:27-30` | ✅ |
| PERF-06 | toda fonte em WOFF2 | `e2e/fonts.spec.js:16-19,22` (extensão, MIME, magic `wOF2`) | ✅ |
| PERF-07 | toda referência a `assets/` existe; todo asset é referenciado | `e2e/assets.spec.js:27` `existsSync(...)===true`; `:33` `unused toEqual([])` (continua verde com o símbolo `#whatsapp` da F2, que é inline) | ✅ |

### MOB

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| MOB-01 | mockup visível, altura ≥ 200, topo ≤ 900 (390×844, 360×740) | `e2e/hero-mobile.spec.js:15-20` | ✅ |
| MOB-02 | fonte ≥ 16, altura ≥ 48, largura = coluna ±2 (≤ 760) | `e2e/hero-mobile.spec.js:34-36` (390, 360), `:65-67` (760) | ⚠️ Lacuna herdada, não corrigida: `:31` desconta o padding de `.hero-copy` e `:63` não. Hoje não muda o resultado |
| MOB-03 | o retângulo visível da fita não intercepta o `h1` | `e2e/hero-mobile.spec.js:52` | ⚠️ Herdada: asserção condicional (`if (visible)`); o M3 da rodada anterior mostrou que ela roda |
| MOB-04 | barra visível quando o hero sai; oculta e fora do foco com hero, `.plan-price` ou rodapé visíveis | `e2e/sticky-cta.spec.js:13-15` (`toBeHidden` + `focus()` falha), `:28-63` em 390 e 760; texto do CTA em `:42` (veja acima) | ✅ |
| MOB-05 | nunca aparece com largura > 760 | `e2e/sticky-cta.spec.js:67-76` (761 e 1440, varrendo a página) | ✅ |
| MOB-06 | 844×390: header ≤ 64, CTA inteiro na 1ª tela | `e2e/hero-mobile.spec.js:73-80`, cantos sem cobertura `:82-87` | ✅ |
| MOB-07 | scrollWidth == clientWidth em 1440/1280/820/390/360 | `e2e/smoke.spec.js:17-24` | ✅ |

### A11Y

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| A11Y-01 | 0 violações do axe (4 tags) em 1440 e 390, página rolada | `e2e/axe.spec.js:12-16`, `summary toEqual([])` (verde com os botões de WhatsApp da F2) | ✅ |
| A11Y-02 | texto visível fora de `[data-illustration]` ≥ 12px | `e2e/text-a11y.spec.js:7,9` + `helpers.js:37-51` | ✅ |
| A11Y-03 | botão "Pausar animações" visível, `aria-pressed=false` | `e2e/motion.spec.js:48-50` | ✅ |
| A11Y-04 | pressed=true; "Retomar animações"; marquee pausado; 0 pushs em 5s; carrossel parado 8s; contador parado 5s | `e2e/motion.spec.js:63-65` + `expectFrozen` `:24,29,35,41` | ✅ |
| A11Y-05 | ao retomar, as animações voltam | `e2e/motion.spec.js:73-91` | ✅ (veja a nota de instabilidade no Gate) |
| A11Y-06 | reduced motion = estado pausado | `e2e/motion.spec.js:94-98` | ✅ |
| A11Y-07 | nenhum alt não vazio repetido; logo sem nome conhecido com `alt=""` | `e2e/text-a11y.spec.js:22`, `:24` | ⚠️ Herdada (já registrada como L-003): "nome conhecido" só é aproximado |
| A11Y-08 | `[data-illustration]` com role=img + aria-label, ou aria-hidden | `e2e/text-a11y.spec.js:37-38` | ✅ |

### BTN

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| BTN-01 | texto exato, sem a/button, fundo transparente | `e2e/buttons.spec.js:13-19` | ✅ |
| BTN-02 | borda 0, fundo transparente, cursor auto, mesmas categorias, mesma ordem, sem repetição | `e2e/buttons.spec.js:38-43` | ✅ |
| BTN-03 | rótulo "Veja o app de:" via aria-labelledby; altura ≥ 44 e fonte ≥ 14 | `e2e/buttons.spec.js:50-62` | ✅ |
| BTN-04 | área clicável ≥ 44×44 | `e2e/buttons.spec.js:90-94` + `hitArea44` `:69-82` | ✅ |
| BTN-05 | `.plan-price` sem link `/login` | `e2e/buttons.spec.js:99-102` (verde com o link de WhatsApp da F2 no card) | ✅ |
| BTN-06 | selo com `href="#cases"` e "60+" | `e2e/buttons.spec.js:107-111` | ✅ |
| BTN-07 | pergunta antes do botão no DOM e na tela | `e2e/buttons.spec.js:120-123` | ✅ |

### META

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| META-01 | 9 tags com valores exatos | `e2e/meta.spec.js:20-36` | ✅ |
| META-02 | 1200×630, ≤ 300.000 B | `e2e/meta.spec.js:41-44` | ✅ |
| META-03 | apple-touch-icon PNG 180×180 | `e2e/meta.spec.js:49-54` | ✅ |

### VIS

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| VIS-01 | celular inteiro em `.hero`, 420–560 px (1440×900, 1280×720) | `e2e/visual.spec.js:23-25` | ✅ |
| VIS-02 | idem, 280–440 px (390×844, 360×740) | `e2e/visual.spec.js:23-25` | ✅ |
| VIS-03 | legenda visível não intercepta o celular mais próximo | `e2e/visual.spec.js:53-57` em 5 tamanhos | ✅ |
| VIS-04 | em 1440×900, 1280×720, 820×1180, 390×844, 360×740 e 844×390: ≤ 44×44 visíveis, nome "Pausar/Retomar animações", não intercepta link/botão da 1ª tela | `e2e/visual.spec.js:61` (exatamente os 6 tamanhos da spec), `:65` nome, `:67-68` e `:73-76` ≤ 44, `:83-84` `covered toEqual([])`, `:87-90` estado pressionado | ✅ (a lacuna "qualquer largura" foi fechada na spec e no teste; N4 e N5 morreram em 820/1280) |
| VIS-05 | barra visível (390×844, 360×740): CTA ≥ 70% da barra; pausa não intercepta nenhum link/botão da barra | `e2e/visual.spec.js:94` (390 e 360), `:102` `ctaBox.width ≥ 0.7*barBox.width`, `:105-109` controles da barra (CTA e WhatsApp) sem interseção com a pausa, `barControls.length > 0` | ✅ (M8, M8b, N2, N6b e N8 mortos) |

**Status**: 37/37 ACs com evidência `file:line` que confere com o valor da spec. 3 lacunas de precisão herdadas e não bloqueantes (MOB-02, MOB-03, A11Y-07). As lacunas de VIS-04 e VIS-05 da rodada anterior foram fechadas.

**Margens medidas** (sonda do verificador, barra visível): em 390×844, pausa x 8–52, CTA x 57–333 (276 px = 70,8% de 390; mínimo 273), WhatsApp x 338–382. Em 360×740, pausa x 4–48, CTA x 52–308 (256 px = 71,1%; mínimo 252), WhatsApp x 312–356. A folga é de 3 a 4 px: qualquer aumento de gap ou padding na barra quebra o VIS-05, e o teste pega.

---

## Casos de borda

- [x] Sem JS, conteúdo visível: `e2e/visual.spec.js:113-127`, em 390×844 com `javaScriptEnabled:false`. Pega `main h1/h2/h3/p` fora de `dialog`, multiplica a opacidade pelos ancestrais, rejeita área 0 e `visibility:hidden`, e afirma `hidden toEqual([])`. Bate com a spec ("opacidade 1, área > 0"). Morreram N3 (`.reveal{opacity:0}` só sem JS) e N3b (`h2{visibility:hidden}` só sem JS). Observação: a spec diz "todo título"; não há `h4`+ no `index.html`, então `h1-h3` cobre tudo hoje.
- [x] Sem JS, a barra não aparece: `e2e/sticky-cta.spec.js:79-87` (N7 morto).
- [~] Sem AVIF, usa WebP: só evidência estrutural (`e2e/mockups.spec.js:43-46`). Aceitável, porque é o comportamento nativo do `<picture>`; não mudou.
- [x] Pausa continua depois de trocar de aba: `e2e/motion.spec.js:100-113`.

---

## Gate

- **Comando**: `npm test` (`playwright test`), na worktree descartável com a porta 4175
- **Resultado final**: **124 passaram, 0 falharam, 0 pulados** (43,8s), igual ao número esperado
- **Testes antes da feature**: 0 (não existia `tests/` em `4dd8709`). Na verificação anterior: 89. Agora: 124 (+35: 4 de VIS-04, 1 de VIS-05, 1 do caso sem JS, e 29 da F2 em `contact`, `offer` e `unit/whatsapp`)
- **Instabilidade observada (informativa)**: o host estava com load average de ~350–390 por causa de outro worker. Nessas condições, 2 de 4 rodadas completas tiveram 1 falha cada, sempre num teste diferente: `offer.spec.js:84` OFFER-05 (F2) numa e `motion.spec.js:68` A11Y-05 na outra (rodada de 2,8 min). Rodando isolados com `--repeat-each`, deu 65/65 em `offer.spec.js` e 36/36 em `motion.spec.js` (este levou 8 min sob a mesma carga), e as duas rodadas completas com carga normal deram 124/124. Fica registrado como sensibilidade a tempo sob carga extrema, não como regressão. O A11Y-05 mistura `page.clock` com `waitForTimeout` e `expect.poll`.

---

## Sensor de discriminação (nível expandido, P0)

Cada mutação foi aplicada na worktree descartável, rodou contra `e2e/visual.spec.js` e `e2e/sticky-cta.spec.js` (31 testes) e foi revertida com `git checkout -- styles/components.css index.html`. Os testes que falharam foram conferidos pelo nome: em todos os casos, foi o teste do AC atacado.

| # | Arquivo | Mutação | Matou | Morto? |
| - | ------- | ------- | ----- | ------ |
| M8 | `styles/components.css` (≤ 760) | `.sticky-cta` `padding-left:57px` → `16px`: a pausa cobre a borda esquerda do CTA em 390 | VIS-05 390×844 | ✅ Morto (era o sobrevivente da rodada anterior) |
| M8b | `styles/components.css` (≤ 380) | `padding-left:52px` → `16px` | VIS-05 360×740 | ✅ Morto |
| N1 | `styles/components.css` | remove o bloco `@media(max-width:380px)` inteiro (CTA cai para 246 px em 360) | VIS-05 360×740 (razão de 70%) | ✅ Morto |
| N2 | `styles/components.css` (≤ 380) | pausa `left:4px` → `left:20px` (cobre o CTA em 360) | VIS-05 360×740 | ✅ Morto |
| N3 | `styles/components.css` | `body:not(.motion-enabled) .reveal{opacity:0}` (só sem JS) | caso de borda sem JS | ✅ Morto |
| N3b | `styles/components.css` | `body:not(.motion-enabled) main h2{visibility:hidden}` | caso de borda sem JS | ✅ Morto |
| N4 | `styles/components.css` | pausa 48×48 em 800–1300 px | VIS-04 820×1180, 1280×720 (e 844×390) | ✅ Morto |
| N5 | `styles/components.css` | pausa no topo (`top:12px`) em 800–1300 px, por cima do header | VIS-04 820×1180, 1280×720 (e 844×390) | ✅ Morto |
| N6 | `styles/components.css` | `.sticky-whatsapp{order:-1}` (WhatsApp vai para a esquerda do CTA) | nenhum | ➖ Sobreviveu, **equivalente**: a sonda mostra o WhatsApp em x 57–101 (390) e 52–96 (360), sem tocar na pausa (8–52 / 4–48), e o CTA continua com 276/256 px. A spec não fixa a ordem dos ícones |
| N6b | `styles/components.css` | `.sticky-whatsapp{order:-1;margin-left:-49px}` (WhatsApp embaixo da pausa: x 8–52 / 3–47) | VIS-05 390 e 360 | ✅ Morto |
| N7 | `index.html` | tira `hidden inert` da `.sticky-cta` | sem JS a barra não aparece | ✅ Morto |
| N8 | `styles/components.css` | `.sticky-whatsapp{width:120px}` (CTA abaixo de 70%) | VIS-05 390 e 360 | ✅ Morto |

**Profundidade**: expandida (12 mutações em nível de comportamento, nas áreas mudadas: regra ≤ 380, sobreposição pausa × barra, pausa × WhatsApp, VIS-04 em 820/1280, visibilidade sem JS).
**Resultado**: 11 mortos, 1 equivalente (N6), **0 sobreviventes não equivalentes**. ✅ PASS.

Os mutantes da rodada anterior (M1–M7, M9–M13) atacavam arquivos que a 157a838 não mexeu. Os testes que os mataram continuam iguais e verdes, então não foram repetidos.

---

## Qualidade do código (diff da correção, 157a838)

| Princípio | Status |
| --------- | ------ |
| Código mínimo, sem escopo extra | ✅ Uma regra CSS de 2 linhas para ≤ 380 px; o resto é teste e spec |
| Mudanças cirúrgicas | ✅ `index.html` só trocou o `?v=` do CSS (AD-008) |
| Segue os padrões | ✅ (`rectOf`, `rectsIntersect` e `gotoAt` reaproveitados) |
| Asserções comparadas com a spec | ✅ VIS-04: matriz idêntica à da spec. VIS-05: razão e não interseção. Sem JS: opacidade 1 e área > 0 |
| Todo teste mapeia para AC ou caso de borda | ✅ |
| Guias documentados | nenhum guia de testes no projeto; valeram os padrões da skill |

---

## Pendências menores (não bloqueantes)

1. **MOB-02** (precisão, herdada): unificar o cálculo da coluna entre `e2e/hero-mobile.spec.js:31` (desconta padding) e `:63` (não desconta). Estava no Fix 3 da rodada anterior e não entrou na 157a838.
2. **MOB-03** (precisão, herdada): a asserção em `e2e/hero-mobile.spec.js:52` é condicional. Se a fita sumir, o teste passa sem afirmar nada. Dá para afirmar explicitamente qual estado é aceito.
3. **A11Y-07** (precisão, herdada, já é a lição L-003): a spec não lista os nomes conhecidos.
4. **Informativo**: a sensibilidade a tempo do A11Y-05 sob carga extrema (veja o Gate). A folga do VIS-05 é de 3 a 4 px em 390 e 360, então qualquer mudança futura na barra (F2/F3) precisa respeitar isso.

---

## Rastreabilidade dos requisitos

| Requisito | Antes | Agora |
| --------- | ----- | ----- |
| PERF-01..07 | ✅ Verificado | ✅ Verificado |
| MOB-01..07 | ✅ Verificado (⚠️ MOB-02/03) | ✅ Verificado (⚠️ MOB-02/03, herdadas) |
| A11Y-01..08 | ✅ Verificado (⚠️ A11Y-07) | ✅ Verificado (⚠️ A11Y-07, herdada) |
| BTN-01..07 | ✅ Verificado | ✅ Verificado |
| META-01..03 | ✅ Verificado | ✅ Verificado |
| VIS-01..05 | ❌ Precisa de correção (M8) | ✅ Verificado |

(O `spec.md` não foi alterado por este verificador. O orquestrador atualiza o status.)

---

## Resumo

**Geral**: ✅ Pronto.

- **Spec**: 37/37 ACs com evidência e valor da spec; 3 lacunas de precisão herdadas e não bloqueantes.
- **Sensor**: 12 mutações. 11 mortas, 1 equivalente, 0 sobreviventes.
- **Gate**: 124 passaram, 0 falharam.

**Lições**: nenhuma nova. O sinal desta rodada (M8 e a matriz do VIS-04) já está em L-001 e L-002, e A11Y-07 em L-003. As lacunas de MOB-02 e MOB-03 vêm da rodada anterior, que decidiu não transformá-las em lição. Uma lição repetida dentro da mesma feature não aumenta a recorrência.
