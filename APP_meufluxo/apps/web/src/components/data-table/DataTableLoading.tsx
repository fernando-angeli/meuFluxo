"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function DataTableLoading({
  columnsCount,
  rowsCount = 10,
  className,
}: {
  columnsCount: number;
  rowsCount?: number;
  className?: string;
}) {
  return (
    <tbody className={cn(className)}>
      {Array.from({ length: rowsCount }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: columnsCount }).map((__, j) => (
            <td key={j} className="border-b px-3 py-2">
              <div className="h-4 w-[85%] rounded bg-muted/70" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

