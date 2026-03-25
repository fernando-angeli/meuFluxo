"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCategoryById } from "@/features/categories/categories.service";

export const categoryDetailsQueryKey = ["categories", "detail"] as const;

export function useCategoryDetails(categoryId: string | null, enabled = true) {
  return useQuery({
    queryKey: [...categoryDetailsQueryKey, categoryId],
    queryFn: () => fetchCategoryById(categoryId!),
    enabled: enabled && !!categoryId,
    staleTime: 60_000,
  });
}
