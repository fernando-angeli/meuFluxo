"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockNotifications } from "@/services/mocks/notifications";

export const notificationsQueryKey = (params?: { status?: string }) =>
  ["notifications", params] as const;

export function useNotifications(params?: { status?: string }) {
  return useQuery({
    queryKey: notificationsQueryKey(params),
    queryFn: () =>
      env.useMocks
        ? Promise.resolve(mockNotifications)
        : api.notifications.list(params),
  });
}
