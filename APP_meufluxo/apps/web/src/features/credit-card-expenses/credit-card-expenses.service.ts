"use client";

import type { CreditCardExpensesListParams } from "@meufluxo/api-client";
import type {
  CreditCardExpense,
  CreditCardExpenseCreateRequest,
  CreditCardExpenseUpdateRequest,
  PageQueryParams,
  PageResponse,
} from "@meufluxo/types";

import { env } from "@/lib/env";
import { toNumericIdString } from "@/lib/numeric-id";
import { api } from "@/services/api";
import { mockCreditCardExpenses } from "@/services/mocks/credit-card-expenses";

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toStringOrEmpty(value: unknown): string {
  return value == null ? "" : String(value);
}

function toStatus(value: unknown): CreditCardExpense["status"] {
  const status = String(value ?? "").toUpperCase();
  if (status === "OPEN" || status === "INVOICED" || status === "PAID" || status === "CANCELED") {
    return status;
  }
  return "OPEN";
}

function toEntryType(value: unknown): CreditCardExpense["entryType"] {
  const entryType = String(value ?? "").toUpperCase();
  if (entryType === "INSTALLMENT") return "INSTALLMENT";
  return "SINGLE";
}

export function normalizeCreditCardExpenseFromApi(raw: unknown): CreditCardExpense {
  const r = raw as Record<string, unknown>;
  return {
    id: toStringOrEmpty(r.id),
    creditCardId: toStringOrEmpty(r.creditCardId),
    creditCardName: toStringOrEmpty(r.creditCardName) || "—",
    invoiceId: r.invoiceId != null ? String(r.invoiceId) : null,
    invoiceReference: r.invoiceReference != null ? String(r.invoiceReference) : null,
    categoryId: toStringOrEmpty(r.categoryId),
    categoryName: toStringOrEmpty(r.categoryName) || "—",
    subCategoryId: r.subCategoryId != null ? String(r.subCategoryId) : null,
    subCategoryName: r.subCategoryName != null ? String(r.subCategoryName) : null,
    description: toStringOrEmpty(r.description),
    purchaseDate: toStringOrEmpty(r.purchaseDate),
    installmentLabel: r.installmentLabel != null ? String(r.installmentLabel) : null,
    totalAmount: toNumber(r.totalAmount),
    notes: r.notes != null ? String(r.notes) : null,
    entryType: toEntryType(r.entryType),
    installmentCount: Math.max(1, toNumber(r.installmentCount) || 1),
    status: toStatus(r.status),
  };
}

function normalizePage(rawPage: unknown): PageResponse<CreditCardExpense> {
  const page = (rawPage ?? {}) as Record<string, unknown>;
  const rawContent = Array.isArray(page.content) ? page.content : [];
  const resolvedSize = toNumber(page.size);
  const resolvedPage = page.page != null ? toNumber(page.page) : toNumber(page.number);
  const totalElements = toNumber(page.totalElements);
  const totalPages =
    page.totalPages != null
      ? toNumber(page.totalPages)
      : resolvedSize > 0
        ? Math.ceil(totalElements / resolvedSize)
        : 0;

  return {
    content: rawContent.map((item) => normalizeCreditCardExpenseFromApi(item)),
    page: resolvedPage,
    size: resolvedSize,
    totalElements,
    totalPages,
    first: page.first != null ? Boolean(page.first) : resolvedPage <= 0,
    last:
      page.last != null
        ? Boolean(page.last)
        : totalPages <= 1 || resolvedPage >= Math.max(totalPages - 1, 0),
  };
}

type CreditCardExpensesQueryParams = PageQueryParams & {
  creditCardId?: string;
  invoiceId?: string;
  categoryId?: string;
  subCategoryId?: string;
  purchaseDateStart?: string;
  purchaseDateEnd?: string;
};

function toMockPage(params: CreditCardExpensesQueryParams): PageResponse<CreditCardExpense> {
  const filtered = mockCreditCardExpenses.filter((expense) => {
    if (params.creditCardId) {
      const expectedCardId = toNumericIdString(params.creditCardId);
      const expenseCardId = toNumericIdString(expense.creditCardId);
      if (!expectedCardId || !expenseCardId || expectedCardId !== expenseCardId) return false;
    }
    if (params.invoiceId) {
      const expectedInvoiceId = toNumericIdString(params.invoiceId);
      const expenseInvoiceId = toNumericIdString(expense.invoiceId);
      if (!expectedInvoiceId || !expenseInvoiceId || expectedInvoiceId !== expenseInvoiceId) return false;
    }
    if (params.categoryId) {
      const expectedCategoryId = toNumericIdString(params.categoryId);
      const expenseCategoryId = toNumericIdString(expense.categoryId);
      if (!expectedCategoryId || !expenseCategoryId || expectedCategoryId !== expenseCategoryId) return false;
    }
    if (params.subCategoryId) {
      const expectedSubCategoryId = toNumericIdString(params.subCategoryId);
      const expenseSubCategoryId = toNumericIdString(expense.subCategoryId);
      if (!expectedSubCategoryId || !expenseSubCategoryId || expectedSubCategoryId !== expenseSubCategoryId) {
        return false;
      }
    }
    if (params.purchaseDateStart && expense.purchaseDate < params.purchaseDateStart) return false;
    if (params.purchaseDateEnd && expense.purchaseDate > params.purchaseDateEnd) return false;
    return true;
  });

  const size = Math.max(1, Number(params.size) || 10);
  const page = Math.max(0, Number(params.page) || 0);
  const start = page * size;
  const end = start + size;
  const content = filtered.slice(start, end);
  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));

  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    first: page <= 0,
    last: page >= totalPages - 1,
  };
}

export async function fetchCreditCardExpensesPage(
  params: CreditCardExpensesQueryParams,
): Promise<PageResponse<CreditCardExpense>> {
  if (env.useMocks) {
    return toMockPage(params);
  }

  const query: CreditCardExpensesListParams = {
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.creditCardId ? { creditCardId: Number(params.creditCardId) } : {}),
    ...(params.invoiceId ? { invoiceId: Number(params.invoiceId) } : {}),
    ...(params.categoryId ? { categoryId: Number(params.categoryId) } : {}),
    ...(params.subCategoryId ? { subCategoryId: Number(params.subCategoryId) } : {}),
    ...(params.purchaseDateStart ? { purchaseDateStart: params.purchaseDateStart } : {}),
    ...(params.purchaseDateEnd ? { purchaseDateEnd: params.purchaseDateEnd } : {}),
  };

  const pageResponse = await api.creditCardExpenses.list(query);
  return normalizePage(pageResponse);
}

export async function createCreditCardExpense(
  request: CreditCardExpenseCreateRequest,
): Promise<CreditCardExpense> {
  const created = await api.creditCardExpenses.create(request);
  return normalizeCreditCardExpenseFromApi(created);
}

export async function updateCreditCardExpense(
  id: string,
  request: CreditCardExpenseUpdateRequest,
): Promise<CreditCardExpense> {
  const updated = await api.creditCardExpenses.update(id, request);
  return normalizeCreditCardExpenseFromApi(updated);
}

export async function cancelCreditCardExpense(id: string): Promise<CreditCardExpense> {
  const canceled = await api.creditCardExpenses.cancel(id);
  return normalizeCreditCardExpenseFromApi(canceled);
}
