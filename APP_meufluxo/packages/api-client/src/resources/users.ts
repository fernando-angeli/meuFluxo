import type {
  AuthenticatedUserSessionResponse,
  UserPreferencesThemePatchResponse,
  UserThemeApi,
} from "@meufluxo/types";

import type { HttpClient } from "../http";

export type UsersApi = {
  /** Fonte única de verdade da sessão autenticada. */
  me: () => Promise<AuthenticatedUserSessionResponse>;
  /** PATCH `/users/{id}/preferences/theme` — persiste LIGHT | DARK | SYSTEM. */
  patchThemePreference: (
    userId: string | number,
    body: { theme: UserThemeApi },
  ) => Promise<UserPreferencesThemePatchResponse>;
};

export function createUsersApi(http: HttpClient): UsersApi {
  return {
    me: () =>
      http.request<AuthenticatedUserSessionResponse>("/users/me", {
        method: "GET",
      }),
    patchThemePreference: (userId, body) =>
      http.request<UserPreferencesThemePatchResponse>(
        `/users/${encodeURIComponent(String(userId))}/preferences/theme`,
        {
          method: "PATCH",
          body,
        },
      ),
  };
}
