"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CreditCardExpenseCreateRequest,
  CreditCardExpenseUpdateRequest,
} from "@meufluxo/types";

import {
  cancelCreditCardExpense,
  createCreditCardExpense,
  updateCreditCardExpense,
} from "@/features/credit-card-expenses/credit-card-expenses.service";

export const creditCardExpensesQueryKey = ["credit-card-expenses"] as const;

export function useCreateCreditCardExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreditCardExpenseCreateRequest) =>
      createCreditCardExpense(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creditCardExpensesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useUpdateCreditCardExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; request: CreditCardExpenseUpdateRequest }) =>
      updateCreditCardExpense(params.id, params.request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creditCardExpensesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useCancelCreditCardExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelCreditCardExpense(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creditCardExpensesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
