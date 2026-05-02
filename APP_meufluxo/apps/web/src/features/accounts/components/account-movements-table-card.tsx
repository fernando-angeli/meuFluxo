"use client";

import type { PageResponse } from "@meufluxo/types";

import { DataTable } from "@/components/data-table/DataTable";
import type { DataTableColumn, DataTableSortState } from "@/components/data-table/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CashMovementListItem } from "@/features/cash-movements/cash-movements-list.service";

export function AccountMovementsTableCard({
  columns,
  data,
  loading,
  error,
  pageResponse,
  sortState,
  onSortChange,
  onPageChange,
  onPageSizeChange,
}: {
  columns: Array<DataTableColumn<CashMovementListItem>>;
  data: CashMovementListItem[];
  loading: boolean;
  error: string | null;
  pageResponse: PageResponse<CashMovementListItem> | null;
  sortState: DataTableSortState;
  onSortChange: (sortKey: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lançamentos da conta</CardTitle>
        <p className="text-sm text-muted-foreground">
          Lista paginada com os mesmos filtros; a coluna Saldo é o saldo após cada lançamento no período
          (âncora no saldo atual da conta).
        </p>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          error={error}
          pageResponse={pageResponse}
          sortState={sortState}
          onSortChange={onSortChange}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          getRowKey={(row) => row.id}
          emptyTitle="Nenhum lançamento neste período"
          emptyDescription="Ajuste categoria, subcategoria ou intervalo de datas nos filtros acima."
          pageSizeOptions={[10, 20, 50]}
        />
      </CardContent>
    </Card>
  );
}
