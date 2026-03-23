import type { Account, AccountDetails, AccountId, AccountType, PageQueryParams, PageResponse } from "@meufluxo/types";

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
  getById: (id: AccountId) => Promise<AccountDetails>;
  create: (request: AccountCreateRequest) => Promise<Account>;
  update: (id: AccountId, request: AccountUpdateRequest) => Promise<Account>;
  deleteById: (id: AccountId) => Promise<void>;
};

const ACCOUNTS_BASE_PATH = "/accounts";

function buildAccountByIdPath(id: AccountId): string {
  return `${ACCOUNTS_BASE_PATH}/${encodeURIComponent(String(id))}`;
}

export function createAccountsApi(http: HttpClient): AccountsApi {
  return {
    list: (params) =>
      http.request<PageResponse<Account>>(ACCOUNTS_BASE_PATH, {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
        } as Record<string, string | number | boolean | null | undefined>,
      }),
    getById: (id) => http.request<AccountDetails>(buildAccountByIdPath(id), { method: "GET" }),
    create: (request) =>
      http.request<Account>(ACCOUNTS_BASE_PATH, {
        method: "POST",
        body: request,
      }),
    update: (id, request) =>
      http.request<Account>(buildAccountByIdPath(id), {
        method: "PATCH",
        body: request,
      }),
    deleteById: (id) => http.request<void>(buildAccountByIdPath(id), { method: "DELETE" }),
  };
}
