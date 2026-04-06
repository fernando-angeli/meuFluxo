"use client";

import { useQuery } from "@tanstack/react-query";

import type { CashMovementsListParams } from "@meufluxo/api-client";
import type { CashMovementApiItem, CashMovementApiPageResponse } from "@meufluxo/types";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockCashMovements } from "@/services/mocks/cash-movements";

export const cashMovementsQueryKey = (params?: CashMovementsListParams) =>
  ["cash-movements", params] as const;

export function useCashMovements(params?: CashMovementsListParams) {
  return useQuery({
    queryKey: cashMovementsQueryKey(params),
    queryFn: () =>
      env.useMocks
        ? Promise.resolve(toMockPageResponse(params))
        : api.cashMovements.list(params),
  });
}

function toMockPageResponse(params?: CashMovementsListParams): CashMovementApiPageResponse {
  const page = params?.page ?? 0;
  const size = params?.size ?? 20;
  const start = page * size;
  const sliced = mockCashMovements.slice(start, start + size);

  const content: CashMovementApiItem[] = sliced.map((item, index) => ({
    id: Number(item.id) || start + index + 1,
    description: item.description ?? "",
    paymentMethod: "TRANSFER",
    amount: item.amount,
    occurredAt: item.occurredAt,
    referenceMonth: item.referenceMonth,
    movementType: item.type === "INCOME" ? "INCOME" : "EXPENSE",
    account: {
      id: Number(item.accountId ?? 0),
      name: item.accountId ?? "—",
      currentBalance: undefined,
    },
    subCategory: {
      id: Number(item.categoryId ?? 0),
      name: item.categoryId ?? "—",
      category: {
        id: Number(item.categoryId ?? 0),
        name: item.categoryId ?? "—",
      },
    },
    sourceType: "MANUAL",
    sourceId: item.id,
  }));

  const totalElements = mockCashMovements.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    first: page <= 0,
    last: page >= totalPages - 1,
  };
}
