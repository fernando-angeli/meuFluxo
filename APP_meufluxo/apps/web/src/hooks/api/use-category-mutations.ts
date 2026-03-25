"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from "@meufluxo/api-client";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/features/categories/categories.service";

import { categoriesQueryKey } from "./use-categories";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CategoryCreateRequest) => createCategory(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; request: CategoryUpdateRequest }) =>
      updateCategory(params.id, params.request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
}
