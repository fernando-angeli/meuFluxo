# MeuFluxo API

API REST para controle financeiro, construída com Spring Boot, Java 25, PostgreSQL e Docker.

## Estado Atual do Projeto

### Implementado
- Arquitetura em camadas: `controller -> service -> repository -> database`
- Multi-tenant por workspace:
  - Entidades de domínio com `workspace_id`
  - Validação de acesso por workspace nos serviços e repositórios
- Auditoria de dados:
  - `createdAt`, `updatedAt`
  - `createdByUserId`, `updatedByUserId` (Spring Data Auditing)
- Fluxo financeiro principal:
  - Contas
  - Categorias e subcategorias
  - Movimentações de caixa
- KPI de dashboard:
  - Filtros por lista (`accountIds`, `categoryIds`, `subCategoryIds`)
  - `expensesByCategory` e `incomesByCategory` separados
  - `movementType` no agrupamento por categoria
- Observabilidade:
  - Logs JSON estruturados
  - Correlação via MDC (`requestId`, `userId`, `workspaceId`)
  - Stack com Loki + Promtail + Grafana

### Banco e Migrations
- Flyway versionado em `src/main/resources/db/migration`
- Migrations atuais:
  - `V1__create_accounts.sql`
  - `V2__create_categories.sql`
  - `V3__create_cash_movements.sql`
  - `V4__insert_dafault_adjustment_categories.sql`
  - `V5__workspace_and_audit_on_core_tables.sql`
  - `V6__create_remaining_financial_tables.sql`
- Produção configurada para executar Flyway no startup (`application-prod.yml`)

## Tecnologias
- Java 25
- Spring Boot
- Spring Data JPA / Hibernate
- PostgreSQL
- Flyway
- Kafka
- Docker / Docker Compose
- Grafana Loki / Promtail / Grafana

## Profiles
- `dev`
  - `ddl-auto=update`
  - voltado para desenvolvimento local
- `prod`
  - `ddl-auto=none`
  - schema controlado por Flyway

## Como Executar

### Atalhos com Makefile
Se preferir, use os atalhos do `Makefile` para evitar comandos longos de `docker compose`:

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

Para listar todos os alvos:
```bash
make help
```

> No Windows, você pode usar `make` via Git Bash, WSL ou instalar com Chocolatey/Scoop.

### Atalhos com PowerShell (Windows)
Alternativa sem `make`, usando script:

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

Para ajuda:
```powershell
.\scripts\docker.ps1 help
```

### 1) Desenvolvimento em container (API + banco + Kafka)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile dev up -d
```

Esse comando sobe:
- `api_dev` (Spring Boot via `mvn spring-boot:run` dentro do container)
- `meufluxo_db_dev` (PostgreSQL)
- `kafka` e `kafka_ui`

Para acompanhar logs da API:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f api_dev
```

### 2) Produção (API + banco)
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d --build
```

### 3) Observabilidade (Loki/Promtail/Grafana)
```bash
docker compose --profile obs up -d
```

Para subir tudo (produção + observabilidade):
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod --profile obs up -d --build
```

## Endpoints úteis
- Swagger: `http://localhost:8080/api/swagger-ui.html`
- Actuator health: `http://localhost:8080/api/actuator/health`
- Grafana: `http://localhost:3000` (default: `admin/admin`)
- Loki API: `http://localhost:3100`
- Kafka UI: `http://localhost:8088`

## Exemplo de KPI (filtros por array)
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

## Roadmap (Próximas Implementações)
- Autenticação/autorização com JWT e seleção real de workspace por login
- Testes unitários e de integração (service + repository + controller)
- Hardening de produção:
  - Flyway habilitado também em ambiente de homologação
  - estratégia de rollback e backup automatizado
- Observabilidade avançada:
  - dashboards prontos de negócio e performance
  - alertas no Grafana
- Melhorias de API:
  - padronização final de DTOs (`types` -> `movementType`)
  - validações mais estritas para parâmetros legados

## Autor
Luiz Fernando Angeli
