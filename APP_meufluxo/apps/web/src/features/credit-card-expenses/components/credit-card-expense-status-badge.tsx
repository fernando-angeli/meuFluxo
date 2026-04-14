"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getCreditCardExpenseStatusLabel,
  type CreditCardExpenseStatus,
} from "@meufluxo/types";

function getTone(status: CreditCardExpenseStatus): { dot: string; badge: string } {
  switch (status) {
    case "PAID":
      return {
        dot: "bg-emerald-500",
        badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
      };
    case "INVOICED":
      return {
        dot: "bg-blue-500",
        badge: "border-blue-500/20 bg-blue-500/10 text-blue-700",
      };
    case "CANCELED":
      return {
        dot: "bg-slate-500",
        badge: "border-slate-500/20 bg-slate-500/10 text-slate-700",
      };
    case "OPEN":
    default:
      return {
        dot: "bg-amber-500",
        badge: "border-amber-500/20 bg-amber-500/10 text-amber-700",
      };
  }
}

export function CreditCardExpenseStatusBadge({
  status,
}: {
  status: CreditCardExpenseStatus;
}) {
  const tone = getTone(status);
  return (
    <Badge variant="outline" className={cn("inline-flex items-center gap-1.5", tone.badge)}>
      <span className={cn("h-2 w-2 rounded-full", tone.dot)} aria-hidden />
      {getCreditCardExpenseStatusLabel(status)}
    </Badge>
  );
}
