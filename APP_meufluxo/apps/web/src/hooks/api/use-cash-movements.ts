"use client";

import { useQuery } from "@tanstack/react-query";

import type { CashMovementsListParams } from "@meufluxo/api-client";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockCashMovements } from "@/services/mocks/cash-movements";

export const cashMovementsQueryKey = (params?: CashMovementsListParams) =>
  ["cash-movements", params] as const;

export function useCashMovements(params?: CashMovementsListParams) {
  return useQuery({
    queryKey: cashMovementsQueryKey(params),
    queryFn: () =>
      env.useMocks ? Promise.resolve(mockCashMovements) : api.cashMovements.list(params),
  });
}
