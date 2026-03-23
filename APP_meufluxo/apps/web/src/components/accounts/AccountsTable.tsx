"use client";

import type { Account, PageResponse } from "@meufluxo/types";

import { DataTable } from "@/components/data-table/DataTable";
import type { DataTableColumn, DataTableSortState } from "@/components/data-table/types";

export function AccountsTable({
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
  columns: Array<DataTableColumn<Account>>;
  data: Account[];
  loading: boolean;
  error?: string | null;
  pageResponse: PageResponse<Account> | null;
  sortState: DataTableSortState;
  onSortChange: (sortKey: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick: (account: Account) => void;
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
      getRowKey={(acc) => acc.id}
      emptyTitle="Nenhuma conta encontrada"
      emptyDescription="Nenhuma conta cadastrada para este workspace."
      pageSizeOptions={[10, 20, 50]}
    />
  );
}
