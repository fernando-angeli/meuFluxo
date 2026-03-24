"use client";

import { useQuery } from "@tanstack/react-query";
import type { AccountId } from "@meufluxo/types";

import { fetchAccountById } from "@/features/accounts/accounts.service";

export const accountDetailsQueryKey = ["accounts", "detail"] as const;

export function useAccountDetails(accountId: AccountId | null, enabled = true) {
  return useQuery({
    queryKey: [...accountDetailsQueryKey, accountId],
    queryFn: () => fetchAccountById(accountId!),
    enabled: enabled && !!accountId,
    staleTime: 60_000,
  });
}
