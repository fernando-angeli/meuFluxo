import type { AuthenticatedUserSessionResponse } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type UsersApi = {
  /** Fonte única de verdade da sessão autenticada. */
  me: () => Promise<AuthenticatedUserSessionResponse>;
};

export function createUsersApi(http: HttpClient): UsersApi {
  return {
    me: () =>
      http.request<AuthenticatedUserSessionResponse>("/users/me", {
        method: "GET",
      }),
  };
}
