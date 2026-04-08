"use client";

import type { InvoiceStatus } from "@meufluxo/types";
import { getCreditCardInvoiceStatusLabel } from "@meufluxo/types";

import { Badge } from "@/components/ui/badge";

const VARIANT_BY_STATUS: Record<
  InvoiceStatus,
  "secondary" | "warning" | "success" | "destructive"
> = {
  OPEN: "secondary",
  CLOSED: "warning",
  PARTIALLY_PAID: "warning",
  PAID: "success",
  OVERDUE: "destructive",
};

export function InvoiceStatusBadge({
  status,
  label,
}: {
  status: InvoiceStatus;
  label?: string | null;
}) {
  const variant = VARIANT_BY_STATUS[status] ?? "secondary";
  const text = label?.trim() || getCreditCardInvoiceStatusLabel(status);

  return (
    <Badge variant={variant} className="inline-flex items-center gap-1.5 rounded-lg font-normal">
      <span className="h-1.5 w-1.5 rounded-full bg-current/80" aria-hidden />
      {text}
    </Badge>
  );
}
