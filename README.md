# meuFluxo

Projeto fullstack para gestão de fluxo financeiro, com backend em Spring Boot e frontend em monorepo JavaScript/TypeScript.

## Objetivo do projeto

O meuFluxo foi construído para evoluir como produto e como base técnica, priorizando:

- arquitetura com responsabilidades bem definidas
- regras de negócio centralizadas em serviços
- contratos explícitos entre frontend e backend
- versionamento de banco com migrations
- experiência consistente de listagem, cadastro e revisão de lançamentos

## Estrutura do repositório

```text
meuFluxo/
├── APP_meufluxo/   # Frontend (monorepo: web + mobile + pacotes compartilhados)
└── API_meufluxo/   # Backend (Spring Boot + PostgreSQL + Flyway)
```

## Stack principal

- **Frontend:** Turborepo, pnpm workspaces, Next.js (web), Tailwind, React Query, Zod, Radix UI
- **Backend:** Java 25, Spring Boot 4, Spring Data JPA, PostgreSQL, Flyway, Docker Compose
- **Pacotes compartilhados (APP):** `api-client`, `types`, `utils`, `config`

## Estado atual do projeto

- backend com domínio financeiro principal e filtros paginados/sortáveis
- frontend web em operação com listagens, filtros, modais de cadastro/edição e revisão de lançamentos recorrentes
- app mobile ainda em base inicial no monorepo

## Como começar

1. Clone o repositório e entre na pasta:

```bash
git clone <url-do-repo>
cd meuFluxo
```

2. Siga o README do subprojeto que deseja executar:

- Frontend: [`APP_meufluxo/README.md`](APP_meufluxo/README.md)
- Backend: [`API_meufluxo/README.md`](API_meufluxo/README.md)

## Links rápidos

- Frontend monorepo: [`APP_meufluxo`](APP_meufluxo)
- Backend API: [`API_meufluxo`](API_meufluxo)

## Roadmap resumido

- consolidar integração de fluxo de preparação/revisão frontend com ajustes automáticos
- ampliar cobertura de testes automatizados (frontend e backend)
- evoluir autenticação/autorização e governança de multi-workspace
- maturar o app mobile a partir da base existente
