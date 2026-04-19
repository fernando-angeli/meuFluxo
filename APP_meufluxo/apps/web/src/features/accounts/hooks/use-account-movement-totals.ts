"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCashMovementsPage } from "@/features/cash-movements/cash-movements-list.service";

const MAX_PAGES = 40;
const PAGE_SIZE = 500;

export type AccountMovementTotals = {
  totalIncome: number;
  totalExpense: number;
  net: number;
};

async function aggregateCashMovementsForAccount(params: {
  accountId: string;
  categoryId?: string;
  subCategoryId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AccountMovementTotals> {
  let page = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  let totalPages = 1;

  do {
    const res = await fetchCashMovementsPage({
      page,
      size: PAGE_SIZE,
      sort: "occurredAt,DESC",
      accountId: params.accountId,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.subCategoryId ? { subCategoryId: params.subCategoryId } : {}),
      ...(params.startDate ? { startDate: params.startDate } : {}),
      ...(params.endDate ? { endDate: params.endDate } : {}),
    });

    for (const row of res.content) {
      if (row.movementType === "INCOME") totalIncome += row.amount || 0;
      else totalExpense += row.amount || 0;
    }

    totalPages = res.totalPages;
    page += 1;
  } while (page < totalPages && page < MAX_PAGES);

  return {
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
  };
}

export const accountMovementTotalsQueryKey = (
  accountId: string,
  categoryId: string,
  subCategoryId: string,
  startDate: string,
  endDate: string,
) => ["account-movements-totals", accountId, categoryId, subCategoryId, startDate, endDate] as const;

export function useAccountMovementTotals({
  accountId,
  categoryId,
  subCategoryId,
  startDate,
  endDate,
  enabled,
}: {
  accountId: string;
  categoryId: string;
  subCategoryId: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: accountMovementTotalsQueryKey(accountId, categoryId, subCategoryId, startDate, endDate),
    queryFn: () =>
      aggregateCashMovementsForAccount({
        accountId,
        categoryId: categoryId || undefined,
        subCategoryId: subCategoryId || undefined,
        startDate,
        endDate,
      }),
    enabled: enabled && !!accountId,
    staleTime: 30_000,
  });
}
