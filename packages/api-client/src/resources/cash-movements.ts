import type { CashMovement } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type CashMovementsListParams = {
  accountId?: string;
  categoryId?: string;
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
};

export type CashMovementsApi = {
  list: (params?: CashMovementsListParams) => Promise<CashMovement[]>;
  getById: (id: string) => Promise<CashMovement>;
  create: (body: Omit<CashMovement, "id" | "workspaceId" | "createdAt" | "updatedAt">) => Promise<CashMovement>;
  update: (id: string, body: Partial<CashMovement>) => Promise<CashMovement>;
  delete: (id: string) => Promise<void>;
};

export function createCashMovementsApi(http: HttpClient): CashMovementsApi {
  return {
    list: (params) =>
      http.request<CashMovement[]>("/cash-movements", { method: "GET", query: params as Record<string, string | number> }),
    getById: (id) =>
      http.request<CashMovement>(`/cash-movements/${encodeURIComponent(id)}`, { method: "GET" }),
    create: (body) =>
      http.request<CashMovement>("/cash-movements", { method: "POST", body }),
    update: (id, body) =>
      http.request<CashMovement>(`/cash-movements/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    delete: (id) =>
      http.request<void>(`/cash-movements/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
