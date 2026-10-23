# Site Korza

Site institucional estático da Korza. O projeto contém HTML, CSS, JavaScript e imagens; o site não precisa de instalação de dependências nem de etapa de build. As dependências do `package.json` servem só para os testes.

O JavaScript fica em módulos ES nativos em `js/` (entrada `js/main.js`). O CSS novo fica em `styles/components.css`, carregado depois de `styles.css`. Requisitos, decisões e planos de cada melhoria estão em `.specs/`.

## Prévia local

Na pasta do projeto, execute:

```sh
python3 -m http.server 4173
```

Acesse http://localhost:4173.

## Testes

Os testes usam Playwright e axe-core e sobem o próprio servidor na porta 4174.

```sh
npm install
npm test            # tudo
npm run test:unit   # só funções puras (calculadora, UTM, WhatsApp, teaser)
npm run test:e2e    # página no navegador
```

## Configuração

Contato, mensagens do WhatsApp, preço do plano e analytics ficam em `js/config.js`. O PostHog só é carregado quando `POSTHOG_KEY` está preenchida com a chave do projeto da Korza; vazia, nenhuma requisição de analytics é feita. Os links de WhatsApp também estão escritos no `index.html` para funcionar sem JavaScript, e um teste confere que batem com a configuração.

## Imagens e fontes

Os originais ficam em `assets-src/`. O script `scripts/optimize-assets.sh` gera em `assets/` os mockups em AVIF e WebP, o sprite de logos, as fontes em WOFF2, a imagem de compartilhamento (`og-image.jpg`) e o `apple-touch-icon.png`. Ele precisa de `cwebp`, `avifenc`, ImageMagick 7 e `fontTools`, e só refaz o que estiver faltando ou desatualizado.

## Cache do CSS

Os links de CSS no `index.html` levam `?v=`. Toda mudança em um arquivo CSS deve trocar essa versão no mesmo commit, para quem já visitou o site não ficar com um CSS antigo.

## Publicação

O site é publicado pelo AWS Amplify (app `site-korza`, `d2pee4yt8thxba`, conta de produção, região us-east-2) em https://korza.com.br e https://www.korza.com.br. Cada push na branch `main` dispara um deploy automático pela integração do Amplify com o GitHub; não há etapa de build, e a raiz do repositório é publicada como está.

Para acompanhar os deploys, abra o app no console do Amplify (us-east-2). A URL direta da branch, sem o domínio, é https://main.d2pee4yt8thxba.amplifyapp.com.

Os botões de login e cadastro apontam para a plataforma da Korza. As imagens e marcas presentes foram fornecidas para o site; confirme os direitos de uso antes de redistribuí-las fora desse contexto.
