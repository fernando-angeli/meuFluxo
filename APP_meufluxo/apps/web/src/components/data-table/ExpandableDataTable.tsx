"use client";

import * as React from "react";

import type { PageResponse } from "@meufluxo/types";

import type { DataTableColumn, DataTableSortState } from "./types";
import { DataTable } from "./DataTable";

/**
 * Atalho semântico para {@link DataTable} com linha expansível (cadastros pai-filho).
 * Mesmo componente subjacente — agrupa props para clareza em telas hierárquicas.
 */
export type ExpandableDataTableProps<T> = {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  loading: boolean;
  error?: string | null;
  pageResponse: PageResponse<T> | null;
  sortState: DataTableSortState;
  onSortChange: (sortKey: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick?: (row: T) => void;
  getRowKey: (row: T) => React.Key;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSizeOptions?: number[];
  className?: string;
  expandedRowKey: React.Key | null;
  renderExpandedRow: (row: T) => React.ReactNode;
};

export function ExpandableDataTable<T>(props: ExpandableDataTableProps<T>) {
  return <DataTable {...props} />;
}
