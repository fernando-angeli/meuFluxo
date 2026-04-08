"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { InvoiceCreatePaymentRequest } from "@meufluxo/api-client";

import { createInvoicePayment } from "@/features/invoices/invoices.service";

import { invoiceDetailsQueryKey } from "./use-invoice-details";
import { invoicesQueryKey } from "./use-invoices";

export function useCreateInvoicePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: InvoiceCreatePaymentRequest) =>
      createInvoicePayment(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKey });
      await queryClient.invalidateQueries({ queryKey: invoiceDetailsQueryKey });
    },
  });
}
