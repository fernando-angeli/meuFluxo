"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { BrandCard, CreditCardId } from "@meufluxo/types";

import {
  createCreditCard,
  deleteCreditCard,
  updateCreditCard,
  updateCreditCardActive,
} from "@/features/credit-cards/credit-cards.service";

import { creditCardExpensesQueryKey } from "./use-credit-card-expense-mutations";
import { creditCardsQueryKey } from "./use-credit-cards";

type CreditCardCreateRequest = {
  name: string;
  brand: BrandCard;
  closingDay: number;
  dueDay: number;
  creditLimit?: number | null;
  defaultPaymentAccountId?: number | null;
  notes?: string | null;
  active: boolean;
};

type CreditCardUpdateRequest = CreditCardCreateRequest;

type CreditCardActiveRequest = {
  active: boolean;
};

export function useCreateCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreditCardCreateRequest) => createCreditCard(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creditCardsQueryKey });
    },
  });
}

export function useUpdateCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: CreditCardId; request: CreditCardUpdateRequest }) =>
      updateCreditCard(params.id, params.request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creditCardsQueryKey });
    },
  });
}

export function useUpdateCreditCardActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: CreditCardId; request: CreditCardActiveRequest }) =>
      updateCreditCardActive(params.id, params.request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creditCardsQueryKey });
    },
  });
}

export function useDeleteCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: CreditCardId) => deleteCreditCard(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creditCardsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["credit-card-details"] });
      await queryClient.invalidateQueries({ queryKey: ["card-manager"] });
      await queryClient.invalidateQueries({ queryKey: creditCardExpensesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
