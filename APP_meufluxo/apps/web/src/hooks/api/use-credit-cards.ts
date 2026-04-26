"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { buildPageableParams } from "@/lib/pageable";
import { api } from "@/services/api";
import { env } from "@/lib/env";
import {
  getMockCreditCardsSnapshot,
  normalizeCreditCardFromApi,
} from "@/features/credit-cards/credit-cards.service";

export const creditCardsQueryKey = ["credit-cards"] as const;

export function useCreditCards() {
  const auth = useAuthOptional();

  return useQuery({
    queryKey: creditCardsQueryKey,
    queryFn: async () => {
      if (env.useMocks) return getMockCreditCardsSnapshot();
      const params = buildPageableParams({
        page: 0,
        size: 1000,
        sortField: "name",
        sortDirection: "ASC",
      });
      const page = await api.creditCards.list(params);
      return (page.content ?? []).map((item) => normalizeCreditCardFromApi(item));
    },
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
