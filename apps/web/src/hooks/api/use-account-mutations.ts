"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/services/api";
import type {
  AccountCreateRequest,
  AccountUpdateRequest,
} from "@meufluxo/api-client";
import { accountsQueryKey } from "./use-accounts";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AccountCreateRequest) =>
      api.accounts.create(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsQueryKey });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; request: AccountUpdateRequest }) =>
      api.accounts.update(params.id, params.request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsQueryKey });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.accounts.deleteById(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsQueryKey });
    },
  });
}

