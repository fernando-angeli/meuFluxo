# 🚀 MeuFluxo API

API REST para controle de fluxo de caixa, desenvolvida com **Spring Boot**, **Java 25**, **PostgreSQL**, **Flyway** e executada totalmente via **Docker Compose**.

---

## 🧱 Arquitetura

O projeto segue arquitetura em camadas:

```
controller → service → repository → database
```

* **Controller** → expõe endpoints REST
* **Service** → regras de negócio
* **Repository** → acesso a dados com Spring Data JPA
* **Database** → PostgreSQL

---

## 🛠️ Tecnologias Utilizadas

* Java 25
* Spring Boot
* Spring Data JPA
* Hibernate
* PostgreSQL
* Flyway (migrations)
* Docker
* Docker Compose

---

## 🔐 Transações

Todas as operações críticas utilizam:

```java
@Transactional
@Transactional(readOnly=true)
```

Garantindo consistência de dados.

---

# ⚙️ Profiles

O projeto possui dois perfis:

- dev → Hibernate controla o schema
- prod → Flyway controla o schema

---

# 🗄️ Banco de Dados

Banco utilizado: **PostgreSQL**

---

## 📦 Estrutura Principal (implementada)

* `accounts`
* `categories`
* `cash_movements`

---

## 🔗 Relacionamentos

* `CashMovement` → ManyToOne → `Account`
* `CashMovement` → ManyToOne → `Category`

---

# 🧬 Versionamento com Flyway

O schema do banco é controlado por **migrations**.

### 📂 Localização

```
src/main/resources/db/migration
```

### 📌 Padrão de nomenclatura

```
V1__create_accounts.sql
V2__create_categories.sql
V3__create_cash_movements.sql
V4__insert_default_adjustment_categories.sql
```

No profile `prod`, o Flyway é executado automaticamente no startup.
No profile `dev`, o Hibernate controla o schema (ddl-auto=update).

---

# 📄 Paginação

As buscas utilizam paginação com Spring Data:

```java
Page<CashMovement> findByAccountId(Long accountId, Pageable pageable);
```

O `Pageable` é fornecido pelo Spring Data e o retorno é um `Page<T>`.

Exemplo de requisição:

```
GET /cash-movements?page=0&size=10&sort=date,desc
```

---

# 🐳 Executando com Docker Compose

O projeto já está configurado para subir automaticamente 
- API + Banco (modo Produção)
- Banco (modo desenvolvimento)

## 📌 Pré-requisitos

* Docker instalado
* Docker Compose instalado

---

## ▶️ Subindo o projeto

Na raiz do projeto:

### Modo PRODUÇÃO (prod)

```bash
docker compose --profile prod up -d --build
```

Isso irá:

* Subir o PostgreSQL
* Buildar a aplicação
* Executar migrations do Flyway
* Disponibilizar a API

### Modo DESENVOLVIMENTO (dev)

```bash
docker compose --profile dev up -d
```

Isso irá:

* Subir o PostgreSQL
* Hibernate criará as tabelas
* Deixará o banco pronto e disponível (com as entidades criadas)

> Após o banco ficar ON, subir a aplicação através da IDE (configurar para usar profile "dev") 
  
---

## 🛑 Parando os containers

```bash
docker compose --profile dev down

docker compose --profile prod down
```

---

# 🌍 Acesso

Após subir os containers:

```
API: http://localhost:8080
PostgreSQL: localhost:5432
```

---

# 📬 Exemplos de Endpoints

## Criar conta

```
POST /accounts
```

## Listar contas

```
GET /accounts
```

## Criar movimentação

```
POST /cash-movements

{
  "amount": 150.00,
  "paymentMethod": "PIX",
  "categoryId": 3,
  "accountId": 1,
  "occurredAt": "2026-02-19",
  "description": "Salário Fevereiro"
}
```

## Listar movimentações (paginado)

```
GET /cash-movement?accountId=1?page=0&size=10

{
    "content": [
        {
            "id": 1,
            "description": "Salário Fevereiro",
            "paymentMethod": "PIX",
            "amount": 100.00,
            "occurredAt": "2026-02-19",
            "referenceMonth": "02/2026",
            "movementType": "INCOME",
            "account": {
                "id": 1,
                "name": "Conta corrente Banco X",
                "currentBalance": 100.00
            },
            "category": {
                "id": 3,
                "name": "Salário mensal"
            },
            "meta": {
                "createdAt": "2026-02-19T18:29:07.855522",
                "updatedAt": "2026-02-19T18:29:07.855528",
                "active": true
            }
        }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
}
```

---

# 📌 Estrutura do Projeto

```
API_meufluxo
 ├── src
 │   ├── main
 │   │   ├── java
 │   │       ├── common
 │   │       ├── config
 │   │       ├── controller
 │   │       ├── dto
 │   │       ├── enums
 │   │       ├── mapper
 │   │       ├── model
 │   │       ├── repository
 │   │       ├── service
 │   │       └── MeufluxoApplication 
 │   │   └── resources
 │   │       └── db/migration
 ├── Dockerfile
 ├── docker-compose.yml
 └── pom.xml
```

---

# 🧠 Regras de Negócio

- Não permite excluir categoria com movimentações vinculadas
- Atualiza saldo da conta automaticamente ao criar movimentação
- Permite inativação lógica (soft delete)
- Controle mensal via referenceMonth

---

# 📈 Próximas Melhorias

* Autenticação com JWT
* Testes unitários
* Testes de integração
* Documentação com Swagger
* CI/CD

---

# 👨‍💻 Autor

Luiz Fernando Angeli
