"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  InvoiceChargesUpdateRequest,
  InvoicePaymentCreateRequest,
} from "@meufluxo/types";

import {
  closeInvoiceById,
  createInvoicePayment,
  deleteInvoicePaymentById,
  reopenInvoiceById,
  updateInvoiceCharges,
} from "@/features/invoices/invoices.service";
import { invoiceDetailsQueryKey } from "./use-invoice-details";
import { invoicesQueryKey } from "./use-invoices";

function invalidateInvoices(
  queryClient: ReturnType<typeof useQueryClient>,
  invoiceId?: string | null,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["invoices"] }),
    queryClient.invalidateQueries({ queryKey: invoicesQueryKey() }),
    ...(invoiceId ? [queryClient.invalidateQueries({ queryKey: invoiceDetailsQueryKey(invoiceId) })] : []),
  ]);
}

export function useCloseInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => closeInvoiceById(invoiceId),
    onSuccess: async (_, invoiceId) => {
      await invalidateInvoices(queryClient, invoiceId);
    },
  });
}

export function useCreateInvoicePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { invoiceId: string; request: InvoicePaymentCreateRequest }) =>
      createInvoicePayment(params.invoiceId, params.request),
    onSuccess: async (_, params) => {
      await invalidateInvoices(queryClient, params.invoiceId);
    },
  });
}

export function useDeleteInvoicePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { invoiceId: string; paymentId: string }) =>
      deleteInvoicePaymentById(params.paymentId),
    onSuccess: async (_, params) => {
      await invalidateInvoices(queryClient, params.invoiceId);
    },
  });
}

export function useReopenInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => reopenInvoiceById(invoiceId),
    onSuccess: async (_, invoiceId) => {
      await invalidateInvoices(queryClient, invoiceId);
    },
  });
}

export function useUpdateInvoiceCharges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { invoiceId: string; request: InvoiceChargesUpdateRequest }) =>
      updateInvoiceCharges(params.invoiceId, params.request),
    onSuccess: async (_, params) => {
      await invalidateInvoices(queryClient, params.invoiceId);
    },
  });
}
