# F3 lp-magia-cases: validação

**Data**: 2026-10-21
**Spec**: `.specs/features/lp-magia-cases/spec.md` (PREVIEW-01..10, CASES-01..05, DATA-01..03, casos de borda)
**Intervalo do diff**: `a1a5f11^..e9c5d5b` (código e testes da F3: a1a5f11, 3551084, 5ecfec4, 6542c66, 6fbd68a, 1db4304, 576ffb9, e83a15d, e9c5d5b; relatório de dados: e0109cb). Gate rodado em `7daf73c` (inclui edd0d4d e 7daf73c, da F2, sem código da F3).
**Iteração**: 0 (primeira verificação)
**Verificador**: sub-agente independente (autor ≠ verificador), worktree descartável em `7daf73c`, porta 4178 só local, removida no fim
**Veredito**: ✅ PASS. Os 18 requisitos têm evidência que confere com o resultado da spec. Os 20 mutantes de comportamento morreram; o único sobrevivente (M21) é equivalente. Os números de `js/cases-data.js` e dos cards conferem com `data-report.md`, checados à mão. Ficam 5 observações não bloqueantes.

---

## Tarefas

| Tarefa | Status | Notas |
| ------ | ------ | ----- |
| T1 | ✅ | `data-report.md` aprovado em 2026-10-21 (e0109cb, anterior ao 1db4304, que publica os números) |
| T2 | ✅ | a1a5f11 |
| T3 | ✅ | 3551084 |
| T4 | ✅ | 5ecfec4 |
| T5 | ✅ | 6542c66 |
| T6 | ✅ | 6fbd68a + e9c5d5b (fix do layout) |
| T7 | ✅ | 1db4304 |
| T8 | ✅ | 576ffb9 |
| T9 | ✅ | e83a15d |

---

## Critérios de aceite comparados com a spec

Caminhos relativos a `tests/`.

### PREVIEW

| AC | Resultado que a spec define | Evidência (`file:line`, asserção) | Resultado |
| -- | --------------------------- | --------------------------------- | --------- |
| PREVIEW-01 | label "Nome da sua loja", `maxlength=24`, 6 cores + "outra cor", tudo por teclado | `e2e/teaser.spec.js:55-64`: `getByLabel('Nome da sua loja',{exact})`, `toHaveAttribute('maxlength','24')`, `radios toHaveCount(6)` com os valores da paleta, `Outra cor` `type=color`; `:67-81`: digitação, Tab até o rádio, ArrowRight troca a cor (`accents` = rgb exato), Tab até "Outra cor" `toBeFocused()`; `:252`: "Enviar logo" acionado por Enter | ✅ |
| PREVIEW-02 | ≤ 150ms, texto no cabeçalho **e** no push | `e2e/teaser.spec.js:86-98`: mede de `dispatchEvent('input')` até `.app-header .app-name` e `.app-push .app-push-name` = "Loja da Ana"; `expect(elapsed).toBeLessThanOrEqual(150)`; `:99-102` app visível, foto oculta | ✅ |
| PREVIEW-03 | aba ativa, botão e banner = exatamente a cor escolhida | `e2e/teaser.spec.js:105-114`: para as 6 cores e `#123456`, `accents` (`.app-banner` bg, `.app-button` bg, `.app-tab.is-active` color) `toEqual(Array(3).fill(rgb(color)))`; `:30-33` com `--brand` forçado | ✅ (ver observação 2: falhou 1 vez em 3 rodadas completas, por carga) |
| PREVIEW-04 | vazio ou só espaços → "Sua Loja" | `unit/preview.spec.js:20` `toBe('Sua Loja')` para `''`, `' '`, `'\t\n'`; `e2e/teaser.spec.js:129-132` `shownNames toEqual(['Sua Loja','Sua Loja'])` | ✅ |
| PREVIEW-05 | HTML aparece literal, sem criar elementos | `e2e/teaser.spec.js:140-147`: `shownNames toEqual([html, html])`, `render img toHaveCount(0)`, contagem de `.hero img` igual à de antes, nenhum `dialog` (alert); `unit/preview.spec.js:33` | ✅ |
| PREVIEW-06 | PNG/JPG/WebP/SVG ≤ 2MB aparecem no cabeçalho e no push; outro tipo ou > 2MB → mensagem exata e logo anterior mantido | `unit/preview.spec.js:67-83`: 4 tipos `{ok:true}`; gif/pdf/bmp/'' com a mensagem exata; `MB2` aceito, `MB2+1` recusado; `e2e/teaser.spec.js:254-259`: mesmo `blob:` no cabeçalho e no push, imagem decodifica (largura 1); `:270-276`: GIF e PNG de 2MB+1 → `toHaveText(LOGO_ERROR)`, `header/push toEqual(before)`, nada revogado | ✅ (JPG/WebP/SVG só no unit; o caminho de exibição é o mesmo do PNG) |
| PREVIEW-07 | nenhuma requisição com nome, cor ou logo | `e2e/teaser.spec.js:362-393`: todas as requisições do contexto (URL decodificada + corpo) sem nome (3 codificações), cor (2), marcador binário do logo; Enter não envia; o clique no CTA vai para o cadastro sem parâmetros; o payload capturado sem "Zeta" | ✅ |
| PREVIEW-08 | CTA vira "Continuar montando meu app", mesmo `href`; `brand_preview_used` uma vez, `{has_name, has_logo}`, sem o nome | `e2e/teaser.spec.js:320-329`: texto antes/depois, `href` com UTM igual, ícone mantido; `:343-345`: depois de 5 interações, `toEqual([{event, properties:{has_name:true, has_logo:false}}])` (igualdade exata: sem campo extra, sem nome); `:348-359`: cor primeiro → `{false,false}`, logo primeiro → `{false,true}` | ✅ (regra de payload atendida: valores conferidos, não só a chamada) |
| PREVIEW-09 | ≤ 760px: sem rolagem horizontal, alvos ≥ 44px | `e2e/teaser.spec.js:166-193` em 390 e 360: `scrollWidth toBe(clientWidth)`, cada `input`/`button` visível ≥ 44×44 e dentro da tela (9 alvos medidos), celular dentro do hero | ✅ (conferido à parte em 760, 600 e 320: sem rolagem, nenhum alvo < 44px) |
| PREVIEW-10 | URL anterior revogada | `e2e/teaser.spec.js:280-291`: espião em `URL.createObjectURL`/`revokeObjectURL`; `created toEqual([first, second])`, `revoked toEqual([first])` | ✅ |

### CASES

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| CASES-01 | exatamente Loum, Hiven, Belletonn, Pé de Algodão | `e2e/cases.spec.js:32-34`: 4 cards, `aria-label` e nome da marca `toEqual(NAMES)` em 1440 e 390 | ✅ |
| CASES-02 | métrica % por card, período visível, valor = aprovado no relatório | `e2e/cases.spec.js:15-23`: `cases-data.js` contra a coluna "Recomendação para o card" lida do relatório e contra os valores fixos `{Loum:'26,8%', Hiven:'68%', Belletonn:'20,7%', 'Pé de Algodão':'9,7%'}`; `:44-51`: cada card mostra a métrica, o texto e "Período: jul–out 2026" visíveis | ✅ |
| CASES-03 | diálogo: métrica fora do card, período, "Quero um resultado assim" → WhatsApp com a mensagem do case | `e2e/cases.spec.js:64-70`: extra = coluna "Extra para o diálogo" e valores fixos `13,7% / 3,8% / 11% / 3,4%`; `:89-103`: extra visível e ausente do texto do card, período, `href = waLink('case', nome)` e `text` exato; `:112-121`: diálogo de recurso não herda o bloco do case | ✅ |
| CASES-04 | ponteiro, toque, foco, tecla ou rolagem param o avanço até recarregar | `e2e/cases.spec.js:147-152` (controle: avança sem interação); foco `:154-160`, clique (ponteiro) `:162-169`, roda `:171-181`, tecla `:183-192`, toque `:202-216`: `railLeft` igual depois de 8s de relógio, com o carrossel na tela (`waitAutoplay` exige ≥ 50% visível) | ✅ |
| CASES-05 | com animações pausadas, não avança | `e2e/cases.spec.js:194-199`: depois de "Pausar animações", `railLeft toBe(0)` em 8s | ✅ |

### DATA (feitos pelo orquestrador; conferido só o relatório)

| AC | Resultado que a spec define | Evidência | Resultado |
| -- | --------------------------- | --------- | --------- |
| DATA-01 | só leitura | Declarado em `data-report.md:3`; não verificável por mim (sem acesso a produção, por regra) | ✅ atestado |
| DATA-02 | métricas, período e data da coleta por case; sem consultas, credenciais ou IDs | `data-report.md:3-5`, tabela `:20-25`; busca por SQL, ARN, UUID, `_id`, token, senha, perfil: nada | ✅ (ver observação 4) |
| DATA-03 | nenhum número novo antes da aprovação | aprovação registrada em `data-report.md:6` e `:35` já no commit e0109cb (11:36), anterior ao 1db4304 (15:48), que publica os números | ✅ |

### Conferência independente dos números (card e diálogo)

| Case | Relatório: card | `cases-data.js` / card no `index.html` | Relatório: extra | `cases-data.js` extra |
| ---- | --------------- | -------------------------------------- | ---------------- | --------------------- |
| Loum | 26,8% do faturamento veio do app | 26,8% · "do faturamento da loja veio do app." | 13,7% via push | "13,7% do faturamento veio de notificações push." |
| Hiven | ticket médio 68% maior no app | 68% · "de ticket médio maior no app do que no site." | app = 3,8% | "3,8% do faturamento veio do app." |
| Belletonn | 20,7% de conversão após abrir o push | 20,7% · "de conversão após abrir o push." | 11% via app | "11% do faturamento veio do app." |
| Pé de Algodão | 9,7% do faturamento veio do app | 9,7% · "do faturamento da loja veio do app." | 3,4% via push | "3,4% do faturamento veio de notificações push." |

Período: "jul–out 2026" nos 4 cards e no diálogo; a nota cita 23/07/2026 a 20/10/2026, igual ao relatório. Nenhum número antigo (42%, 26,6%, 4,98%) resta em `index.html` ou `js/`.

**Status**: ✅ 18/18 ACs com evidência que confere com a spec.

---

## Casos de borda

- [x] Nome com mais de 24 caracteres colado é cortado em 24: `e2e/teaser.spec.js:150-156` (`toHaveValue('Loja Muito Comprida Dema')` e o app mostra o mesmo); `unit/preview.spec.js:27-30`. Conferido à parte: valor de 40 caracteres injetado sem `maxlength` também sai com 24 no cabeçalho.
- [x] Cor com pouco contraste deixa o texto escuro (≥ 4,5:1): `unit/preview.spec.js:37-63` (6 cores, `#FFFF00`, `#000000`, cinzas de 5 em 5 e tons médios, contraste calculado no teste pela definição WCAG); `e2e/teaser.spec.js:116-123` (âmbar → texto `#0f1a33`; azul → branco). Conferido à parte: `#ffff00` → `#0f1a33`, `#808080` → `#000000`.
- [x] Sem JavaScript: formulário oculto e foto real: `e2e/teaser.spec.js:196-205`.
- [x] Case sem métrica % no banco: não ocorreu; a Hiven ganhou uma métrica nova e o relatório sinaliza as métricas antigas que não se reproduzem (`data-report.md:29-30`).

**SPEC_DEVIATION** `readableTextColor` → `#000000` (`js/preview.js:29`): desvia do `design.md` (só `#ffffff`/`#0f1a33`), mas cumpre a spec, que pede "texto escuro" com ≥ 4,5:1. Sem o preto, `#808080` não alcança 4,5 com nenhuma das duas cores. Aceito.

Os outros desvios listados em `tasks.md` (formulário abaixo dos CTAs, logo como `background-image`, renderização síncrona, 2MB = 2×1024×1024, "notificações push", `href` do WhatsApp definido ao abrir, "Case Hiven") estão dentro do texto da spec. O formulário continua abaixo do subtítulo. O logo aparece no cabeçalho e no push. E "push" está entre as palavras aprovadas no relatório.

---

## Sensor de discriminação

Expandido (≥ 6 pedido). Mutações aplicadas uma por vez no worktree descartável, rodando `unit/preview.spec.js`, `e2e/teaser.spec.js` e `e2e/cases.spec.js` (58 testes) com `--workers=3`, e desfeitas com `git checkout` depois de cada uma. O `git diff` ficou limpo no fim.

| # | Arquivo | Mutação | Morto? | Por |
| - | ------- | ------- | ------ | --- |
| M1 | `js/preview-ui.js:36` | nome com `innerHTML` em vez de `textContent` | ✅ | `teaser:135` |
| M2 | `js/preview-ui.js:66` | não revoga a URL anterior | ✅ | `teaser:280` |
| M3 | `js/preview.js:6` | aceita `image/gif` | ✅ | `unit:73`, `teaser:266` (GIF) |
| M4 | `js/preview.js:37` | aceita 2MB + 1 byte | ✅ | `unit:80`, `teaser:266` (2MB+1) |
| M5 | `js/preview-ui.js:22` | evento a cada interação (sem a trava) | ✅ | `teaser:332` |
| M6 | `js/preview-ui.js:26` | payload inclui `name` | ✅ | `teaser:332`, `:352` (×2) e outros (4 falhas) |
| M7 | `js/preview-ui.js:25` | CTA não muda de texto | ✅ | `teaser:318`, `:352` |
| M8 | `js/cases-carousel.js` | `focusout` volta a ligar o avanço | ✅ | `cases:154`, `:183` |
| M9 | `js/cases-data.js:21` | Belletonn 20,7% → 20,8% só em `cases-data.js` | ✅ | `cases:14`, `:38` |
| M10 | `js/cases-data.js:15` + `index.html` | Hiven 68% → 67% nos dois (coerente entre si, diferente do relatório) | ✅ | `cases:14` |
| M11 | `js/preview.js:31` | contraste aceita ≥ 1 (branco sobre amarelo) | ✅ | `unit:39`, `unit:46`, `teaser:116` (6 falhas) |
| M12 | `js/preview-ui.js:26` | `has_logo` sempre `false` | ✅ | `teaser:352` (logo) |
| M13 | `js/cases-carousel.js:22` | roda não para o avanço | ✅ | `cases:171` |
| M14 | `js/cases-carousel.js:38` | ignora a pausa global | ✅ | `cases:194` |
| M15 | `js/preview.js:12` | vazio não vira "Sua Loja" | ✅ | `teaser:125` e outros (5 falhas) |
| M16 | `js/preview-ui.js:40` | `fetch('/?q=' + nome)` a cada mudança | ✅ | `teaser:362` |
| M17 | `js/preview-ui.js:65` | logo inválido substitui o anterior | ✅ | `teaser:266` (×2) |
| M18 | `js/dialog.js` | WhatsApp do diálogo com a mensagem do hero | ✅ | `cases:74` (×2) |
| M19 | `js/dialog.js` | período do diálogo vazio | ✅ | `cases:74` (×2) |
| M20 | `js/cases-carousel.js:22` | sem `pointerdown` e `touchstart` | ✅ | `cases:162` |
| M21 | `js/cases-carousel.js:22` | sem só `touchstart` | ⚪ sobreviveu, equivalente | — |

**M21 é equivalente**: no Chromium, um toque dispara `pointerdown`, e um toque dentro do carrossel (`tabindex=0`) também dispara `focusin`. Sem o `touchstart`, o comportamento observável continua o mesmo. Isso não é fraqueza do teste. O ouvinte é só redundante.

**Resultado**: 20/20 mutantes não equivalentes mortos; 1 equivalente. ✅ PASS

---

## Gate

- **Comando**: `npm test -- --workers=3` (porta 4178 só local)
- **Total**: 229 testes (não 230: `npx playwright test --list` dá 229 em 28 arquivos em `7daf73c`)
- **Rodada 1**: 227 passaram, 2 falharam: `mockups.spec.js:15` PERF-03 1440 e `teaser.spec.js:105` PREVIEW-03 (ver observação 2)
- **Rodada 2**: 228 passaram, 1 falhou: `mockups.spec.js:15` PERF-03 1440
- **Rodada 3 (árvore limpa, depois do sensor)**: **229 passaram, 0 falharam**
- **PERF-03 1440**: é uma intermitência de antes da F3. Falhou também na base `4a5b2ac` (antes do a1a5f11), na suíte completa (168 passaram, 1 falhou) e passou nas 5 repetições isoladas. Não conta contra a F3.
- **Contagem de testes**: 169 antes (`4a5b2ac`) → 229 depois. A F3 soma 58 (`teaser.spec.js`, `unit/preview.spec.js` e `cases.spec.js`), e 7daf73c (F2) soma 2. Nenhum teste removido. A única alteração de teste existente, `behavior.spec.js:45`, segue o novo título do diálogo da Loum.
- **Pulados**: nenhum

---

## Qualidade do código

| Princípio | Status |
| --------- | ------ |
| Código mínimo | ✅ (`preview.js` 39 linhas, `preview-ui.js` 77) |
| Mudanças cirúrgicas | ✅ (`config.js` espalha `cases`; `dialog.js` +13) |
| Sem escopo extra | ✅ |
| Segue os padrões | ✅ (módulos ES, `data-track`, `waLink`) |
| Valores das asserções conferem com a spec | ✅ |
| Cobertura por camada (unit 1:1; e2e feliz + borda + falha) | ✅ |
| Todo teste mapeia a um AC, caso de borda ou "Done when" | ✅ (`cases:58` fine-print: herança da F1/F2, "Done when" de T7) |
| AD-008 (versão do CSS) | ✅ `components.css?v=20261021n` |
| AD-004 (sem chave → sem analytics) | ✅ `POSTHOG_KEY = ''`; os testes injetam a chave só via rota |
| Diretrizes documentadas | nenhuma; padrões fortes aplicados |

---

## Observações (não bloqueantes)

1. **Contagem do gate**: o esperado informado era 230, mas a suíte em `7daf73c` tem 229 testes. Não falta teste, a contagem esperada estava errada.
2. **PREVIEW-03 falhou uma vez sob carga** (`teaser.spec.js:105`, rodada 1). O primeiro rádio ficou "não visível" por 30s, o que indica que o `initPreview` não rodou naquela página (o formulário começa `hidden`). Não se repetiu em 5 repetições isoladas nem nas rodadas 2 e 3. É provável que um módulo JS não tenha carregado no `http.server` sob carga. Vale acompanhar. Se voltar a acontecer, esperar `form:not([hidden])` antes de agir.
3. **Texto do card da Loum**: o `h3` diz "Mais de um quarto das vendas no app." A métrica aprovada é de faturamento (26,8%), e pelo relatório o app tem 24,3% dos **pedidos**, menos de um quarto. Se "vendas" for lido como pedidos, a frase fica imprecisa. O título não faz parte da aprovação nem é testado. Sugestão: "Mais de um quarto do faturamento no app."
4. **AD-003 (leve)**: o relatório não tem consultas, credenciais nem IDs. Mas as observações 3 e 4 de `data-report.md` descrevem uma inconsistência interna do backend e um "pipeline antigo". E `tasks.md` (T1, "Tools") cita o nome do perfil AWS SSO e o caminho de um arquivo `.env` local. Não são segredos, mas são detalhes internos numa pasta que pode ser publicada. Vale cortar antes do deploy.
5. **`touchstart` redundante** em `js/cases-carousel.js:22` (M21). Não muda comportamento.

---

## Rastreabilidade

| Requisito | Antes | Agora |
| --------- | ----- | ----- |
| PREVIEW-01..10 | Implementado, testes verdes; aguardando Verifier | ✅ Verificado |
| CASES-01..05 | Implementado, testes verdes; aguardando Verifier | ✅ Verificado |
| DATA-01..03 | Verificado | ✅ Verificado (relatório conferido) |

---

## Resumo

**Geral**: ✅ Pronto

**Spec**: 18/18 ACs conferem com o resultado da spec; nenhuma lacuna de precisão bloqueante
**Sensor**: 21 mutações; 20 mortas; 1 equivalente
**Gate**: 229 passaram, 0 falharam (rodada 3); a intermitência do PERF-03 vem de antes da F3

**Próximos passos**: atualizar a rastreabilidade em `spec.md`. Opcional: observações 3 e 4 (texto da Loum, detalhes internos em `.specs/`).
