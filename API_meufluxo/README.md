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
V1__create_tables.sql
V2__add_indexes.sql
V3__insert_default_categories.sql
```

Ao subir o container, o Flyway executa automaticamente as migrations pendentes.

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

O projeto já está configurado para subir automaticamente API + Banco.

## 📌 Pré-requisitos

* Docker instalado
* Docker Compose instalado

---

## ▶️ Subindo o projeto

Na raiz do projeto:

```bash
docker-compose up --build
```

Isso irá:

* Subir o PostgreSQL
* Buildar a aplicação
* Executar migrations do Flyway
* Disponibilizar a API

---

## 🛑 Parando os containers

```bash
docker-compose down
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
```

## Listar movimentações (paginado)

```
GET /cash-movements?page=0&size=10
```

---

# 📌 Estrutura do Projeto

```
API_meufluxo
 ├── src
 │   ├── main
 │   │   ├── java
 │   │   └── resources
 │   │       └── db/migration
 ├── Dockerfile
 ├── docker-compose.yml
 └── pom.xml
```

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
