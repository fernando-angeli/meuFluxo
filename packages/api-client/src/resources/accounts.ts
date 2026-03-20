import type { Account, AccountType, PageQueryParams, PageResponse } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type AccountCreateRequest = {
  name: string;
  accountType: AccountType;
  initialBalance: number;
};

export type AccountUpdateRequest = {
  name: string;
  active?: boolean | null;
};

export type AccountsListParams = Partial<Omit<PageQueryParams, "page" | "size">> & {
  page?: number;
  size?: number;
  sort?: string;
};

export type AccountsApi = {
  list: (params?: AccountsListParams) => Promise<PageResponse<Account>>;
  getById: (id: string) => Promise<Account>;
  create: (request: AccountCreateRequest) => Promise<Account>;
  update: (id: string, request: AccountUpdateRequest) => Promise<Account>;
  deleteById: (id: string) => Promise<void>;
};

export function createAccountsApi(http: HttpClient): AccountsApi {
  return {
    list: (params) =>
      http.request<PageResponse<Account>>("/accounts", {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
        } as Record<string, string | number | boolean | null | undefined>,
      }),
    getById: (id) => http.request<Account>(`/accounts/${encodeURIComponent(id)}`, { method: "GET" }),
    create: (request) =>
      http.request<Account>("/accounts", {
        method: "POST",
        body: request,
      }),
    update: (id, request) =>
      http.request<Account>(`/accounts/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: request,
      }),
    deleteById: (id) => http.request<void>(`/accounts/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
