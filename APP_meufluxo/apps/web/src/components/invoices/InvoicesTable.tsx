"use client";

import type { Invoice, PageResponse } from "@meufluxo/types";

import { DataTable } from "@/components/data-table/DataTable";
import type { DataTableColumn, DataTableSortState } from "@/components/data-table/types";

export function InvoicesTable({
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
  columns: Array<DataTableColumn<Invoice>>;
  data: Invoice[];
  loading: boolean;
  error?: string | null;
  pageResponse: PageResponse<Invoice> | null;
  sortState: DataTableSortState;
  onSortChange: (sortKey: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  return (
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
      getRowKey={(invoice) => invoice.id}
      emptyTitle="Nenhuma fatura encontrada"
      emptyDescription="Ajuste os filtros para consultar as faturas."
      pageSizeOptions={[10, 20, 50]}
    />
  );
}
