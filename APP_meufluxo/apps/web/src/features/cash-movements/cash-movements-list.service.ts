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
  sourceType?: string | null;
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
  return {
    id: String(r.id ?? ""),
    occurredAt: String(r.occurredAt ?? ""),
    description: String(r.description ?? ""),
    accountName: String(account.name ?? "—"),
    categoryName: String(category.name ?? "—"),
    subCategoryName: String(subCategory.name ?? "—"),
    movementType: String(r.movementType ?? "EXPENSE") === "INCOME" ? "INCOME" : "EXPENSE",
    amount: toNumber(r.amount),
    sourceType: r.sourceType != null ? String(r.sourceType) : null,
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
    startDate?: string;
    endDate?: string;
  },
): Promise<PageResponse<CashMovementListItem>> {
  const page = await api.cashMovements.list({
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.accountId ? { accountId: Number(params.accountId) } : {}),
    ...(params.categoryId ? { categoryId: Number(params.categoryId) } : {}),
    ...(params.subCategoryId ? { subCategoryId: Number(params.subCategoryId) } : {}),
    ...(params.movementType ? { movementType: params.movementType } : {}),
    ...(params.startDate ? { startDate: params.startDate } : {}),
    ...(params.endDate ? { endDate: params.endDate } : {}),
  });

  return normalizePage(page);
}
