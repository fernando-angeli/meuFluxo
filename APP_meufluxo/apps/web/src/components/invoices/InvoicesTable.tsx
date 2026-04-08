"use client";

import type { CreditCardInvoiceListItem, PageResponse } from "@meufluxo/types";

import { DataTable } from "@/components/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSortState,
} from "@/components/data-table/types";

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
  onRowClick,
}: {
  columns: Array<DataTableColumn<CreditCardInvoiceListItem>>;
  data: CreditCardInvoiceListItem[];
  loading: boolean;
  error?: string | null;
  pageResponse: PageResponse<CreditCardInvoiceListItem> | null;
  sortState: DataTableSortState;
  onSortChange: (sortKey: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick?: (invoice: CreditCardInvoiceListItem) => void;
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
      getRowKey={(invoice) => invoice.id}
      emptyTitle="Nenhuma fatura encontrada"
      emptyDescription="Ajuste os filtros ou aguarde a geração de novas faturas."
      pageSizeOptions={[10, 20, 50]}
    />
  );
}
