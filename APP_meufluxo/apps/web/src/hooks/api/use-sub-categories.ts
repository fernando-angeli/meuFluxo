"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { env } from "@/lib/env";
import { fetchSubcategoriesListAll } from "@/features/categories/subcategories.service";
import { mockSubCategories } from "@/services/mocks/categories";

/** Lista global para filtros; prefixo `subcategories` permite invalidar junto com listas por categoria. */
export const subCategoriesQueryKey = ["subcategories", "all"] as const;

/** Lista global de subcategorias (ex.: filtros do dashboard). */
export function useSubCategories() {
  const auth = useAuthOptional();

  return useQuery({
    queryKey: subCategoriesQueryKey,
    queryFn: () =>
      env.useMocks ? Promise.resolve(mockSubCategories) : fetchSubcategoriesListAll(),
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
