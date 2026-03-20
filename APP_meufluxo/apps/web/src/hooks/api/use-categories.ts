"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthOptional } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockCategories } from "@/services/mocks/categories";

export const categoriesQueryKey = ["categories"] as const;

export function useCategories() {
  const auth = useAuthOptional();

  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: () => (env.useMocks ? Promise.resolve(mockCategories) : api.categories.list()),
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });
}
