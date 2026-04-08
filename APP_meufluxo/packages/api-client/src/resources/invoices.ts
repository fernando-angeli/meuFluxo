import type {
  CreditCardInvoiceDetails,
  CreditCardInvoiceListItem,
  CreditCardInvoicePayment,
  PageQueryParams,
  PageResponse,
} from "@meufluxo/types";

import type { HttpClient } from "../http";

export type InvoicesApi = {
  list: (params?: InvoicesListParams) => Promise<PageResponse<CreditCardInvoiceListItem>>;
  getById: (id: string) => Promise<CreditCardInvoiceListItem>;
  getDetails: (id: string) => Promise<CreditCardInvoiceDetails>;
  listPayments: (
    params?: InvoicePaymentsListParams,
  ) => Promise<PageResponse<CreditCardInvoicePayment>>;
  createPayment: (body: InvoiceCreatePaymentRequest) => Promise<CreditCardInvoicePayment>;
};

export type InvoicesListParams = Partial<Omit<PageQueryParams, "page" | "size">> & {
  page?: number;
  size?: number;
  sort?: string;
  creditCardId?: string;
  status?: string;
  referenceYear?: number;
  referenceMonth?: number;
  dueDateStart?: string;
  dueDateEnd?: string;
};

export type InvoicePaymentsListParams = Partial<Omit<PageQueryParams, "page" | "size">> & {
  page?: number;
  size?: number;
  sort?: string;
  invoiceId?: string;
  accountId?: string;
  paymentDateStart?: string;
  paymentDateEnd?: string;
};

export type InvoiceCreatePaymentRequest = {
  invoiceId: number;
  accountId: number;
  paymentDate: string;
  amount: number;
  notes?: string | null;
};

export function createInvoicesApi(http: HttpClient): InvoicesApi {
  return {
    list: (params) =>
      http.request<PageResponse<CreditCardInvoiceListItem>>("/credit-card-invoices", {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.creditCardId ? { creditCardId: params.creditCardId } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.referenceYear !== undefined
            ? { referenceYear: params.referenceYear }
            : {}),
          ...(params?.referenceMonth !== undefined
            ? { referenceMonth: params.referenceMonth }
            : {}),
          ...(params?.dueDateStart ? { dueDateStart: params.dueDateStart } : {}),
          ...(params?.dueDateEnd ? { dueDateEnd: params.dueDateEnd } : {}),
        } as Record<string, string | number | boolean | null | undefined>,
      }),
    getById: (id) =>
      http.request<CreditCardInvoiceListItem>(
        `/credit-card-invoices/${encodeURIComponent(id)}`,
        {
          method: "GET",
        },
      ),
    getDetails: (id) =>
      http.request<CreditCardInvoiceDetails>(
        `/credit-card-invoices/${encodeURIComponent(id)}/details`,
        {
          method: "GET",
        },
      ),
    listPayments: (params) =>
      http.request<PageResponse<CreditCardInvoicePayment>>(
        "/credit-card-invoice-payments",
        {
          method: "GET",
          query: {
            ...(params?.page !== undefined ? { page: params.page } : {}),
            ...(params?.size !== undefined ? { size: params.size } : {}),
            ...(params?.sort ? { sort: params.sort } : {}),
            ...(params?.invoiceId ? { invoiceId: params.invoiceId } : {}),
            ...(params?.accountId ? { accountId: params.accountId } : {}),
            ...(params?.paymentDateStart
              ? { paymentDateStart: params.paymentDateStart }
              : {}),
            ...(params?.paymentDateEnd ? { paymentDateEnd: params.paymentDateEnd } : {}),
          } as Record<string, string | number | boolean | null | undefined>,
        },
      ),
    createPayment: (body) =>
      http.request<CreditCardInvoicePayment>("/credit-card-invoice-payments", {
        method: "POST",
        body,
      }),
  };
}
