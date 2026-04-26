import type {
  Invoice,
  InvoiceChargesUpdateRequest,
  InvoiceDetails,
  InvoicePaymentCreateRequest,
  PageQueryParams,
  PageResponse,
} from "@meufluxo/types";

import type { HttpClient } from "../http";

export type InvoicesListParams = Partial<Omit<PageQueryParams, "page" | "size">> & {
  page?: number;
  size?: number;
  sort?: string;
  creditCardId?: string;
  status?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
};

export type InvoicesApi = {
  list: (params?: InvoicesListParams) => Promise<PageResponse<Invoice>>;
  getById: (id: string) => Promise<InvoiceDetails>;
  close: (id: string) => Promise<InvoiceDetails>;
  reopen: (id: string) => Promise<InvoiceDetails>;
  createPayment: (id: string, request: InvoicePaymentCreateRequest) => Promise<InvoiceDetails>;
  deletePaymentById: (paymentId: string) => Promise<void>;
  updateCharges: (id: string, request: InvoiceChargesUpdateRequest) => Promise<InvoiceDetails>;
};

const INVOICES_BASE_PATH = "/credit-card-invoices";

export function createInvoicesApi(http: HttpClient): InvoicesApi {
  return {
    list: (params) =>
      http.request<PageResponse<Invoice>>(INVOICES_BASE_PATH, {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.creditCardId ? { creditCardId: params.creditCardId } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.dueDateStart ? { dueDateStart: params.dueDateStart } : {}),
          ...(params?.dueDateEnd ? { dueDateEnd: params.dueDateEnd } : {}),
        } as Record<string, string | number | boolean | null | undefined>,
      }),
    getById: (id) =>
      http.request<InvoiceDetails>(`${INVOICES_BASE_PATH}/${encodeURIComponent(id)}/details`, {
        method: "GET",
      }),
    close: (id) =>
      http.request<InvoiceDetails>(`${INVOICES_BASE_PATH}/${encodeURIComponent(id)}/close`, {
        method: "PATCH",
      }),
    reopen: (id) =>
      http.request<InvoiceDetails>(`${INVOICES_BASE_PATH}/${encodeURIComponent(id)}/reopen`, {
        method: "PATCH",
      }),
    createPayment: (id, request) =>
      http.request<InvoiceDetails>(`${INVOICES_BASE_PATH}/${encodeURIComponent(id)}/payments`, {
        method: "POST",
        body: request,
      }),
    deletePaymentById: (paymentId) =>
      http.request<void>(`/credit-card-invoice-payments/${encodeURIComponent(paymentId)}`, {
        method: "DELETE",
      }),
    updateCharges: (id, request) =>
      http.request<InvoiceDetails>(`${INVOICES_BASE_PATH}/${encodeURIComponent(id)}/charges`, {
        method: "PATCH",
        body: request,
      }),
  };
}
