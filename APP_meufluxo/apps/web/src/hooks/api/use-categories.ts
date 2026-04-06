"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { fetchCategoriesListAll } from "@/features/categories/categories.service";
import { env } from "@/lib/env";
import { mockCategories } from "@/services/mocks/categories";

export const categoriesQueryKey = ["categories"] as const;

export function useCategories(options?: { realOnly?: boolean }) {
  const auth = useAuthOptional();
  const realOnly = options?.realOnly ?? false;

  return useQuery({
    queryKey: [...categoriesQueryKey, realOnly ? "real-only" : "default"] as const,
    queryFn: () =>
      env.useMocks && !realOnly
        ? Promise.resolve(mockCategories)
        : fetchCategoriesListAll(),
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
