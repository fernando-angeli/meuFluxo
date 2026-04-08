"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { buildPageableParams } from "@/lib/pageable";
import { fetchInvoicesPage } from "@/features/invoices/invoices.service";

export const invoicesQueryKey = ["invoices"] as const;

export function useInvoices(params?: { creditCardId?: string; status?: string }) {
  const auth = useAuthOptional();
  return useQuery({
    queryKey: [...invoicesQueryKey, params] as const,
    queryFn: async () => {
      const page = await fetchInvoicesPage({
        ...buildPageableParams({
          page: 0,
          size: 1000,
          sortField: "dueDate",
          sortDirection: "DESC",
        }),
        ...(params?.creditCardId ? { creditCardId: params.creditCardId } : {}),
        ...(params?.status ? { status: params.status } : {}),
      });
      return page.content ?? [];
    },
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
