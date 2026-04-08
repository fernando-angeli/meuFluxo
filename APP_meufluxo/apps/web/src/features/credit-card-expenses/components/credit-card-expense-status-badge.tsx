"use client";

import type { CreditCardExpenseStatus } from "@meufluxo/types";
import { getCreditCardExpenseStatusLabel } from "@meufluxo/types";

import { Badge } from "@/components/ui/badge";

export function CreditCardExpenseStatusBadge({
  status,
  label,
}: {
  status: CreditCardExpenseStatus;
  label?: string | null;
}) {
  return (
    <Badge
      variant={status === "OPEN" ? "secondary" : "muted"}
      className="inline-flex items-center gap-1.5 rounded-lg font-normal"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current/80" aria-hidden />
      {label?.trim() || getCreditCardExpenseStatusLabel(status)}
    </Badge>
  );
}
