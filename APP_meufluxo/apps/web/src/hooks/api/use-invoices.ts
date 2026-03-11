"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockInvoices } from "@/services/mocks/invoices";

export const invoicesQueryKey = (params?: { creditCardId?: string }) =>
  ["invoices", params] as const;

export function useInvoices(params?: { creditCardId?: string }) {
  return useQuery({
    queryKey: invoicesQueryKey(params),
    queryFn: () =>
      env.useMocks ? Promise.resolve(mockInvoices) : api.invoices.list(params),
  });
}
