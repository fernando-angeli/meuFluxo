import type { DashboardKpisParams, DashboardKpisResponse } from "@meufluxo/types";

import type { HttpClient } from "../http";
import type { HttpQueryValue } from "../query-params";
import {
  buildTemporalEvolutionFromMovements,
  fetchAllOpenPlannedForDashboard,
  fetchCashMovementsForDashboard,
  mapDashboardKpiApiPayload,
  mergePlannedIntoTemporalSeries,
} from "./kpis-mapper";

function buildQuery(params: DashboardKpisParams): Record<string, HttpQueryValue> {
  const query: Record<string, HttpQueryValue> = {
    startDate: params.startDate,
    endDate: params.endDate,
  };
  if (params.accountIds?.length) {
    query.accountIds = params.accountIds;
  }
  if (params.categoryIds?.length) {
    query.categoryIds = params.categoryIds;
  }
  if (params.subCategoryIds?.length) {
    query.subCategoryIds = params.subCategoryIds;
  }
  if (params.movementType) {
    query.movementType = params.movementType;
  }
  if (params.includeProjections === true) {
    query.includeProjections = true;
  }
  return query;
}

export type KpisApi = {
  dashboard: (params: DashboardKpisParams) => Promise<DashboardKpisResponse>;
};

export function createKpisApi(http: HttpClient): KpisApi {
  return {
    dashboard: async (params) => {
      const raw = await http.request<unknown>("/kpis/dashboard", {
        method: "GET",
        query: buildQuery(params),
      });
      const base = mapDashboardKpiApiPayload(raw);

      let temporalEvolution: DashboardKpisResponse["temporalEvolution"] = {
        labels: [],
        income: [],
        expenses: [],
      };

      try {
        const items = await fetchCashMovementsForDashboard(http, params);
        temporalEvolution = buildTemporalEvolutionFromMovements(
          items,
          base.startDate,
          base.endDate,
        );
        if (params.includeProjections === true) {
          try {
            const [plannedExpenses, plannedIncomes] = await Promise.all([
              fetchAllOpenPlannedForDashboard(http, "/expenses", params),
              fetchAllOpenPlannedForDashboard(http, "/income", params),
            ]);
            temporalEvolution = mergePlannedIntoTemporalSeries(
              temporalEvolution,
              plannedExpenses,
              plannedIncomes,
              base.startDate,
              base.endDate,
            );
          } catch {
            /* mantém série só com caixa */
          }
        }
      } catch {
        temporalEvolution = { labels: [], income: [], expenses: [] };
      }

      return {
        ...base,
        movements: [],
        temporalEvolution,
      };
    },
  };
}
