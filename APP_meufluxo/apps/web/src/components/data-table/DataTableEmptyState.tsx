"use client";

import * as React from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export function DataTableEmptyState({
  title = "Nenhum registro encontrado",
  description,
  action,
  colSpan,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  colSpan: number;
}) {
  return (
    <tbody>
      <tr>
        <td colSpan={colSpan} className="px-3 py-10">
          <div className={cn("flex flex-col items-center justify-center gap-3 text-center")}>
            <Inbox className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-1">
              <div className="text-sm font-medium text-foreground">{title}</div>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {action ? <div className="mt-2">{action}</div> : null}
          </div>
        </td>
      </tr>
    </tbody>
  );
}

