"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockAccounts } from "@/services/mocks/accounts";

export const accountsQueryKey = ["accounts"] as const;

export function useAccounts() {
  return useQuery({
    queryKey: accountsQueryKey,
    queryFn: () => (env.useMocks ? Promise.resolve(mockAccounts) : api.accounts.list()),
  });
}
