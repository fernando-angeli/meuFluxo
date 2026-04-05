import type {
  ExpenseRecord,
  ExpenseBatchCreateRequest,
  ExpenseBatchCreateResponse,
  ExpenseBatchPreviewRequest,
  ExpenseBatchPreviewResponse,
  ExpenseCreateRequest,
  ExpenseCreateResponse,
  ExpenseSettleRequest,
  ExpenseUpdateRequest,
  PageQueryParams,
  PageResponse,
  PlannedEntryStatus,
} from "@meufluxo/types";

import type { HttpClient } from "../http";

export type ExpensesApi = {
  list: (params?: ExpensesListParams) => Promise<PageResponse<ExpenseRecord>>;
  createSingle: (request: ExpenseCreateRequest) => Promise<ExpenseCreateResponse>;
  update: (id: string, request: ExpenseUpdateRequest) => Promise<ExpenseCreateResponse>;
  previewBatch: (
    request: ExpenseBatchPreviewRequest,
  ) => Promise<ExpenseBatchPreviewResponse>;
  createBatch: (
    request: ExpenseBatchCreateRequest,
  ) => Promise<ExpenseBatchCreateResponse>;
  cancel: (id: string) => Promise<ExpenseRecord>;
  settle: (id: string, request: ExpenseSettleRequest) => Promise<ExpenseRecord>;
};

export type ExpensesListParams = Partial<Omit<PageQueryParams, "page" | "size">> & {
  page?: number;
  size?: number;
  sort?: string;
  status?: PlannedEntryStatus;
  issueDateStart?: string;
  issueDateEnd?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  categoryId?: number;
  subCategoryId?: number;
};

export function createPlannedEntriesApi(
  http: HttpClient,
  basePath: string,
): ExpensesApi {
  return {
    list: (params) =>
      http.request<PageResponse<ExpenseRecord>>(basePath, {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.issueDateStart ? { issueDateStart: params.issueDateStart } : {}),
          ...(params?.issueDateEnd ? { issueDateEnd: params.issueDateEnd } : {}),
          ...(params?.dueDateStart ? { dueDateStart: params.dueDateStart } : {}),
          ...(params?.dueDateEnd ? { dueDateEnd: params.dueDateEnd } : {}),
          ...(params?.categoryId != null ? { categoryId: params.categoryId } : {}),
          ...(params?.subCategoryId != null ? { subCategoryId: params.subCategoryId } : {}),
        },
      }),
    createSingle: (request) =>
      http.request<ExpenseCreateResponse>(basePath, {
        method: "POST",
        body: request,
      }),
    update: (id, request) =>
      http.request<ExpenseCreateResponse>(`${basePath}/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: request,
      }),
    previewBatch: (request) =>
      http.request<ExpenseBatchPreviewResponse>(`${basePath}/batch/preview`, {
        method: "POST",
        body: request,
      }),
    createBatch: (request) =>
      http.request<ExpenseBatchCreateResponse>(`${basePath}/batch`, {
        method: "POST",
        body: request,
      }),
    cancel: (id) =>
      http.request<ExpenseRecord>(`${basePath}/${encodeURIComponent(id)}/cancel`, {
        method: "PATCH",
      }),
    settle: (id, request) =>
      http.request<ExpenseRecord>(`${basePath}/${encodeURIComponent(id)}/settle`, {
        method: "PATCH",
        body: request,
      }),
  };
}

export function createExpensesApi(http: HttpClient): ExpensesApi {
  return createPlannedEntriesApi(http, "/expenses");
}
