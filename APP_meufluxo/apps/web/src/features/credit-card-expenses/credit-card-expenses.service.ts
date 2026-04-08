"use client";

import type {
  CreditCardExpense,
  CreditCardExpenseCreateRequest,
  CreditCardExpenseCreateResponse,
  CreditCardExpenseUpdateRequest,
  PageQueryParams,
  PageResponse,
} from "@meufluxo/types";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockCreditCardExpenses } from "@/services/mocks/credit-card-expenses";

type UnknownRecord = Record<string, unknown>;

function toNullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStatus(value: unknown): "OPEN" | "CANCELED" {
  return String(value ?? "").toUpperCase() === "CANCELED" ? "CANCELED" : "OPEN";
}

export function normalizeCreditCardExpenseFromApi(raw: unknown): CreditCardExpense {
  const r = raw as UnknownRecord;
  return {
    id: String(r.id ?? ""),
    creditCardId: String(r.creditCardId ?? ""),
    creditCardName: String(r.creditCardName ?? ""),
    cardDisplayName: toNullableString(r.cardDisplayName),
    invoiceId: String(r.invoiceId ?? ""),
    invoiceReference: toNullableString(r.invoiceReference),
    description: String(r.description ?? ""),
    purchaseDate: String(r.purchaseDate ?? ""),
    categoryId: String(r.categoryId ?? ""),
    categoryName: String(r.categoryName ?? ""),
    subcategoryId: String(r.subcategoryId ?? ""),
    subcategoryName: String(r.subcategoryName ?? ""),
    amount: toNumber(r.amount),
    installmentNumber:
      r.installmentNumber != null ? Number(r.installmentNumber) : null,
    installmentCount:
      r.installmentCount != null ? Number(r.installmentCount) : null,
    installmentGroupId: toNullableString(r.installmentGroupId),
    status: normalizeStatus(r.status),
    statusLabel: toNullableString(r.statusLabel),
    notes: toNullableString(r.notes),
    createdAt: toNullableString(r.createdAt),
    updatedAt: toNullableString(r.updatedAt),
  };
}

function normalizePage(page: PageResponse<unknown>): PageResponse<CreditCardExpense> {
  return {
    ...page,
    content: (page.content ?? []).map((item) => normalizeCreditCardExpenseFromApi(item)),
  };
}

function toMockPage(
  params: PageQueryParams & Record<string, unknown>,
): PageResponse<CreditCardExpense> {
  const filtered = mockCreditCardExpenses.filter((item) => {
    if (params.creditCardId && String(params.creditCardId) !== item.creditCardId) return false;
    if (params.invoiceId && String(params.invoiceId) !== item.invoiceId) return false;
    if (params.categoryId && String(params.categoryId) !== item.categoryId) return false;
    if (params.subcategoryId && String(params.subcategoryId) !== item.subcategoryId) return false;
    if (params.purchaseDateStart && item.purchaseDate < String(params.purchaseDateStart)) return false;
    if (params.purchaseDateEnd && item.purchaseDate > String(params.purchaseDateEnd)) return false;
    return true;
  });

  const start = params.page * params.size;
  const content = filtered.slice(start, start + params.size);
  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / params.size));
  return {
    content,
    page: params.page,
    size: params.size,
    totalElements,
    totalPages,
    first: params.page === 0,
    last: params.page >= totalPages - 1,
  };
}

export async function fetchCreditCardExpensesPage(
  params: PageQueryParams & Record<string, unknown>,
): Promise<PageResponse<CreditCardExpense>> {
  if (env.useMocks) {
    return toMockPage(params);
  }
  const raw = await api.creditCardExpenses.list({
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: String(params.sort) } : {}),
    ...(params.creditCardId ? { creditCardId: String(params.creditCardId) } : {}),
    ...(params.invoiceId ? { invoiceId: String(params.invoiceId) } : {}),
    ...(params.categoryId ? { categoryId: Number(params.categoryId) } : {}),
    ...(params.subcategoryId ? { subcategoryId: Number(params.subcategoryId) } : {}),
    ...(params.purchaseDateStart ? { purchaseDateStart: String(params.purchaseDateStart) } : {}),
    ...(params.purchaseDateEnd ? { purchaseDateEnd: String(params.purchaseDateEnd) } : {}),
  });
  return normalizePage(raw as PageResponse<unknown>);
}

export async function createCreditCardExpense(
  request: CreditCardExpenseCreateRequest,
): Promise<CreditCardExpenseCreateResponse> {
  const response = await api.creditCardExpenses.create(request);
  return {
    installmentGroupId:
      response.installmentGroupId != null
        ? String(response.installmentGroupId)
        : null,
    installmentCount: Number(response.installmentCount ?? 1),
    totalAmount: toNumber(response.totalAmount),
    expenses: (response.expenses ?? []).map((item) =>
      normalizeCreditCardExpenseFromApi(item),
    ),
  };
}

export async function updateCreditCardExpense(
  id: string,
  request: CreditCardExpenseUpdateRequest,
): Promise<CreditCardExpense> {
  const raw = await api.creditCardExpenses.update(id, request);
  return normalizeCreditCardExpenseFromApi(raw);
}

export async function cancelCreditCardExpense(id: string): Promise<CreditCardExpense> {
  const raw = await api.creditCardExpenses.cancel(id);
  return normalizeCreditCardExpenseFromApi(raw);
}
