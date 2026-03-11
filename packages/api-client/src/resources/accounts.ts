import type { Account } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type AccountsApi = {
  list: () => Promise<Account[]>;
  getById: (id: string) => Promise<Account>;
};

export function createAccountsApi(http: HttpClient): AccountsApi {
  return {
    list: () => http.request<Account[]>("/accounts", { method: "GET" }),
    getById: (id) => http.request<Account>(`/accounts/${encodeURIComponent(id)}`, { method: "GET" }),
  };
}
