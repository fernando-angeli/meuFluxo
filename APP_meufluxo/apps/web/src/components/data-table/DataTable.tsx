"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import type { PageResponse } from "@meufluxo/types";

import { cn } from "@/lib/utils";

import type { DataTableColumn, DataTableAlign, DataTableSortState } from "./types";
import { DataTableEmptyState } from "./DataTableEmptyState";
import { DataTableErrorState } from "./DataTableErrorState";
import { DataTableLoading } from "./DataTableLoading";
import { DataTablePagination } from "./DataTablePagination";

function alignClass(align: DataTableAlign | undefined) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function DataTable<T>({
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
  getRowKey,
  emptyTitle,
  emptyDescription,
  pageSizeOptions,
  className,
  expandedRowKey,
  renderExpandedRow,
}: {
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
  /** Quando definido com `renderExpandedRow`, exibe uma linha extra abaixo da linha correspondente. */
  expandedRowKey?: React.Key | null;
  renderExpandedRow?: (row: T) => React.ReactNode;
}) {
  const colSpan = columns.length;

  const page = pageResponse?.page ?? 0;
  const size = pageResponse?.size ?? 20;
  const totalElements = pageResponse?.totalElements ?? 0;
  const totalPages = pageResponse?.totalPages ?? 0;
  const first = pageResponse?.first ?? true;
  const last = pageResponse?.last ?? true;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left">
              {columns.map((col) => {
                const sortable = !!col.sortable && !!col.sortKey;
                const active = sortable && sortState.sortKey === col.sortKey;
                const icon = !sortable ? null : active ? (
                  sortState.direction === "asc" ? (
                    <ArrowUp className="h-4 w-4 text-foreground" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-foreground" />
                  )
                ) : (
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                );

                return (
                  <th
                    key={col.key}
                    className={cn(
                      "border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground",
                      alignClass(col.align),
                      col.headerClassName,
                    )}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => onSortChange(col.sortKey!)}
                      >
                        <span className="truncate">{col.title}</span>
                        {icon}
                      </button>
                    ) : (
                      <span className="truncate">{col.title}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {loading ? (
            <DataTableLoading columnsCount={colSpan} rowsCount={size} />
          ) : error ? (
            <DataTableErrorState colSpan={colSpan} description={error} />
          ) : data.length === 0 ? (
            <DataTableEmptyState
              colSpan={colSpan}
              title={emptyTitle ?? "Nenhum registro encontrado"}
              description={emptyDescription}
            />
          ) : (
            <tbody>
              {data.map((row) => {
                const rowKey = getRowKey(row);
                const expanded =
                  expandedRowKey != null &&
                  renderExpandedRow != null &&
                  expandedRowKey === rowKey;

                return (
                  <React.Fragment key={rowKey}>
                    <tr
                      className={cn(
                        "transition-colors hover:bg-accent/40",
                        onRowClick && "cursor-pointer",
                      )}
                      onClick={() => onRowClick?.(row)}
                      role={onRowClick ? "button" : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      onKeyDown={
                        onRowClick
                          ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onRowClick(row);
                              }
                            }
                          : undefined
                      }
                    >
                      {columns.map((col) => {
                        const content = col.render
                          ? col.render(row)
                          : col.dataIndex
                            ? ((row as Record<string, unknown>)[
                                col.dataIndex as string
                              ] as React.ReactNode)
                            : null;

                        return (
                          <td
                            key={col.key}
                            className={cn(
                              "border-b px-3 py-2 text-sm",
                              alignClass(col.align),
                              col.cellClassName,
                            )}
                          >
                            {content ?? null}
                          </td>
                        );
                      })}
                    </tr>
                    {expanded ? (
                      <tr className="bg-muted/20">
                        <td
                          colSpan={colSpan}
                          className="border-b px-3 py-3 text-sm text-muted-foreground"
                        >
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      {pageResponse ? (
        <DataTablePagination
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          first={first}
          last={last}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      ) : null}
    </div>
  );
}

