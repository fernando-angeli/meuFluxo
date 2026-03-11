import type { DashboardKpisParams, DashboardKpisResponse } from "@meufluxo/types";

import type { HttpClient } from "../http";

function buildQuery(
  params: DashboardKpisParams,
): Record<string, string | number | boolean | null | undefined> {
  const query: Record<string, string | number | boolean | null | undefined> = {
    startDate: params.startDate,
    endDate: params.endDate,
  };
  if (params.accountIds?.length) {
    query.accountIds = params.accountIds.join(",");
  }
  if (params.categoryIds?.length) {
    query.categoryIds = params.categoryIds.join(",");
  }
  return query;
}

export type KpisApi = {
  dashboard: (params: DashboardKpisParams) => Promise<DashboardKpisResponse>;
};

export function createKpisApi(http: HttpClient): KpisApi {
  return {
    dashboard: (params) =>
      http.request<DashboardKpisResponse>("/kpis/dashboard", {
        method: "GET",
        query: buildQuery(params),
      }),
  };
}
