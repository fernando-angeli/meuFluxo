import type { BrandCard, CreditCard, CreditCardId, PageQueryParams, PageResponse } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type CreditCardsApi = {
  list: (params?: CreditCardsListParams) => Promise<PageResponse<CreditCard>>;
  getById: (id: CreditCardId) => Promise<CreditCard>;
  create: (body: CreditCardCreateRequest) => Promise<CreditCard>;
  update: (id: CreditCardId, body: CreditCardUpdateRequest) => Promise<CreditCard>;
  updateActive: (id: CreditCardId, body: CreditCardActiveRequest) => Promise<CreditCard>;
};

export type CreditCardsListParams = Partial<Omit<PageQueryParams, "page" | "size">> & {
  page?: number;
  size?: number;
  sort?: string;
  active?: boolean;
};

export type CreditCardCreateRequest = {
  name: string;
  brand: BrandCard;
  closingDay: number;
  dueDay: number;
  creditLimit?: number | null;
  defaultPaymentAccountId?: number | null;
  notes?: string | null;
  active: boolean;
};

export type CreditCardUpdateRequest = CreditCardCreateRequest;

export type CreditCardActiveRequest = {
  active: boolean;
};

export function createCreditCardsApi(http: HttpClient): CreditCardsApi {
  return {
    list: (params) =>
      http.request<PageResponse<CreditCard>>("/credit-cards", {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.active !== undefined ? { active: params.active } : {}),
        } as Record<string, string | number | boolean | null | undefined>,
      }),
    getById: (id) =>
      http.request<CreditCard>(`/credit-cards/${encodeURIComponent(id)}`, { method: "GET" }),
    create: (body) =>
      http.request<CreditCard>("/credit-cards", { method: "POST", body }),
    update: (id, body) =>
      http.request<CreditCard>(`/credit-cards/${encodeURIComponent(id)}`, { method: "PUT", body }),
    updateActive: (id, body) =>
      http.request<CreditCard>(`/credit-cards/${encodeURIComponent(id)}/active`, {
        method: "PATCH",
        body,
      }),
  };
}
