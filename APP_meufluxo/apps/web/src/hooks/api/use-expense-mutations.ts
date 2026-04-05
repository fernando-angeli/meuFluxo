"use client";

import { useMutation } from "@tanstack/react-query";

import type {
  ExpenseBatchCreateRequest,
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
} from "@meufluxo/types";
import {
  createExpenseBatch,
  createSingleExpense,
  updateExpense,
} from "@/features/expenses/expenses.service";

export function useCreateSingleExpense() {
  return useMutation({
    mutationFn: (request: ExpenseCreateRequest) => createSingleExpense(request),
  });
}

export function useCreateExpenseBatch() {
  return useMutation({
    mutationFn: (request: ExpenseBatchCreateRequest) => createExpenseBatch(request),
  });
}

export function useUpdateExpense() {
  return useMutation({
    mutationFn: (params: { id: string; request: ExpenseUpdateRequest }) =>
      updateExpense(params.id, params.request),
  });
}
