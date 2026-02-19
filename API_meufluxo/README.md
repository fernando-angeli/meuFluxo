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
V1__create_accounts.sql
V2__create_categories.sql
V3__create_cash_movements.sql
V4__insert_default_adjustment_categories.sql
```

Ao subir o container (modo produção), o Flyway executa automaticamente as migrations pendentes.

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
docker-compose --profile prod up -d --build
```

Isso irá:

* Subir o PostgreSQL
* Buildar a aplicação
* Executar migrations do Flyway
* Disponibilizar a API

### Modo DESENVOLVIMENTO (dev)

```bash
docker-compose --profile dev up -d
```

Isso irá:

* Subir o PostgreSQL
* Hibernate criará as tabelas
* Deixará o banco pronto e disponível (com as entidades criadas)

> Após o banco ficar ON, subir a aplicação através da IDE (configurar para usar profile "dev") 
  
---

## 🛑 Parando os containers

```bash
docker-compose --profile dev down

docker-compose --profile prod down
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
