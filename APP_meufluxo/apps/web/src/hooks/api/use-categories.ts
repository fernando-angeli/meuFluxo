"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { fetchCategoriesListAll } from "@/features/categories/categories.service";
import { env } from "@/lib/env";

export const categoriesQueryKey = ["categories"] as const;

export function useCategories() {
  const auth = useAuthOptional();

  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: () =>
      env.useMocks ? Promise.resolve([]) : fetchCategoriesListAll(),
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
