import type {
  CreditCardExpense,
  CreditCardExpenseCreateRequest,
  CreditCardExpenseUpdateRequest,
  PageQueryParams,
  PageResponse,
} from "@meufluxo/types";

import type { HttpClient } from "../http";

export type CreditCardExpensesListParams = Partial<Omit<PageQueryParams, "page" | "size">> & {
  page?: number;
  size?: number;
  sort?: string;
  creditCardId?: number;
  invoiceId?: number;
  categoryId?: number;
  subCategoryId?: number;
  purchaseDateStart?: string;
  purchaseDateEnd?: string;
};

export type CreditCardExpensesApi = {
  list: (params?: CreditCardExpensesListParams) => Promise<PageResponse<CreditCardExpense>>;
  create: (request: CreditCardExpenseCreateRequest) => Promise<CreditCardExpense>;
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
          ...(params?.creditCardId != null ? { creditCardId: params.creditCardId } : {}),
          ...(params?.invoiceId != null ? { invoiceId: params.invoiceId } : {}),
          ...(params?.categoryId != null ? { categoryId: params.categoryId } : {}),
          ...(params?.subCategoryId != null ? { subCategoryId: params.subCategoryId } : {}),
          ...(params?.purchaseDateStart ? { purchaseDateStart: params.purchaseDateStart } : {}),
          ...(params?.purchaseDateEnd ? { purchaseDateEnd: params.purchaseDateEnd } : {}),
        },
      }),
    create: (request) =>
      http.request<CreditCardExpense>(BASE_PATH, {
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
