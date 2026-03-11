# APP_meufluxo (Frontend) — Monorepo

Este diretório contém o **monorepo frontend** do meuFluxo, com foco principal no **app web**, mas preparado para **mobile** e compartilhamento de código.

## Stack

- Turborepo + pnpm workspaces
- Web: Next.js (App Router) + Tailwind + shadcn/ui
- Mobile: Expo + React Native (base)
- TypeScript, ESLint, Prettier

## Estrutura

```
APP_meufluxo/
  apps/
    web/
    mobile/
  packages/
    api-client/
    types/
    utils/
    config/
```

