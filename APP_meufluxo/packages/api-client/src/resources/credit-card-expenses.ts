import type {
  CreditCardExpense,
  CreditCardExpenseCreateRequest,
  CreditCardExpenseCreateResponse,
  CreditCardExpenseListParams,
  CreditCardExpenseUpdateRequest,
  PageResponse,
} from "@meufluxo/types";

import type { HttpClient } from "../http";

export type CreditCardExpensesApi = {
  list: (params?: CreditCardExpenseListParams) => Promise<PageResponse<CreditCardExpense>>;
  getById: (id: string) => Promise<CreditCardExpense>;
  create: (request: CreditCardExpenseCreateRequest) => Promise<CreditCardExpenseCreateResponse>;
  update: (id: string, request: CreditCardExpenseUpdateRequest) => Promise<CreditCardExpense>;
  cancel: (id: string) => Promise<CreditCardExpense>;
};

const BASE_PATH = "/credit-card-expenses";

export function createCreditCardExpensesApi(http: HttpClient): CreditCardExpensesApi {
  return {
    list: (params) =>
      http.request<PageResponse<CreditCardExpense>>(BASE_PATH, {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.creditCardId ? { creditCardId: params.creditCardId } : {}),
          ...(params?.invoiceId ? { invoiceId: params.invoiceId } : {}),
          ...(params?.categoryId != null ? { categoryId: params.categoryId } : {}),
          ...(params?.subcategoryId != null ? { subcategoryId: params.subcategoryId } : {}),
          ...(params?.installmentGroupId
            ? { installmentGroupId: params.installmentGroupId }
            : {}),
          ...(params?.purchaseDateStart
            ? { purchaseDateStart: params.purchaseDateStart }
            : {}),
          ...(params?.purchaseDateEnd ? { purchaseDateEnd: params.purchaseDateEnd } : {}),
        } as Record<string, string | number | boolean | null | undefined>,
      }),
    getById: (id) =>
      http.request<CreditCardExpense>(`${BASE_PATH}/${encodeURIComponent(id)}`, {
        method: "GET",
      }),
    create: (request) =>
      http.request<CreditCardExpenseCreateResponse>(BASE_PATH, {
        method: "POST",
        body: request,
      }),
    update: (id, request) =>
      http.request<CreditCardExpense>(`${BASE_PATH}/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: request,
      }),
    cancel: (id) =>
      http.request<CreditCardExpense>(`${BASE_PATH}/${encodeURIComponent(id)}/cancel`, {
        method: "PATCH",
      }),
  };
}
