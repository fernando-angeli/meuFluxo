import type { CreditCard } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type CreditCardsApi = {
  list: () => Promise<CreditCard[]>;
  getById: (id: string) => Promise<CreditCard>;
  create: (body: Omit<CreditCard, "id" | "workspaceId" | "createdAt" | "updatedAt">) => Promise<CreditCard>;
  update: (id: string, body: Partial<CreditCard>) => Promise<CreditCard>;
  delete: (id: string) => Promise<void>;
};

export function createCreditCardsApi(http: HttpClient): CreditCardsApi {
  return {
    list: () => http.request<CreditCard[]>("/credit-cards", { method: "GET" }),
    getById: (id) =>
      http.request<CreditCard>(`/credit-cards/${encodeURIComponent(id)}`, { method: "GET" }),
    create: (body) =>
      http.request<CreditCard>("/credit-cards", { method: "POST", body }),
    update: (id, body) =>
      http.request<CreditCard>(`/credit-cards/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    delete: (id) =>
      http.request<void>(`/credit-cards/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
