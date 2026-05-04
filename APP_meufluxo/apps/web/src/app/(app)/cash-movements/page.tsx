"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { useCategories, useSubCategories } from "@/hooks/api";
import { DataTable } from "@/components/data-table/DataTable";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { getQueryErrorMessage } from "@/lib/query-error";
import { getDefaultDashboardDateRange } from "@/features/dashboard/lib/date-range";
import {
  CashMovementsFilterHeader,
  type CashMovementsFilterState,
} from "@/features/cash-movements/components/cash-movements-filter-header";
import { fetchCashMovementsPage, type CashMovementListItem } from "@/features/cash-movements/cash-movements-list.service";
import { getCashMovementsColumns } from "@/features/cash-movements/cash-movements.columns";

export default function CashMovementsPage() {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories({ realOnly: true, activeOnly: true });
  const { data: subCategories = [] } = useSubCategories({ realOnly: true, activeOnly: true });

  const [filters, setFilters] = React.useState<CashMovementsFilterState>({
    accountIds: [],
    movementType: "ALL",
    categoryId: "",
    subCategoryId: "",
    dateRange: getDefaultDashboardDateRange(),
  });

  const availableSubCategories = React.useMemo(() => {
    if (!filters.categoryId) return [];
    return subCategories.filter((item) => item.category.id === filters.categoryId);
  }, [filters.categoryId, subCategories]);

  const availableCategories = React.useMemo(() => {
    if (filters.movementType === "ALL") return categories;
    return categories.filter((item) => item.movementType === filters.movementType);
  }, [categories, filters.movementType]);

  const table = useServerDataTable<CashMovementListItem>({
    queryKey: ["cash-movements"],
    fetchPage: fetchCashMovementsPage,
    initialPageSize: 20,
    initialSortKey: "occurredAt",
    initialDirection: "desc",
    extraQueryParams: {
      ...(filters.accountIds[0] != null ? { accountId: String(filters.accountIds[0]) } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.subCategoryId ? { subCategoryId: filters.subCategoryId } : {}),
      ...(filters.movementType !== "ALL" ? { movementType: filters.movementType } : {}),
      ...(filters.dateRange.startDate ? { startDate: filters.dateRange.startDate } : {}),
      ...(filters.dateRange.endDate ? { endDate: filters.dateRange.endDate } : {}),
    },
  });

  const filterKey = React.useMemo(
    () =>
      JSON.stringify({
        accountIds: filters.accountIds,
        movementType: filters.movementType,
        categoryId: filters.categoryId,
        subCategoryId: filters.subCategoryId,
        dateRange: filters.dateRange,
      }),
    [filters],
  );

  React.useEffect(() => {
    table.onReset();
  }, [filterKey, table]);

  const pageResponse = table.pageResponseQuery.data ?? null;
  const rows = pageResponse?.content ?? [];
  const errorMessage = table.pageResponseQuery.isError
    ? getQueryErrorMessage(table.pageResponseQuery.error, "Não foi possível carregar os movimentos.")
    : null;
  const columns = React.useMemo(() => getCashMovementsColumns(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.cashMovements.title")}
        description="Movimentações reais (confirmadas) do workspace."
      />

      <CashMovementsFilterHeader
        filters={filters}
        onChange={setFilters}
        categoryOptions={availableCategories.map((item) => ({ id: item.id, name: item.name }))}
        subCategoryOptions={availableSubCategories.map((item) => ({ id: item.id, name: item.name }))}
      />
      {filters.accountIds.length > 1 ? (
        <p className="text-xs text-muted-foreground">
          A API atual aceita apenas uma conta por consulta. Foi usada a primeira conta selecionada.
        </p>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Extrato</CardTitle>
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
            emptyTitle="Nenhum movimento encontrado"
            emptyDescription="Ajuste os filtros para consultar o extrato."
            pageSizeOptions={[10, 20, 50]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

