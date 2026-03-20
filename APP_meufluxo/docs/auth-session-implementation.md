# Autenticação, sessão e bootstrap do workspace

## BLOCO 1 — Diagnóstico (estado anterior vs novo contrato)

### Como estava

- **Login:** Chamava `api.auth.login` e esperava `token`; em seguida chamava `api.users.me()` que retornava sessão “monolítica” (user + preferences + workspaces + categories + accounts + creditCards + syncState).
- **Tipos:** `LoginResponse` com `token`, `user?`, `expiresAt?`. `AuthenticatedUserSessionResponse` misturava contexto do usuário e dados do workspace.
- **Persistência:** Token em `meufluxo_token`; cache em `meufluxo_session_cache` (objeto único com tudo).
- **API:** `auth.me` (GET `/auth/me`); `users.me` (GET `/users/me`) retornando a sessão completa. Não existia endpoint de bootstrap por workspace.
- **Guards:** Status `authenticated_loading_session`; não havia separação entre “carregar contexto do usuário” e “carregar bootstrap do workspace”.

### O que estava desalinhado com o novo contrato

- **Login:** Backend passa a retornar `accessToken`, `tokenType`, `expiresIn`, `expiresAt`, `user`, `preferences`, `activeWorkspace`, `workspaces` (sem categories/accounts no login).
- **GET /users/me:** Apenas contexto do usuário: `id`, `name`, `email`, `preferences`, `activeWorkspace`, `workspaces` (sem dados operacionais do workspace).
- **Bootstrap:** Novo endpoint `GET /workspaces/{workspaceId}/bootstrap` com `categories`, `subCategories`, `accounts`, `creditCards`, `syncState`.
- **Arquitetura:** Separar claramente “sessão/autenticação/contexto do usuário” e “dados operacionais do workspace”.

### O que foi ajustado

- Tipos alinhados ao backend: `LoginResponse`, `UserContextResponse`, `WorkspaceBootstrapResponse`, `UserContext`, token metadata.
- Persistência única `meufluxo_session`: `auth` (token + metadata), `userContext`, `bootstrap` (por workspace ativo).
- Fluxo de login: salvar token + metadata + userContext do login → aplicar tema → se houver `activeWorkspace`, chamar bootstrap → persistir e redirecionar.
- Restore: validar token (expiresAt) → GET /users/me → atualizar userContext → se houver activeWorkspace, GET bootstrap → atualizar estado e cache.
- Troca de workspace: `setActiveWorkspace(workspaceId)` → carregar `GET /workspaces/{id}/bootstrap` e atualizar estado/cache.
- Guards: aguardar `authenticated_ready` (contexto + bootstrap quando houver workspace).
- HTTP: 401 e 403 disparam callback de limpeza de sessão.

---

## BLOCO 2 — Implementação

### Tipos (`packages/types`)

- **auth.ts:** `LoginRequest`, `UserSummary`, `LoginResponse` (accessToken, tokenType, expiresIn, expiresAt, user, preferences, activeWorkspace, workspaces). Importa `UserPreferences`, `WorkspaceSummary`, `WorkspaceMembership` de session.
- **session.ts:** `UserPreferences`, `WorkspaceSummary`, `WorkspaceMembership`, `SubCategory`, `SyncState` (inclui `subCategoriesVersion`), `EntityMeta`, `UserContextResponse` (GET /users/me), `UserContext` (estado interno com `user` agrupado), `WorkspaceBootstrapResponse` (GET /workspaces/:id/bootstrap).

### API (`packages/api-client`)

- **auth:** `login` (POST /auth/login → LoginResponse), `logout` (POST /auth/logout). Removido `me`.
- **users:** `me` (GET /users/me → UserContextResponse).
- **workspace:** `getCurrent`, `listUsers`, `getBootstrap(workspaceId)` (GET /workspaces/:id/bootstrap → WorkspaceBootstrapResponse).
- **http:** 401 e 403 chamam `onUnauthorized`.

### Persistência (`apps/web/src/lib/session-storage.ts`)

- Chave única: `meufluxo_session`.
- Estrutura: `StoredSession` com `auth` (accessToken, tokenType, expiresIn, expiresAt), `userContext` (UserContext), `bootstrap` (workspaceId + WorkspaceBootstrapResponse ou null).
- Funções: `getStoredSession`, `setStoredSession`, `getStoredToken` (helper), `clearSessionStorage`.

### Session context (`apps/web/src/features/auth`)

- **session-types.ts:** `AuthStatus` (initial, unauthenticated, authenticating, authenticated_loading_workspace, authenticated_ready, auth_error, session_expired), `TokenMeta`, `UserContext`, `WorkspaceBootstrapData`, `SessionState` (authStatus, error, loading, token, userContext, bootstrap).
- **session-context.tsx:**
  - Estado: token (TokenMeta), userContext, bootstrap, authStatus, loading, error.
  - Métodos: `login`, `loadSession`, `refreshUserContext`, `loadWorkspaceBootstrap(workspaceId)`, `logout`, `isTokenExpired`, `clearSession`, `setActiveWorkspace(workspaceId)` (carrega bootstrap do workspace e atualiza activeWorkspace).
  - Login: POST login → salva token + userContext do response → aplica tema (setTheme) → se activeWorkspace chama getBootstrap → persiste e redireciona.
  - Restore: lê cache → se token expirado (expiresAt) limpa e redireciona → GET /users/me → se activeWorkspace chama getBootstrap → persiste e atualiza estado.
  - Compat: `data` = userContext + bootstrap reunidos para filtros/hooks; `status` = authStatus.

### Guards e UI

- **protected-layout.tsx:** Considera loading quando status é initial, authenticating ou authenticated_loading_workspace; redireciona para /login quando unauthenticated, session_expired ou auth_error.
- **auth-layout-redirect.tsx:** Em /login, redireciona para /dashboard se authenticated_ready.
- **login/page.tsx:** loading/disabled durante authenticating e authenticated_loading_workspace; exibe erro quando auth_error.
- **workspace-switcher.tsx:** Lista workspaces de `userContext.workspaces`; ao selecionar chama `setActiveWorkspace(workspaceId)`.

### HTTP e token

- **auth-token.ts:** Ref do accessToken (string) para o HttpClient; ref do callback 401/403.
- **api.ts:** HttpClient com getAuthToken e onUnauthorized (limpa sessão e redireciona).

---

## BLOCO 3 — Resumo final

### Fluxo de login

1. Usuário envia email e senha.
2. Front chama POST /auth/login.
3. Em sucesso: salva accessToken, tokenType, expiresIn, expiresAt; salva userContext (user, preferences, activeWorkspace, workspaces) do response; aplica tema (preferences.theme); se existir activeWorkspace chama GET /workspaces/{id}/bootstrap e salva categories, subCategories, accounts, creditCards, syncState; persiste tudo em `meufluxo_session`; redireciona para /dashboard.
4. Em falha: authStatus = auth_error, exibe mensagem.

### Fluxo de restore de sessão

1. Ao iniciar o app, lê `meufluxo_session`.
2. Se não houver token ou token expirado (expiresAt &lt; now): limpa sessão, authStatus = session_expired, redireciona para /login.
3. Se token válido: hidrata estado com cache (userContext + bootstrap); chama GET /users/me e atualiza userContext; se houver activeWorkspace chama GET /workspaces/{id}/bootstrap e atualiza bootstrap; persiste; authStatus = authenticated_ready.
4. Se GET /users/me ou bootstrap retornar 401/403: limpa sessão e redireciona para /login.

### Token e expiração

- Token e metadata vêm do login (accessToken, tokenType, expiresIn, expiresAt) e são persistidos em `meufluxo_session.auth`.
- `isTokenExpired()` usa `expiresAt` (ISO); se `Date.now() >= new Date(expiresAt).getTime()` considera expirado.
- No restore, se expirado não chama /users/me; limpa e redireciona.
- HttpClient envia Authorization: Bearer {accessToken}; em 401/403 chama callback que limpa sessão e redireciona.

### Bootstrap do workspace

- Carregado após login (se activeWorkspace) e no restore (se activeWorkspace).
- Carregado ao trocar workspace: `setActiveWorkspace(workspaceId)` chama GET /workspaces/{workspaceId}/bootstrap e atualiza estado e cache (bootstrap do workspace ativo).
- Conteúdo: categories, subCategories, accounts, creditCards, syncState.
- Filtros e hooks (useAccounts, useCategories, useCreditCards) usam `session.data` (userContext + bootstrap) quando authenticated_ready.

### Arquivos criados/alterados

| Área | Arquivos |
|------|----------|
| Types | auth.ts, session.ts (UserContextResponse, UserContext, WorkspaceBootstrapResponse, SyncState.subCategoriesVersion, EntityMeta) |
| API | auth.ts, users.ts, workspace.ts (getBootstrap), http.ts (403) |
| Web | session-storage.ts (nova estrutura), auth-token.ts (inalterado), session-types.ts, session-context.tsx, protected-layout.tsx, login/page.tsx, workspace-switcher.tsx, user-menu (já usava session), hooks useAccounts/useCategories/useCreditCards (já usam session.data) |
| i18n | workspace.none em pt-BR, en, es |
