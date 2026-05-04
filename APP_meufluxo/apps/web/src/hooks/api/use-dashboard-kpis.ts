"use client";

import { useQuery } from "@tanstack/react-query";

import type { DashboardKpisParams } from "@meufluxo/types";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { getMockDashboardKpis } from "@/services/mocks/dashboard";

export const dashboardKpisQueryKey = (params: DashboardKpisParams) =>
  [
    "kpis",
    "dashboard",
    params.startDate,
    params.endDate,
    params.accountIds?.length ? [...params.accountIds].sort((a, b) => a - b).join(",") : "",
    params.categoryIds?.length ? [...params.categoryIds].sort((a, b) => a - b).join(",") : "",
    params.subCategoryIds?.length ? [...params.subCategoryIds].sort((a, b) => a - b).join(",") : "",
    params.movementType ?? "",
    params.paymentMethod ?? "",
    params.includeProjections === true,
  ] as const;

export function useDashboardKpis(params: DashboardKpisParams) {
  return useQuery({
    queryKey: dashboardKpisQueryKey(params),
    queryFn: () =>
      env.useMocks
        ? Promise.resolve(getMockDashboardKpis(params))
        : api.kpis.dashboard(params),
  });
}
