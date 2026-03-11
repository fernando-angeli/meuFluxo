"use client";

import { useQuery } from "@tanstack/react-query";

import type { DashboardKpisParams } from "@meufluxo/types";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { getMockDashboardKpis } from "@/services/mocks/dashboard";

export const dashboardKpisQueryKey = (params: DashboardKpisParams) =>
  ["kpis", "dashboard", params] as const;

export function useDashboardKpis(params: DashboardKpisParams) {
  return useQuery({
    queryKey: dashboardKpisQueryKey(params),
    queryFn: () =>
      env.useMocks
        ? Promise.resolve(getMockDashboardKpis(params.startDate, params.endDate))
        : api.kpis.dashboard(params),
  });
}
