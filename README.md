# 📊 meuFluxo

O **meuFluxo** é uma aplicação fullstack de controle de fluxo de caixa desenvolvida com foco em **engenharia backend utilizando Java e Spring Boot**, organização arquitetural e boas práticas aplicadas em ambientes corporativos.

Embora possua frontend próprio, o núcleo do projeto está na construção de um backend consistente, escalável e preparado para evolução.

---

## 🎯 Objetivo Técnico

O projeto foi concebido para demonstrar:

- Arquitetura em camadas bem definida  
- Separação clara de responsabilidades  
- Centralização de regras de negócio na camada de serviço  
- Controle transacional explícito  
- Versionamento de banco de dados com migrations  
- API REST desacoplada  

Mais do que um CRUD financeiro, o meuFluxo foi estruturado como base sólida para crescimento contínuo e aplicação de padrões reais de mercado.

---

## 🏗 Arquitetura Geral

O projeto é dividido em duas aplicações independentes:

meuFluxo
├── api/ → Backend (Spring Boot)
└── app/ → Frontend (Vue 3 + TypeScript)


Essa separação permite:

- Evolução independente das camadas  
- Melhor organização estrutural  
- Possibilidade futura de migração para microsserviços  
- Escalabilidade horizontal  

---

## 🔹 Backend (API)

A API concentra o núcleo do sistema:

- Regras de negócio  
- Controle transacional  
- Persistência e modelagem de dados  
- Versionamento do banco via Flyway  
- Exposição de endpoints REST  

### Arquitetura em camadas
controller → service → repository → database


### Responsabilidades por camada

**Controller**
- Exposição de endpoints REST  
- Recebimento de requisições  
- Retorno de respostas padronizadas  
- Sem regra de negócio  

**Service**
- Centralização das regras de negócio  
- Aplicação de impactos financeiros  
- Orquestração entre serviços  
- Controle transacional  
- Tratamento de atualizações parciais  

**Repository**
- Persistência via Spring Data JPA  
- Abstração do acesso ao banco  
- Foco exclusivo em operações de dados  

---

## 🗄 Banco de Dados

- PostgreSQL  
- Versionamento estruturado com Flyway  
- Scripts de migração controlados  
- `ddl-auto` desabilitado para manter controle explícito do schema  

O banco é tratado como parte controlada da aplicação, evitando dependência implícita do ORM para evolução estrutural.

---

## 🔎 Decisões Arquiteturais

- Uso de DTOs para evitar exposição direta de entidades  
- Separação clara entre entidade e contrato externo  
- Regras de negócio centralizadas na camada de serviço  
- Uso de `BigDecimal` para operações financeiras  
- Atualizações parciais controladas explicitamente  
- Estrutura preparada para autenticação e multiusuário  

---

## 🧠 Evolução Planejada

A estrutura atual permite evoluir naturalmente para:

- Autenticação com JWT  
- Controle por usuário  
- Testes unitários e de integração  
- Logs estruturados  
- Observabilidade  
- Arquitetura orientada a eventos  
- Transição futura para microsserviços  

---

## 👨‍💻 Posicionamento Técnico

O meuFluxo demonstra:

- Domínio de Java aplicado em arquitetura real  
- Uso estruturado do ecossistema Spring  
- Organização de código voltada à manutenção e escalabilidade  
- Mentalidade backend-first mesmo em um projeto fullstack  

É um projeto pessoal desenvolvido com mentalidade de ambiente corporativo, focado em qualidade estrutural e evolução contínua.
