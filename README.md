# Site Korza

Site institucional estático da Korza. O projeto contém HTML, CSS, JavaScript e imagens; não precisa de instalação de dependências nem de etapa de build.

## Prévia local

Na pasta do projeto, execute:

```sh
python3 -m http.server 4173
```

Acesse http://localhost:4173.

## Publicação

O site é publicado pelo AWS Amplify (app `site-korza`, `d2pee4yt8thxba`, conta de produção, região us-east-2) em https://korza.app (domínio principal desde 2026-10-27; `www.korza.app`, `korza.com.br` e `www.korza.com.br` redirecionam para ele com 301). Cada push na branch `main` dispara um deploy automático pela integração do Amplify com o GitHub; não há etapa de build, e a raiz do repositório é publicada como está.

Para acompanhar os deploys, abra o app no console do Amplify (us-east-2). A URL direta da branch, sem o domínio, é https://main.d2pee4yt8thxba.amplifyapp.com.

Os botões de login e cadastro apontam para a plataforma da Korza. As imagens e marcas presentes foram fornecidas para o site; confirme os direitos de uso antes de redistribuí-las fora desse contexto.
