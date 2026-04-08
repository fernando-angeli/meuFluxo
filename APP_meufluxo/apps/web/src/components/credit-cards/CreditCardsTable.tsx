"use client";

import type { CreditCard, PageResponse } from "@meufluxo/types";

import { DataTable } from "@/components/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSortState,
} from "@/components/data-table/types";

export function CreditCardsTable({
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
  columns: Array<DataTableColumn<CreditCard>>;
  data: CreditCard[];
  loading: boolean;
  error?: string | null;
  pageResponse: PageResponse<CreditCard> | null;
  sortState: DataTableSortState;
  onSortChange: (sortKey: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick?: (creditCard: CreditCard) => void;
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
      getRowKey={(card) => card.id}
      emptyTitle="Nenhum cartão encontrado"
      emptyDescription="Nenhum cartão cadastrado para este workspace."
      pageSizeOptions={[10, 20, 50]}
    />
  );
}
