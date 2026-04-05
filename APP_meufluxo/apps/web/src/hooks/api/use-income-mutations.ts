"use client";

import { useMutation } from "@tanstack/react-query";

import type {
  ExpenseBatchCreateRequest,
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
  ExpenseSettleRequest,
} from "@meufluxo/types";
import {
  createIncomeBatch,
  createSingleIncome,
  updateIncome,
} from "@/features/income/income.service";
import { api } from "@/services/api";

export function useCreateSingleIncome() {
  return useMutation({
    mutationFn: (request: ExpenseCreateRequest) => createSingleIncome(request),
  });
}

export function useCreateIncomeBatch() {
  return useMutation({
    mutationFn: (request: ExpenseBatchCreateRequest) => createIncomeBatch(request),
  });
}

export function useUpdateIncome() {
  return useMutation({
    mutationFn: (params: { id: string; request: ExpenseUpdateRequest }) =>
      updateIncome(params.id, params.request),
  });
}

export function useCancelIncome() {
  return useMutation({
    mutationFn: (id: string) => api.income.cancel(id),
  });
}

export function useSettleIncome() {
  return useMutation({
    mutationFn: (params: { id: string; request: ExpenseSettleRequest }) =>
      api.income.settle(params.id, params.request),
  });
}
