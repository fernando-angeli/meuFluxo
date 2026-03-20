"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { env } from "@/lib/env";
import { mockSubCategories } from "@/services/mocks/categories";

export const subCategoriesQueryKey = ["sub-categories"] as const;

export function useSubCategories() {
  const auth = useAuthOptional();

  return useQuery({
    queryKey: subCategoriesQueryKey,
    queryFn: () => (env.useMocks ? Promise.resolve(mockSubCategories) : Promise.resolve([])),
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
