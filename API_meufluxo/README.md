# 🚀 MeuFluxo API

API REST para controle de fluxo de caixa, desenvolvida com **Spring
Boot**, **Java 25 (LTS)**, **PostgreSQL**, **Flyway** e executada via
**Docker Compose**.

O projeto foi estruturado com foco em organização arquitetural,
separação de responsabilidades e preparação para evolução contínua.

------------------------------------------------------------------------

## 🧱 Arquitetura

A aplicação segue arquitetura em camadas:

controller → service → repository → database

### 🔹 Responsabilidades por camada

-   **Controller** → expõe endpoints REST e trata requisições/respostas\
-   **Service** → centraliza regras de negócio e controle transacional\
-   **Repository** → acesso a dados com Spring Data JPA\
-   **Database** → PostgreSQL

As regras de negócio são mantidas exclusivamente na camada de serviço,
evitando lógica distribuída nas entidades.

------------------------------------------------------------------------

## 🛠️ Tecnologias Utilizadas

-   Java 25 (LTS)
-   Spring Boot
-   Spring Data JPA
-   Hibernate
-   PostgreSQL
-   Flyway (migrations)
-   Docker
-   Docker Compose

------------------------------------------------------------------------

## 🔐 Transações

Operações críticas utilizam controle transacional explícito:

``` java
@Transactional
```

Garantindo consistência e integridade dos dados.

------------------------------------------------------------------------

## ⚙️ Profiles

O projeto possui dois perfis configurados:

-   **dev** → Hibernate controla o schema (`ddl-auto=update`)
-   **prod** → Flyway controla o schema (migrations versionadas)

Em ambiente de produção, o controle do banco é feito exclusivamente via Flyway.

------------------------------------------------------------------------

## 🗄️ Banco de Dados

Banco utilizado: **PostgreSQL**

O schema é tratado como parte controlada da aplicação, evitando
dependência implícita do ORM para evolução estrutural.

------------------------------------------------------------------------

## 📦 Estrutura Principal (implementada)

-   `accounts`
-   `categories`
-   `cash_movements`

------------------------------------------------------------------------

## 🔗 Relacionamentos

-   `CashMovement` → ManyToOne → `Account`
-   `CashMovement` → ManyToOne → `Category`

------------------------------------------------------------------------

## 🧬 Versionamento com Flyway

O schema do banco é controlado por **migrations versionadas**.

### 📂 Localização

src/main/resources/db/migration

### 📌 Padrão de nomenclatura

V1\_\_create_accounts.sql\
V2\_\_create_categories.sql\
V3\_\_create_cash_movements.sql\
V4\_\_insert_default_adjustment_categories.sql

No profile `prod`, o Flyway é executado automaticamente no startup.

------------------------------------------------------------------------

## 📄 Paginação

As buscas utilizam paginação com Spring Data:

``` java
Page<CashMovement> findByAccountId(Long accountId, Pageable pageable);
```

Exemplo de requisição:

GET /cash-movements?page=0&size=10&sort=occurredAt,desc

------------------------------------------------------------------------

## 🐳 Executando com Docker Compose

### 📌 Pré-requisitos

-   Docker instalado
-   Docker Compose instalado

------------------------------------------------------------------------

## ▶️ Subindo o projeto

### Modo PRODUÇÃO (prod)

``` bash
docker compose --profile prod up -d --build
```

### Modo DESENVOLVIMENTO (dev)

``` bash
docker compose --profile dev up -d
```

Após o banco estar ativo, subir a aplicação via IDE utilizando o profile
`dev`.

------------------------------------------------------------------------

## 🛑 Parando os containers

``` bash
docker compose --profile dev down
docker compose --profile prod down
```

------------------------------------------------------------------------

## 🌍 Acesso

API: http://localhost:8080/api

PostgreSQL: localhost:5432

------------------------------------------------------------------------

## 📬 Exemplos de Endpoints

### Criar conta

POST /accounts

### Listar contas

GET /accounts

### Criar movimentação

POST /cash-movements

``` json
{
  "amount": 150.00,
  "paymentMethod": "PIX",
  "categoryId": 3,
  "accountId": 1,
  "occurredAt": "2026-02-19",
  "description": "Salário Fevereiro"
}
```

### Listar movimentações (paginado)

GET /cash-movements?accountId=1&page=0&size=10

------------------------------------------------------------------------

## 📌 Estrutura do Projeto

api\
├── src\
│ ├── main\
│ │ ├── java\
│ │ ├── common\
│ │ ├── config\
│ │ ├── controller\
│ │ ├── dto\
│ │ ├── enums\
│ │ ├── mapper\
│ │ ├── model\
│ │ ├── repository\
│ │ ├── service\
│ │ └── MeufluxoApplication\
│ │ └── resources\
│ │ └── db/migration\
├── Dockerfile\
├── docker-compose.yml\
└── pom.xml

------------------------------------------------------------------------

## 🧠 Regras de Negócio

-   Não permite excluir categoria com movimentações vinculadas
-   Atualiza saldo da conta automaticamente ao criar movimentação
-   Permite inativação lógica (soft delete)
-   Controle mensal via `referenceMonth`

------------------------------------------------------------------------

## 📈 Próximas Melhorias

-   Autenticação com JWT
-   Testes unitários
-   Testes de integração
-   Documentação com Swagger/OpenAPI
-   CI/CD

------------------------------------------------------------------------

## 👨‍💻 Autor

Luiz Fernando Angeli
