"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockScheduledMovements } from "@/services/mocks/scheduled-movements";

export const scheduledMovementsQueryKey = (params?: { status?: string }) =>
  ["scheduled-movements", params] as const;

export function useScheduledMovements(params?: { status?: string }) {
  return useQuery({
    queryKey: scheduledMovementsQueryKey(params),
    queryFn: () =>
      env.useMocks
        ? Promise.resolve(mockScheduledMovements)
        : api.scheduledMovements.list(params),
  });
}
