"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCreditCardInvoiceStatusLabel, type CreditCardInvoiceStatus } from "@meufluxo/types";

function getStatusTone(status: CreditCardInvoiceStatus): {
  dot: string;
  badge: string;
} {
  switch (status) {
    case "PAID":
      return {
        dot: "bg-emerald-500",
        badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
      };
    case "PARTIALLY_PAID":
      return {
        dot: "bg-amber-500",
        badge: "border-amber-500/20 bg-amber-500/10 text-amber-700",
      };
    case "OVERDUE":
      return {
        dot: "bg-red-500",
        badge: "border-red-500/20 bg-red-500/10 text-red-700",
      };
    case "CLOSED":
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

export function InvoiceStatusBadge({ status }: { status: CreditCardInvoiceStatus }) {
  const tone = getStatusTone(status);
  return (
    <Badge variant="outline" className={cn("inline-flex items-center gap-1.5", tone.badge)}>
      <span className={cn("h-2 w-2 rounded-full", tone.dot)} aria-hidden />
      {getCreditCardInvoiceStatusLabel(status)}
    </Badge>
  );
}
