"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockCategories } from "@/services/mocks/categories";

export const categoriesQueryKey = ["categories"] as const;

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: () => (env.useMocks ? Promise.resolve(mockCategories) : api.categories.list()),
  });
}
