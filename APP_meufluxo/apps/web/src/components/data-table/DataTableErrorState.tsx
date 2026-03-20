"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

export function DataTableErrorState({
  title = "Não foi possível carregar os dados",
  description,
  colSpan,
}: {
  title?: string;
  description?: string;
  colSpan: number;
}) {
  return (
    <tbody>
      <tr>
        <td colSpan={colSpan} className="px-3 py-10">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="space-y-1">
              <div className="text-sm font-medium text-foreground">{title}</div>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

