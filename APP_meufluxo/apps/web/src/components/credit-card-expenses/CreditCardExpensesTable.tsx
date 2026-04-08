"use client";

import type { CreditCardExpense, PageResponse } from "@meufluxo/types";

import { DataTable } from "@/components/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSortState,
} from "@/components/data-table/types";

export function CreditCardExpensesTable({
  columns,
  data,
  loading,
  error,
  pageResponse,
  sortState,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: {
  columns: Array<DataTableColumn<CreditCardExpense>>;
  data: CreditCardExpense[];
  loading: boolean;
  error?: string | null;
  pageResponse: PageResponse<CreditCardExpense> | null;
  sortState: DataTableSortState;
  onSortChange: (sortKey: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick?: (expense: CreditCardExpense) => void;
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
      onRowClick={onRowClick}
      getRowKey={(expense) => expense.id}
      emptyTitle="Nenhum gasto encontrado"
      emptyDescription="Ajuste os filtros ou cadastre um novo gasto no cartão."
      pageSizeOptions={[10, 20, 50]}
    />
  );
}
