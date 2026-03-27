"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { env } from "@/lib/env";
import { fetchSubcategoriesListAll } from "@/features/categories/subcategories.service";
import { mockSubCategories } from "@/services/mocks/categories";

/** Lista global para filtros; prefixo `subcategories` permite invalidar junto com listas por categoria. */
export const subCategoriesQueryKey = ["subcategories", "all"] as const;

/** Lista global de subcategorias (ex.: filtros do dashboard). */
export function useSubCategories(options?: { realOnly?: boolean }) {
  const auth = useAuthOptional();
  const realOnly = options?.realOnly ?? false;

  return useQuery({
    queryKey: [...subCategoriesQueryKey, realOnly ? "real-only" : "default"] as const,
    queryFn: () =>
      env.useMocks && !realOnly
        ? Promise.resolve(mockSubCategories)
        : fetchSubcategoriesListAll(),
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
