"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  SubCategoryCreateRequest,
  SubCategoryUpdateRequest,
} from "@meufluxo/api-client";

import {
  createSubcategory,
  deleteSubcategory,
  updateSubcategory,
} from "@/features/categories/subcategories.service";

import { categoriesQueryKey } from "./use-categories";

export function useCreateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SubCategoryCreateRequest) => createSubcategory(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
    },
  });
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; request: SubCategoryUpdateRequest }) =>
      updateSubcategory(params.id, params.request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
    },
  });
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSubcategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
    },
  });
}
