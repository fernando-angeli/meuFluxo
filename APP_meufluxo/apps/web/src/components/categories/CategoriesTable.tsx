"use client";

import type { Category, PageResponse } from "@meufluxo/types";

import { DataTable } from "@/components/data-table/DataTable";
import type { DataTableColumn, DataTableSortState } from "@/components/data-table/types";

export function CategoriesTable({
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
  columns: Array<DataTableColumn<Category>>;
  data: Category[];
  loading: boolean;
  error?: string | null;
  pageResponse: PageResponse<Category> | null;
  sortState: DataTableSortState;
  onSortChange: (sortKey: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick: (category: Category) => void;
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
      getRowKey={(c) => c.id}
      emptyTitle="Nenhuma categoria encontrada"
      emptyDescription="Nenhuma categoria cadastrada para este workspace."
      pageSizeOptions={[10, 20, 50]}
    />
  );
}
