# APP_meufluxo

Monorepo de frontend do meuFluxo. O foco atual está no app web, com base preparada para compartilhamento de código e evolução mobile.

## Visão geral

Este diretório concentra:

- aplicação web principal em Next.js
- estrutura inicial para mobile
- pacotes compartilhados de contrato, cliente HTTP e utilitários

## Stack

- Turborepo + pnpm workspaces
- Next.js 16 (App Router) + React 19
- Tailwind CSS + componentes base com Radix UI
- React Hook Form + Zod
- TanStack React Query
- TypeScript, ESLint e Prettier

## Estrutura do monorepo

```text
APP_meufluxo/
├── apps/
│   ├── web/       # app principal (produção atual)
│   └── mobile/    # base inicial (ainda não operacional)
└── packages/
    ├── api-client/ # cliente HTTP tipado para a API
    ├── types/      # tipos compartilhados entre apps
    ├── utils/      # utilitários compartilhados (ex.: moeda, datas)
    └── config/     # configurações reutilizáveis
```

## Pré-requisitos

- Node.js 20+
- pnpm 9+

## Instalação

```bash
cd APP_meufluxo
pnpm install
```

## Execução

### Rodar frontend web (recomendado)

```bash
pnpm dev:web
```

ou, para rodar todos os apps do monorepo (quando aplicável):

```bash
pnpm dev
```

### Mobile

Atualmente o `apps/mobile` está em estado inicial. O script disponível hoje é apenas:

```bash
pnpm --filter mobile typecheck
```

## Scripts principais (raiz do monorepo)

- `pnpm dev` — inicia ambientes em modo desenvolvimento via Turbo
- `pnpm dev:web` — inicia somente o app web
- `pnpm build` — build do monorepo
- `pnpm lint` — lint dos workspaces
- `pnpm typecheck` — checagem de tipos
- `pnpm format` / `pnpm format:check` — formatação com Prettier
- `pnpm clean` — limpeza de cache/artefatos do monorepo

## Convenções do monorepo

- contratos e tipos compartilhados devem ficar em `packages/types`
- chamadas HTTP tipadas devem passar por `packages/api-client`
- regras utilitárias reutilizáveis devem ficar em `packages/utils`
- mudanças de UI devem priorizar consistência com os componentes já usados em `apps/web`

## Estado atual do frontend

- app web ativo com fluxo principal de listagem e cadastro de despesas/receitas
- componentes reutilizáveis de tabela, paginação, filtros e formulários em evolução contínua
- base mobile existente, ainda sem fluxo funcional completo

## Próximos passos

- ampliar cobertura de testes no app web
- consolidar documentação de componentes compartilhados
- evoluir `apps/mobile` para fluxo funcional mínimo

