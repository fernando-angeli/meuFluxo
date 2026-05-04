import type { CashMovement, CashMovementApiPageResponse, PageQueryParams } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type CashMovementsListParams = {
  accountId?: number;
  categoryId?: number;
  subCategoryId?: number;
  movementType?: "INCOME" | "EXPENSE";
  paymentMethod?: string;
  page?: number;
  size?: number;
  sort?: string;
  startDate?: string;
  endDate?: string;
};

export type CashMovementsApi = {
  list: (params?: CashMovementsListParams & Partial<PageQueryParams>) => Promise<CashMovementApiPageResponse>;
  getById: (id: string) => Promise<CashMovement>;
  create: (body: Omit<CashMovement, "id" | "workspaceId" | "createdAt" | "updatedAt">) => Promise<CashMovement>;
  update: (id: string, body: Partial<CashMovement>) => Promise<CashMovement>;
  delete: (id: string) => Promise<void>;
};

export function createCashMovementsApi(http: HttpClient): CashMovementsApi {
  return {
    list: (params) =>
      http.request<CashMovementApiPageResponse>("/cash-movement", {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.accountId !== undefined ? { accountId: params.accountId } : {}),
          ...(params?.categoryId !== undefined ? { categoryId: params.categoryId } : {}),
          ...(params?.subCategoryId !== undefined ? { subCategoryId: params.subCategoryId } : {}),
          ...(params?.movementType ? { movementType: params.movementType } : {}),
          ...(params?.paymentMethod ? { paymentMethod: params.paymentMethod } : {}),
          ...(params?.startDate ? { startDate: params.startDate } : {}),
          ...(params?.endDate ? { endDate: params.endDate } : {}),
        },
      }),
    getById: (id) =>
      http.request<CashMovement>(`/cash-movement/${encodeURIComponent(id)}`, { method: "GET" }),
    create: (body) =>
      http.request<CashMovement>("/cash-movement", { method: "POST", body }),
    update: (id, body) =>
      http.request<CashMovement>(`/cash-movement/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    delete: (id) =>
      http.request<void>(`/cash-movement/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
