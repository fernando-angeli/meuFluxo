"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";

import type {
  ExpenseBatchCreateRequest,
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
  ExpenseSettleRequest,
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

export function useUnsettleExpense() {
  return useMutation({
    mutationFn: (id: string) => api.expenses.unsettle(id),
  });
}

