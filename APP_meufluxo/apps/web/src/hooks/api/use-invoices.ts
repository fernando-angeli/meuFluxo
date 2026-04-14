"use client";

import { useQuery } from "@tanstack/react-query";

import { env } from "@/lib/env";
import { fetchInvoicesPage } from "@/features/invoices/invoices.service";
import { mockInvoices } from "@/services/mocks/invoices";
import { toNumericIdString } from "@/lib/numeric-id";

export const invoicesQueryKey = (params?: {
  creditCardId?: string;
  status?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
}) =>
  ["invoices", params] as const;

export function useInvoices(params?: {
  creditCardId?: string;
  status?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
}) {
  return useQuery({
    queryKey: invoicesQueryKey(params),
    queryFn: async () => {
      if (env.useMocks) {
        return mockInvoices.filter((invoice) => {
          if (params?.creditCardId) {
            const invoiceCardId = toNumericIdString(invoice.creditCardId);
            const currentCardId = toNumericIdString(params.creditCardId);
            if (!invoiceCardId || !currentCardId || invoiceCardId !== currentCardId) return false;
          }
          if (params?.status && invoice.status !== params.status) return false;
          if (params?.dueDateStart && invoice.dueDate < params.dueDateStart) return false;
          if (params?.dueDateEnd && invoice.dueDate > params.dueDateEnd) return false;
          return true;
        });
      }
      const page = await fetchInvoicesPage({
        page: 0,
        size: 200,
        sort: "dueDate,DESC",
        ...(params?.creditCardId ? { creditCardId: params.creditCardId } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.dueDateStart ? { dueDateStart: params.dueDateStart } : {}),
        ...(params?.dueDateEnd ? { dueDateEnd: params.dueDateEnd } : {}),
      });
      return page.content;
    },
  });
}
