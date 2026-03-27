"use client";

import { useMutation } from "@tanstack/react-query";
import type { ExpenseSettleRequest } from "@meufluxo/types";

import { api } from "@/services/api";

export function useCancelExpense() {
  return useMutation({
    mutationFn: (id: string) => api.expenses.cancel(id),
  });
}

export function useSettleExpense() {
  return useMutation({
    mutationFn: (params: { id: string; request: ExpenseSettleRequest }) =>
      api.expenses.settle(params.id, params.request),
  });
}

