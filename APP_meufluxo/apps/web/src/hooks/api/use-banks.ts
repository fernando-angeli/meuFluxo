"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockBanks } from "@/services/mocks/banks";

export const banksQueryKey = ["banks"] as const;

export function useBanks(enabled = true) {
  return useQuery({
    queryKey: banksQueryKey,
    queryFn: () => (env.useMocks ? Promise.resolve(mockBanks) : api.banks.list()),
    staleTime: 86_400_000,
    enabled,
  });
}
