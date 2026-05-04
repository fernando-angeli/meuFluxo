"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { fetchCategoriesListAll } from "@/features/categories/categories.service";
import { env } from "@/lib/env";
import { mockCategories } from "@/services/mocks/categories";

export const categoriesQueryKey = ["categories"] as const;

export function useCategories(options?: { realOnly?: boolean; activeOnly?: boolean }) {
  const auth = useAuthOptional();
  const realOnly = options?.realOnly ?? false;
  const activeOnly = options?.activeOnly ?? false;

  return useQuery({
    queryKey: [...categoriesQueryKey, realOnly ? "real-only" : "default", activeOnly ? "active" : "all"] as const,
    queryFn: async () => {
      const list =
        env.useMocks && !realOnly ? mockCategories : await fetchCategoriesListAll();
      return activeOnly ? list.filter((c) => c.meta.active) : list;
    },
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
