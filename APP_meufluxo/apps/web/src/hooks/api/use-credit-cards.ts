"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockCreditCards } from "@/services/mocks/credit-cards";

export const creditCardsQueryKey = ["credit-cards"] as const;

export function useCreditCards() {
  return useQuery({
    queryKey: creditCardsQueryKey,
    queryFn: () =>
      env.useMocks ? Promise.resolve(mockCreditCards) : api.creditCards.list(),
  });
}
