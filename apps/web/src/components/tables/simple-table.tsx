import type React from "react";

import { cn } from "@/lib/utils";

export function SimpleTable({
  columns,
  rows,
  onRowClick,
  getRowKey,
}: {
  columns: Array<{
    key: string;
    header: string;
    className?: string;
    render?: (row: Record<string, unknown>) => React.ReactNode;
  }>;
  rows: Array<Record<string, unknown>>;
  onRowClick?: (row: Record<string, unknown>, rowIndex: number) => void;
  getRowKey?: (row: Record<string, unknown>, rowIndex: number) => React.Key;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground",
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={getRowKey ? getRowKey(row, idx) : idx}
              className={cn("hover:bg-accent/40", onRowClick && "cursor-pointer")}
              onClick={() => onRowClick?.(row, idx)}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("border-b px-3 py-2 text-sm", c.className)}>
                  {c.render ? c.render(row) : (row[c.key] as React.ReactNode) ?? null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

