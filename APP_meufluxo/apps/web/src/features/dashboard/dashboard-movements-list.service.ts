"use client";

import type { ExpenseRecord, PageQueryParams, PageResponse } from "@meufluxo/types";
import { DASHBOARD_PROJECTION_PLANNED_STATUSES } from "@meufluxo/types";

import type { DashboardFiltersValue } from "@/components/filters";
import { fetchCashMovementsPage, type CashMovementListItem } from "@/features/cash-movements/cash-movements-list.service";
import { api } from "@/services/api";
import { format, parseISO, subDays } from "date-fns";

const PLANNED_PAGE_SIZE = 200;
const PLANNED_MAX_PAGES = 25;
const MERGE_MAX_ROWS = 4000;

/** Parâmetros extras para `useServerDataTable` (também usados na união com projeções). */
export function buildDashboardMovementsListExtraParams(
  filters: DashboardFiltersValue,
): Record<string, string | boolean> {
  const { startDate, endDate } = filters.dateRange;
  const out: Record<string, string | boolean> = {};
  if (startDate) out.startDate = startDate;
  if (endDate) out.endDate = endDate;
  if (filters.accountIds.length > 0) {
    out.accountId = filters.accountIds[0];
  }
  if (filters.categoryIds.length === 1) {
    out.categoryId = filters.categoryIds[0];
  }
  if (filters.subcategoryIds.length === 1) {
    out.subCategoryId = filters.subcategoryIds[0];
  }
  if (filters.accountIds.length) {
    out.filterAccountIds = filters.accountIds.join(",");
  }
  if (filters.categoryIds.length) {
    out.filterCategoryIds = filters.categoryIds.join(",");
  }
  if (filters.subcategoryIds.length) {
    out.filterSubcategoryIds = filters.subcategoryIds.join(",");
  }
  out.includeProjections = filters.includeProjections;
  return out;
}

function parseCsvIds(raw: unknown): number[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function plannedToRow(r: ExpenseRecord, kind: "EXPENSE" | "INCOME"): CashMovementListItem {
  const movementType = kind === "EXPENSE" ? "EXPENSE" : "INCOME";
  return {
    id: `pl-${kind}-${r.id}`,
    occurredAt: r.dueDate,
    description: r.description?.trim() ? r.description : "—",
    accountName: "—",
    categoryName: r.categoryName ?? "—",
    subCategoryName: r.subCategoryName ?? "—",
    movementType,
    amount: r.expectedAmount,
    paymentMethod: null,
    sourceType: kind === "EXPENSE" ? "PAYABLE" : "RECEIVABLE",
  };
}

async function fetchAllPlannedRows(
  startDate: string,
  endDate: string,
  accountIds: number[],
  categoryIds: number[],
  subCategoryIds: number[],
): Promise<CashMovementListItem[]> {
  const filterBase = {
    statuses: DASHBOARD_PROJECTION_PLANNED_STATUSES,
    ...(accountIds.length ? { accountIds } : {}),
    ...(categoryIds.length ? { categoryIds } : {}),
    ...(subCategoryIds.length ? { subCategoryIds } : {}),
  };

  const dueWindows: { dueDateStart?: string; dueDateEnd?: string }[] = [
    { dueDateStart: startDate, dueDateEnd: endDate },
  ];
  try {
    const backlogEnd = format(subDays(parseISO(startDate), 1), "yyyy-MM-dd");
    dueWindows.push({ dueDateEnd: backlogEnd });
  } catch {
    /* startDate inválido: só o intervalo principal */
  }

  const loadDir = async (kind: "EXPENSE" | "INCOME"): Promise<CashMovementListItem[]> => {
    const byId = new Map<string, CashMovementListItem>();
    const listFn = kind === "EXPENSE" ? api.expenses.list.bind(api.expenses) : api.income.list.bind(api.income);

    for (const win of dueWindows) {
      for (let page = 0; page < PLANNED_MAX_PAGES; page += 1) {
        const res = await listFn({
          ...filterBase,
          ...win,
          page,
          size: PLANNED_PAGE_SIZE,
          sort: "dueDate,desc",
        });
        const chunk = res.content ?? [];
        for (const r of chunk) {
          const row = plannedToRow(r, kind);
          byId.set(row.id, row);
        }
        if (res.last || chunk.length < PLANNED_PAGE_SIZE) break;
      }
    }
    return [...byId.values()];
  };

  const [exp, inc] = await Promise.all([loadDir("EXPENSE"), loadDir("INCOME")]);
  return [...exp, ...inc];
}

async function fetchAllCashRowsForMerge(
  params: PageQueryParams & Record<string, unknown>,
): Promise<CashMovementListItem[]> {
  const pageSize = 500;
  const all: CashMovementListItem[] = [];
  for (let page = 0; page < 20; page += 1) {
    const res = await fetchCashMovementsPage({
      page,
      size: pageSize,
      ...(typeof params.sort === "string" ? { sort: params.sort } : {}),
      startDate: typeof params.startDate === "string" ? params.startDate : undefined,
      endDate: typeof params.endDate === "string" ? params.endDate : undefined,
      accountId: typeof params.accountId === "string" ? params.accountId : undefined,
      categoryId: typeof params.categoryId === "string" ? params.categoryId : undefined,
      subCategoryId: typeof params.subCategoryId === "string" ? params.subCategoryId : undefined,
    });
    all.push(...(res.content ?? []));
    if (res.last || (res.content?.length ?? 0) < pageSize) break;
  }
  return all;
}

function parseSortField(sort: string | undefined): keyof CashMovementListItem | "occurredAt" {
  if (!sort) return "occurredAt";
  const field = sort.split(",")[0]?.trim();
  if (field === "description" || field === "amount" || field === "occurredAt") {
    return field as keyof CashMovementListItem;
  }
  return "occurredAt";
}

function parseSortDir(sort: string | undefined): "asc" | "desc" {
  const parts = sort?.split(",");
  const dir = parts?.[1]?.trim().toLowerCase();
  return dir === "asc" ? "asc" : "desc";
}

function compareRows(
  a: CashMovementListItem,
  b: CashMovementListItem,
  field: keyof CashMovementListItem,
  dir: "asc" | "desc",
): number {
  const va = a[field];
  const vb = b[field];
  let cmp = 0;
  if (field === "amount") {
    cmp = (va as number) - (vb as number);
  } else {
    cmp = String(va).localeCompare(String(vb), "pt-BR");
  }
  return dir === "asc" ? cmp : -cmp;
}

function slicePage<T>(all: T[], page: number, size: number): PageResponse<T> {
  const totalElements = all.length;
  const totalPages = totalElements === 0 ? 1 : Math.ceil(totalElements / size);
  const safePage = totalElements === 0 ? 0 : Math.min(page, totalPages - 1);
  const start = safePage * size;
  const content = all.slice(start, start + size);
  return {
    content,
    page: safePage,
    size,
    totalElements,
    totalPages,
    first: safePage === 0,
    last: safePage >= totalPages - 1,
  };
}

export async function fetchDashboardMovementsPage(
  params: PageQueryParams & Record<string, unknown>,
): Promise<PageResponse<CashMovementListItem>> {
  const include = params.includeProjections === true || params.includeProjections === "true";
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  const sort = typeof params.sort === "string" ? params.sort : undefined;

  if (!include) {
    return fetchCashMovementsPage({
      page,
      size,
      ...(sort ? { sort } : {}),
      startDate: typeof params.startDate === "string" ? params.startDate : undefined,
      endDate: typeof params.endDate === "string" ? params.endDate : undefined,
      accountId: typeof params.accountId === "string" ? params.accountId : undefined,
      categoryId: typeof params.categoryId === "string" ? params.categoryId : undefined,
      subCategoryId: typeof params.subCategoryId === "string" ? params.subCategoryId : undefined,
    });
  }

  const startDate = typeof params.startDate === "string" ? params.startDate : "";
  const endDate = typeof params.endDate === "string" ? params.endDate : "";
  const accountIds = parseCsvIds(params.filterAccountIds);
  const categoryIds = parseCsvIds(params.filterCategoryIds);
  const subCategoryIds = parseCsvIds(params.filterSubcategoryIds);

  const [cashRows, plannedRows] = await Promise.all([
    fetchAllCashRowsForMerge(params),
    fetchAllPlannedRows(startDate, endDate, accountIds, categoryIds, subCategoryIds),
  ]);

  let merged = [...cashRows, ...plannedRows];
  if (merged.length > MERGE_MAX_ROWS) {
    merged = merged.slice(0, MERGE_MAX_ROWS);
  }

  const field = parseSortField(sort);
  const dir = parseSortDir(sort);
  merged.sort((a, b) => compareRows(a, b, field, dir));

  return slicePage(merged, page, size);
}
