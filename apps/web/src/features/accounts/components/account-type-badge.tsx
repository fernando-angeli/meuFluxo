"use client";

import type { AccountType } from "@meufluxo/types";
import { getAccountTypeLabel } from "@meufluxo/types";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AccountTypeBadge({ type }: { type: AccountType }) {
  const className = (() => {
    switch (type) {
      case "CHECKING":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent";
      case "CASH":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-transparent";
      case "INVESTMENT":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-transparent";
      default:
        return "bg-muted text-muted-foreground border-transparent";
    }
  })();

  return (
    <Badge variant="outline" className={cn("rounded-lg", className)}>
      {getAccountTypeLabel(type)}
    </Badge>
  );
}

