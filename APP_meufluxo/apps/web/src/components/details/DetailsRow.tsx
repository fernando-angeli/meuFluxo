"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DetailsRow({
  label,
  value,
  highlighted = false,
}: {
  label: ReactNode;
  value: ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 items-start gap-3 rounded-lg border border-transparent px-2 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-right text-sm", highlighted && "font-semibold text-foreground")}>
        {value}
      </span>
    </div>
  );
}
