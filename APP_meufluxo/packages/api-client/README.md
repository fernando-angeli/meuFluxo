# @meufluxo/api-client

Cliente HTTP e contratos da API MeuFluxo. Organizado por recurso, sem acoplamento a um backend específico.

## Estrutura

- **`http.ts`** — Cliente HTTP centralizado (fetch, base URL, auth header, tratamento de erro de rede).
- **`client.ts`** — Monta a API completa: `createMeuFluxoApi(http)` retorna objeto com um namespace por recurso.
- **`resources/`** — Um arquivo por recurso:
  - `auth` — login, logout, me
  - `workspace` — getCurrent, listUsers
  - `accounts` — list, getById
  - `categories` — list, getById
  - `cash-movements` — list, getById, create, update, delete
  - `scheduled-movements` — list, getById, create, update, delete
  - `credit-cards` — list, getById, create, update, delete
  - `invoices` — list, getById
  - `notifications` — list, markAsRead, markAllAsRead
  - `kpis` — dashboard

Contratos (tipos de request/response) ficam em **`@meufluxo/types`**.

## Uso

No app (ex.: Next.js), crie o cliente uma vez com a base URL e opcionalmente o token:

```ts
import { HttpClient, createMeuFluxoApi } from "@meufluxo/api-client";

const http = new HttpClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
  getAuthToken: () => localStorage.getItem("token"),
});
const api = createMeuFluxoApi(http);

// api.accounts.list(), api.kpis.dashboard(params), etc.
```

No frontend MeuFluxo, os **hooks** em `apps/web/src/hooks/api/` usam esse `api` e, quando `NEXT_PUBLIC_USE_MOCKS=true`, retornam mocks em vez de chamar a API.
