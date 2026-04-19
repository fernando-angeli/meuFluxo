"use client";

import { useQuery } from "@tanstack/react-query";
import { addMonths, endOfMonth, format, isAfter, parseISO, startOfMonth } from "date-fns";

import { fetchCashMovementsPage } from "@/features/cash-movements/cash-movements-list.service";

/**
 * Descobre meses futuros (após o mês civil corrente) com pelo menos um lançamento na conta,
 * para montar os botões rápidos sem inventar meses vazios.
 */
export function useAccountFutureMovementMonthKeys(accountId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["account-movements", "future-month-keys", accountId],
    queryFn: async () => {
      const now = new Date();
      const startDate = format(startOfMonth(addMonths(now, 1)), "yyyy-MM-dd");
      const endDate = format(endOfMonth(addMonths(now, 36)), "yyyy-MM-dd");
      const monthEndCurrent = endOfMonth(now);

      const keys = new Set<string>();
      let page = 0;
      let totalPages = 1;

      do {
        const res = await fetchCashMovementsPage({
          page,
          size: 500,
          sort: "occurredAt,ASC",
          accountId,
          startDate,
          endDate,
        });

        for (const row of res.content) {
          if (!row.occurredAt) continue;
          const d = parseISO(row.occurredAt);
          if (Number.isNaN(d.getTime())) continue;
          const monthStart = startOfMonth(d);
          if (isAfter(monthStart, monthEndCurrent)) {
            keys.add(format(monthStart, "yyyy-MM"));
          }
        }

        totalPages = res.totalPages;
        page += 1;
      } while (page < totalPages && page < 40);

      return Array.from(keys).sort();
    },
    enabled: enabled && !!accountId,
    staleTime: 60_000,
  });
}
