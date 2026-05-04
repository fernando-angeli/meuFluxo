"use client";

import type { CashMovementApiPageResponse, PageQueryParams, PageResponse } from "@meufluxo/types";

import { api } from "@/services/api";

export type CashMovementListItem = {
  id: string;
  occurredAt: string;
  description: string;
  accountName: string;
  categoryName: string;
  subCategoryName: string;
  movementType: "INCOME" | "EXPENSE";
  amount: number;
  paymentMethod?: string | null;
  sourceType?: string | null;
  creditCardInvoiceId?: number | null;
  creditCardInvoiceDueDate?: string | null;
};

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeMovement(raw: unknown): CashMovementListItem {
  const r = raw as Record<string, unknown>;
  const account = (r.account ?? {}) as Record<string, unknown>;
  const subCategory = (r.subCategory ?? {}) as Record<string, unknown>;
  const category = (subCategory.category ?? {}) as Record<string, unknown>;
  const invDue = r.creditCardInvoiceDueDate != null ? String(r.creditCardInvoiceDueDate).slice(0, 10) : null;
  const invId = r.creditCardInvoiceId != null ? toNumber(r.creditCardInvoiceId) : null;
  return {
    id: String(r.id ?? ""),
    occurredAt: String(r.occurredAt ?? ""),
    description: String(r.description ?? ""),
    accountName: String(account.name ?? "—"),
    categoryName: String(category.name ?? "—"),
    subCategoryName: String(subCategory.name ?? "—"),
    movementType: String(r.movementType ?? "EXPENSE") === "INCOME" ? "INCOME" : "EXPENSE",
    amount: toNumber(r.amount),
    paymentMethod: r.paymentMethod != null ? String(r.paymentMethod) : null,
    sourceType: r.sourceType != null ? String(r.sourceType) : null,
    creditCardInvoiceId: invId != null && invId > 0 ? invId : null,
    creditCardInvoiceDueDate: invDue && /^\d{4}-\d{2}-\d{2}$/.test(invDue) ? invDue : null,
  };
}

function normalizePage(page: CashMovementApiPageResponse): PageResponse<CashMovementListItem> {
  return {
    ...page,
    content: (page.content ?? []).map((item) => normalizeMovement(item)),
  };
}

export async function fetchCashMovementsPage(
  params: PageQueryParams & {
    accountId?: string;
    categoryId?: string;
    subCategoryId?: string;
    movementType?: "INCOME" | "EXPENSE";
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<PageResponse<CashMovementListItem>> {
  const pm = params.paymentMethod?.trim();
  const page = await api.cashMovements.list({
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.accountId ? { accountId: Number(params.accountId) } : {}),
    ...(params.categoryId ? { categoryId: Number(params.categoryId) } : {}),
    ...(params.subCategoryId ? { subCategoryId: Number(params.subCategoryId) } : {}),
    ...(params.movementType ? { movementType: params.movementType } : {}),
    ...(pm ? { paymentMethod: pm } : {}),
    ...(params.startDate ? { startDate: params.startDate } : {}),
    ...(params.endDate ? { endDate: params.endDate } : {}),
  });

  return normalizePage(page);
}
