"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchInvoiceDetailsById } from "@/features/invoices/invoices.service";

export const invoiceDetailsQueryKey = (invoiceId?: string | null) =>
  ["invoice-details", invoiceId] as const;

export function useInvoiceDetails(invoiceId?: string | null, enabled = true) {
  return useQuery({
    queryKey: invoiceDetailsQueryKey(invoiceId),
    queryFn: () => fetchInvoiceDetailsById(invoiceId!),
    enabled: enabled && !!invoiceId,
  });
}
