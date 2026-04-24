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

function normalizeIncomeFromApi(raw: unknown): ExpenseRecord {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id ?? ""),
    direction: String(r.direction ?? "INCOME") as ExpenseRecord["direction"],
    description: String(r.description ?? ""),
    categoryId: String(r.categoryId ?? ""),
    subCategoryId: r.subCategoryId != null ? String(r.subCategoryId) : null,
    expectedAmount: toNumber(r.expectedAmount),
    actualAmount: r.actualAmount == null ? null : toNumber(r.actualAmount),
    amountBehavior: String(r.amountBehavior ?? "FIXED") as ExpenseRecord["amountBehavior"],
    document: r.document != null ? String(r.document) : null,
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
    content: (page.content ?? []).map((item) => normalizeIncomeFromApi(item)),
  };
}

/** Apenas IDs numéricos puros seguem para a API (Long); demais ficam só no filtro da UI. */
function idsToNumericApiParams(ids: string[] | undefined): number[] | undefined {
  if (!ids?.length) return undefined;
  const nums = ids.filter((id) => /^\d+$/.test(id.trim())).map((id) => Number(id));
  return nums.length ? nums : undefined;
}

export async function fetchIncomePage(
  params: PageQueryParams & {
    statuses?: PlannedEntryStatus[];
    categoryIds?: string[];
    subCategoryIds?: string[];
    dueDateStart?: string;
    dueDateEnd?: string;
    issueDateStart?: string;
    issueDateEnd?: string;
  },
): Promise<PageResponse<ExpenseRecord>> {
  const categoryIdsNum = idsToNumericApiParams(params.categoryIds);
  const subCategoryIdsNum = idsToNumericApiParams(params.subCategoryIds);
  const page = await api.income.list({
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.statuses?.length ? { statuses: params.statuses } : {}),
    ...(params.issueDateStart ? { issueDateStart: params.issueDateStart } : {}),
    ...(params.issueDateEnd ? { issueDateEnd: params.issueDateEnd } : {}),
    ...(params.dueDateStart ? { dueDateStart: params.dueDateStart } : {}),
    ...(params.dueDateEnd ? { dueDateEnd: params.dueDateEnd } : {}),
    ...(categoryIdsNum?.length ? { categoryIds: categoryIdsNum } : {}),
    ...(subCategoryIdsNum?.length ? { subCategoryIds: subCategoryIdsNum } : {}),
  });
  return normalizePage(page as PageResponse<unknown>);
}
