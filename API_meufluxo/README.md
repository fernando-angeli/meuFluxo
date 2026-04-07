# API_meufluxo

API REST do meuFluxo para gestão financeira, com foco em domínio de negócio, consistência transacional e evolução controlada de schema.

## Visão geral

A API centraliza:

- regras de negócio financeiras
- persistência e modelagem de dados
- contratos REST consumidos pelo frontend
- controle de migrations e observabilidade operacional

## Stack

- Java 25
- Spring Boot 4
- Spring Data JPA / Hibernate
- PostgreSQL
- Flyway
- Kafka
- Docker / Docker Compose
- Loki + Promtail + Grafana

## Estado atual

### Já implementado

- arquitetura em camadas (`controller -> service -> repository -> database`)
- multi-tenant por workspace
- auditoria (`createdAt`, `updatedAt`, `createdByUserId`, `updatedByUserId`)
- domínio financeiro principal (contas, categorias/subcategorias, lançamentos)
- KPIs de dashboard com filtros por listas
- logs estruturados e correlação por MDC (`requestId`, `userId`, `workspaceId`)

### Banco e migrations

- controle de schema via Flyway em `src/main/resources/db/migration`
- produção com `ddl-auto=none` e execução de migrations no startup
- migrations versionadas (ex.: `V1` até as versões atuais do projeto)

## Profiles

- `dev`
  - `ddl-auto=update`
  - voltado para desenvolvimento local
- `prod`
  - `ddl-auto=none`
  - schema controlado por Flyway

## Como executar

### 1) Atalhos com Makefile

```bash
make dev-up
make dev-logs
make dev-down
make prod-up
make prod-down
make obs-up
make obs-down
make all-up
make all-down
```

Listar todos os alvos:

```bash
make help
```

> No Windows, você pode usar `make` via Git Bash, WSL ou instalar com Chocolatey/Scoop.

### 2) Atalhos com PowerShell (Windows)

```powershell
.\scripts\docker.ps1 dev-up
.\scripts\docker.ps1 dev-logs
.\scripts\docker.ps1 dev-down
.\scripts\docker.ps1 prod-up
.\scripts\docker.ps1 prod-down
.\scripts\docker.ps1 obs-up
.\scripts\docker.ps1 obs-down
.\scripts\docker.ps1 all-up
.\scripts\docker.ps1 all-down
```

Ajuda:

```powershell
.\scripts\docker.ps1 help
```

### 3) Docker Compose direto

#### Desenvolvimento (API + DB + Kafka)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile dev up -d
```

Logs da API dev:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f api_dev
```

#### Produção (API + DB)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d --build
```

#### Observabilidade (Loki/Promtail/Grafana)

```bash
docker compose --profile obs up -d
```

#### Produção + observabilidade

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod --profile obs up -d --build
```

## Endpoints úteis

- Swagger: `http://localhost:8080/api/swagger-ui.html`
- Actuator health: `http://localhost:8080/api/actuator/health`
- Grafana: `http://localhost:3000` (`admin/admin`)
- Loki API: `http://localhost:3100`
- Kafka UI: `http://localhost:8088`

## Módulo de cartão/fatura

Principais endpoints REST implementados:

- `GET /credit-cards?active=&page=&size=&sort=`
- `POST /credit-cards`
- `PUT /credit-cards/{id}`
- `PATCH /credit-cards/{id}/active`
- `GET /credit-card-invoices?page=&size=&sort=&creditCardId=&status=&referenceYear=&referenceMonth=&dueDateStart=&dueDateEnd=`
- `GET /credit-card-invoices/{id}`
- `GET /credit-card-invoices/{id}/details`
- `POST /credit-card-expenses`
- `GET /credit-card-expenses?page=&size=&sort=&creditCardId=&invoiceId=&categoryId=&subcategoryId=&installmentGroupId=&purchaseDateStart=&purchaseDateEnd=`
- `GET /credit-card-expenses/{id}`
- `PUT /credit-card-expenses/{id}`
- `PATCH /credit-card-expenses/{id}/cancel`
- `POST /credit-card-invoice-payments`
- `GET /credit-card-invoice-payments?page=&size=&sort=&invoiceId=&accountId=&paymentDateStart=&paymentDateEnd=`
- `GET /credit-card-invoice-payments/{id}`

## Exemplo de endpoint KPI

```http
GET /api/kpis/dashboard?startDate=2026-01-01&endDate=2026-01-31&accountIds=1,2&categoryIds=4&subCategoryIds=10,11
```

## Estrutura resumida

- `src/main/java/com/meufluxo/controller`
- `src/main/java/com/meufluxo/service`
- `src/main/java/com/meufluxo/repository`
- `src/main/java/com/meufluxo/model`
- `src/main/resources/db/migration`
- `observability`

## Roadmap resumido

- autenticação/autorização com JWT e seleção real de workspace
- ampliação de testes (unitário, integração e camada web)
- hardening de produção (rollback, backup e processos de release)
- evolução de observabilidade com dashboards e alertas de negócio
- padronizações finais de contratos e validações de API
