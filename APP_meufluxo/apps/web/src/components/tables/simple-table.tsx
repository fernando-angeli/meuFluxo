import type React from "react";

import { cn } from "@/lib/utils";

export function SimpleTable({
  columns,
  rows,
}: {
  columns: Array<{ key: string; header: string; className?: string }>;
  rows: Array<Record<string, React.ReactNode>>;
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
            <tr key={idx} className="hover:bg-accent/40">
              {columns.map((c) => (
                <td key={c.key} className={cn("border-b px-3 py-2 text-sm", c.className)}>
                  {row[c.key] ?? null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

