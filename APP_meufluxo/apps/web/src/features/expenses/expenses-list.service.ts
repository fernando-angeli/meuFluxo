"use client";

import type {
  ExpenseRecord,
  PageQueryParams,
  PageResponse,
  PlannedEntryStatus,
} from "@meufluxo/types";

import { api } from "@/services/api";

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeExpenseFromApi(raw: unknown): ExpenseRecord {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id ?? ""),
    direction: String(r.direction ?? "EXPENSE") as ExpenseRecord["direction"],
    description: String(r.description ?? ""),
    categoryId: String(r.categoryId ?? ""),
    subCategoryId: r.subCategoryId != null ? String(r.subCategoryId) : null,
    expectedAmount: toNumber(r.expectedAmount),
    actualAmount: r.actualAmount == null ? null : toNumber(r.actualAmount),
    amountBehavior: String(r.amountBehavior ?? "FIXED") as ExpenseRecord["amountBehavior"],
    issueDate: String(r.issueDate ?? r.dueDate ?? ""),
    dueDate: String(r.dueDate ?? ""),
    status: String(r.status ?? "OPEN") as ExpenseRecord["status"],
    notes: r.notes != null ? String(r.notes) : null,
    defaultAccountId: r.defaultAccountId != null ? String(r.defaultAccountId) : null,
    settledAccountId: r.settledAccountId != null ? String(r.settledAccountId) : null,
    settledAt: r.settledAt != null ? String(r.settledAt) : null,
    groupId: r.groupId != null ? String(r.groupId) : null,
  };
}

function normalizePage(page: PageResponse<unknown>): PageResponse<ExpenseRecord> {
  return {
    ...page,
    content: (page.content ?? []).map((item) => normalizeExpenseFromApi(item)),
  };
}

export async function fetchExpensesPage(
  params: PageQueryParams & {
    status?: PlannedEntryStatus;
    categoryId?: string;
    subCategoryId?: string;
    dueDateStart?: string;
    dueDateEnd?: string;
  },
): Promise<PageResponse<ExpenseRecord>> {
  const page = await api.expenses.list({
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.dueDateStart ? { dueDateStart: params.dueDateStart } : {}),
    ...(params.dueDateEnd ? { dueDateEnd: params.dueDateEnd } : {}),
    ...(params.categoryId ? { categoryId: Number(params.categoryId) } : {}),
    ...(params.subCategoryId ? { subCategoryId: Number(params.subCategoryId) } : {}),
  });
  return normalizePage(page as PageResponse<unknown>);
}

