"use client";

import { useMutation } from "@tanstack/react-query";

import type {
  ExpenseBatchCreateRequest,
  ExpenseBatchPreviewRequest,
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
} from "@meufluxo/types";
import {
  createExpenseBatch,
  createSingleExpense,
  previewExpenseBatch,
  updateExpense,
} from "@/features/expenses/expenses.service";

export function useCreateSingleExpense() {
  return useMutation({
    mutationFn: (request: ExpenseCreateRequest) => createSingleExpense(request),
  });
}

export function usePreviewExpenseBatch() {
  return useMutation({
    mutationFn: (request: ExpenseBatchPreviewRequest) => previewExpenseBatch(request),
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
