"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreditCardId } from "@meufluxo/types";
import type {
  CreditCardActiveRequest,
  CreditCardCreateRequest,
  CreditCardUpdateRequest,
} from "@meufluxo/api-client";

import {
  createCreditCard,
  updateCreditCard,
  updateCreditCardActive,
} from "@/features/credit-cards/credit-cards.service";

import { creditCardsQueryKey } from "./use-credit-cards";

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
