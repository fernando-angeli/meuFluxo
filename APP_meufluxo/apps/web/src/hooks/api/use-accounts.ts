"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { buildPageableParams } from "@/lib/pageable";
import { api } from "@/services/api";
import type { AccountsListParams } from "@meufluxo/api-client";

export const accountsQueryKey = ["accounts"] as const;

export function useAccounts() {
  const auth = useAuthOptional();

  return useQuery({
    queryKey: accountsQueryKey,
    queryFn: async () => {
      // Multi-select precisa de lista completa; para evitar paginação fake,
      // buscamos uma pagina grande.
      const params: AccountsListParams = buildPageableParams({
        page: 0,
        size: 1000,
        sortField: "name",
        sortDirection: "ASC",
      });
      const page = await api.accounts.list(params);
      return page.content ?? [];
    },
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
