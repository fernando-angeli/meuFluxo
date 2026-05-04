import type { DashboardKpisParams } from "@meufluxo/types";

import type { DashboardFiltersValue } from "@/components/filters";

function parsePositiveLongIds(ids: string[]): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const id of ids) {
    const n = Number(id);
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

/** Converte estado da barra de filtros em parâmetros do GET /kpis/dashboard. */
export function toDashboardKpisParams(filters: DashboardFiltersValue): DashboardKpisParams {
  const { startDate, endDate } = filters.dateRange;
  const accountIds = parsePositiveLongIds(filters.accountIds);
  const categoryIds = parsePositiveLongIds(filters.categoryIds);
  const subCategoryIds = parsePositiveLongIds(filters.subcategoryIds);

  return {
    startDate,
    endDate,
    ...(accountIds.length ? { accountIds } : {}),
    ...(categoryIds.length ? { categoryIds } : {}),
    ...(subCategoryIds.length ? { subCategoryIds } : {}),
    includeProjections: filters.includeProjections,
    ...(filters.paymentMethod !== "__ALL__" && filters.paymentMethod.trim()
      ? { paymentMethod: filters.paymentMethod.trim() }
      : {}),
  };
}
