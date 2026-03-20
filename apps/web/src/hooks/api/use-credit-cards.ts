"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockCreditCards } from "@/services/mocks/credit-cards";

export const creditCardsQueryKey = ["credit-cards"] as const;

export function useCreditCards() {
  const auth = useAuthOptional();

  return useQuery({
    queryKey: creditCardsQueryKey,
    queryFn: () =>
      env.useMocks ? Promise.resolve(mockCreditCards) : api.creditCards.list(),
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
