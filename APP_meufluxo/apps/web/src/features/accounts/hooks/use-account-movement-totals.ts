"use client";

import { useQuery } from "@tanstack/react-query";

import type { CashMovementListItem } from "@/features/cash-movements/cash-movements-list.service";
import { fetchCashMovementsPage } from "@/features/cash-movements/cash-movements-list.service";

const MAX_PAGES = 40;
const PAGE_SIZE = 500;

export type AccountMovementTotals = {
  totalIncome: number;
  totalExpense: number;
  net: number;
  /** Saldo após cada lançamento no intervalo filtrado (ordem cronológica). */
  runningBalanceById: Map<string, number>;
};

function signedMovementAmount(row: CashMovementListItem): number {
  return row.movementType === "INCOME" ? row.amount : -Math.abs(row.amount);
}

/** Compara apenas a parte da data (YYYY-MM-DD) para alinhar ao filtro do período. */
function occurredDateKey(iso: string): string {
  const s = String(iso ?? "").trim();
  if (!s) return "";
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function compareChronological(a: CashMovementListItem, b: CashMovementListItem): number {
  const d = a.occurredAt.localeCompare(b.occurredAt);
  if (d !== 0) return d;
  const na = Number(a.id);
  const nb = Number(b.id);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.id.localeCompare(b.id);
}

/**
 * Busca lançamentos a partir de `startDate` (sem `endDate`) para ancorar o saldo ao
 * `currentBalance` atual; totais e mapa de saldo consideram apenas o intervalo [startDate, endDate].
 */
async function aggregateAccountMovementsPeriodAndRunning(params: {
  accountId: string;
  categoryId?: string;
  subCategoryId?: string;
  startDate: string;
  endDate: string;
  currentBalance: number;
}): Promise<AccountMovementTotals> {
  let page = 0;
  const allFromStart: CashMovementListItem[] = [];
  let totalPages = 1;

  do {
    const res = await fetchCashMovementsPage({
      page,
      size: PAGE_SIZE,
      sort: "occurredAt,ASC",
      accountId: params.accountId,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.subCategoryId ? { subCategoryId: params.subCategoryId } : {}),
      startDate: params.startDate,
    });

    allFromStart.push(...res.content);
    totalPages = res.totalPages;
    page += 1;
  } while (page < totalPages && page < MAX_PAGES);

  const balance = Number.isFinite(params.currentBalance) ? params.currentBalance : 0;
  const signedAllFromStart = allFromStart.reduce((sum, row) => sum + signedMovementAmount(row), 0);
  const openingBeforeWindowChrono = balance - signedAllFromStart;

  const start = params.startDate.slice(0, 10);
  const end = params.endDate.slice(0, 10);
  const inWindow = allFromStart.filter((row) => {
    const d = occurredDateKey(row.occurredAt);
    return d >= start && d <= end;
  });

  let totalIncome = 0;
  let totalExpense = 0;
  for (const row of inWindow) {
    if (row.movementType === "INCOME") totalIncome += row.amount || 0;
    else totalExpense += row.amount || 0;
  }

  const sorted = [...inWindow].sort(compareChronological);
  const runningBalanceById = new Map<string, number>();
  let acc = openingBeforeWindowChrono;
  for (const row of sorted) {
    acc += signedMovementAmount(row);
    runningBalanceById.set(row.id, acc);
  }

  return {
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    runningBalanceById,
  };
}

export const accountMovementTotalsQueryKey = (
  accountId: string,
  categoryId: string,
  subCategoryId: string,
  startDate: string,
  endDate: string,
  currentBalance: number,
) =>
  [
    "account-movements-totals",
    accountId,
    categoryId,
    subCategoryId,
    startDate,
    endDate,
    currentBalance,
  ] as const;

export function useAccountMovementTotals({
  accountId,
  categoryId,
  subCategoryId,
  startDate,
  endDate,
  currentBalance,
  enabled,
}: {
  accountId: string;
  categoryId: string;
  subCategoryId: string;
  startDate: string;
  endDate: string;
  currentBalance: number;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: accountMovementTotalsQueryKey(
      accountId,
      categoryId,
      subCategoryId,
      startDate,
      endDate,
      currentBalance,
    ),
    queryFn: () =>
      aggregateAccountMovementsPeriodAndRunning({
        accountId,
        categoryId: categoryId || undefined,
        subCategoryId: subCategoryId || undefined,
        startDate,
        endDate,
        currentBalance,
      }),
    enabled: enabled && !!accountId,
    staleTime: 30_000,
  });
}
