import type { Invoice } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type InvoicesApi = {
  list: (params?: { creditCardId?: string; status?: string }) => Promise<Invoice[]>;
  getById: (id: string) => Promise<Invoice>;
};

export function createInvoicesApi(http: HttpClient): InvoicesApi {
  return {
    list: (params) =>
      http.request<Invoice[]>("/invoices", { method: "GET", query: params as Record<string, string> }),
    getById: (id) =>
      http.request<Invoice>(`/invoices/${encodeURIComponent(id)}`, { method: "GET" }),
  };
}
