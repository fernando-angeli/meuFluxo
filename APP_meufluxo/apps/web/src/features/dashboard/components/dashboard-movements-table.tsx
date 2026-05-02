"use client";

import * as React from "react";

import { DataTable } from "@/components/data-table/DataTable";
import type { DashboardFiltersValue } from "@/components/filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CashMovementListItem } from "@/features/cash-movements/cash-movements-list.service";
import {
  buildDashboardMovementsListExtraParams,
  fetchDashboardMovementsPage,
} from "@/features/dashboard/dashboard-movements-list.service";
import { getDashboardMovementsColumns } from "@/features/dashboard/dashboard-movements.columns";
import { useAuthOptional } from "@/hooks/useAuth";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useTranslation } from "@/lib/i18n";
import { getQueryErrorMessage } from "@/lib/query-error";

type DashboardMovementsTableProps = {
  filters: DashboardFiltersValue;
};

export function DashboardMovementsTable({ filters }: DashboardMovementsTableProps) {
  const { t } = useTranslation();
  const auth = useAuthOptional();
  const extraQueryParams = React.useMemo(
    () => buildDashboardMovementsListExtraParams(filters),
    [filters],
  );

  const table = useServerDataTable<CashMovementListItem>({
    queryKey: ["dashboard", "movements"],
    fetchPage: fetchDashboardMovementsPage,
    initialPageSize: 20,
    initialSortKey: "occurredAt",
    initialDirection: "desc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams,
  });

  const pageResponse = table.pageResponseQuery.data ?? null;
  const rows = pageResponse?.content ?? [];
  const errorMessage = table.pageResponseQuery.isError
    ? getQueryErrorMessage(table.pageResponseQuery.error, "Não foi possível carregar as movimentações.")
    : null;

  const columns = React.useMemo(() => getDashboardMovementsColumns(), []);

  const showAccountNote = filters.accountIds.length > 1;
  const showCategoryNote = filters.categoryIds.length > 1;
  const showSubNote = filters.subcategoryIds.length > 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Movimentações</CardTitle>
        <p className="text-xs text-muted-foreground">
          {filters.includeProjections
            ? t("dashboard.movementsTable.hintWithProjections")
            : t("dashboard.movementsTable.hintCashOnly")}
        </p>
        {filters.includeProjections ? (
          <p className="text-xs text-muted-foreground">{t("dashboard.movementsTable.mergeNote")}</p>
        ) : null}
        {showAccountNote || showCategoryNote || showSubNote ? (
          <p className="text-xs text-amber-700 dark:text-amber-500">
            {showAccountNote
              ? "A consulta paginada usa apenas a primeira conta selecionada. "
              : null}
            {showCategoryNote
              ? "Somente uma categoria por vez é enviada à API; refine para uma categoria. "
              : null}
            {showSubNote
              ? "Somente uma subcategoria por vez é enviada à API; refine para uma subcategoria."
              : null}
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={rows}
          loading={table.pageResponseQuery.isLoading}
          error={errorMessage}
          pageResponse={pageResponse}
          sortState={{ sortKey: table.sortKey, direction: table.direction }}
          onSortChange={table.onSortChange}
          onPageChange={table.onPageChange}
          onPageSizeChange={table.onPageSizeChange}
          getRowKey={(row) => row.id}
          emptyTitle="Nenhuma movimentação no período"
          emptyDescription="Ajuste o período ou os filtros para ver lançamentos."
          pageSizeOptions={[10, 20, 50]}
        />
      </CardContent>
    </Card>
  );
}
