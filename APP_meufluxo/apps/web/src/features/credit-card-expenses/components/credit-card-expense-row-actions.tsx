"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { CreditCardExpense } from "@meufluxo/types";

import { RowActionButtons } from "@/components/patterns";

export function CreditCardExpenseRowActions({
  expense,
  onEdit,
  onCancel,
  canceling,
}: {
  expense: CreditCardExpense;
  onEdit: (expense: CreditCardExpense) => void;
  onCancel: (expense: CreditCardExpense) => void;
  canceling?: boolean;
}) {
  const blockedByStatus = expense.status !== "OPEN";

  return (
    <RowActionButtons
      actions={[
        {
          key: "edit",
          label: blockedByStatus ? "Edição indisponível para este status" : "Editar",
          icon: Pencil,
          ariaLabel: "Editar despesa do cartão",
          disabled: blockedByStatus,
          onClick: () => onEdit(expense),
        },
        {
          key: "cancel",
          label: blockedByStatus ? "Cancelamento indisponível para este status" : "Cancelar",
          icon: Trash2,
          ariaLabel: "Cancelar despesa do cartão",
          disabled: blockedByStatus || canceling,
          onClick: () => onCancel(expense),
        },
      ]}
      density="default"
      className="justify-center gap-2"
    />
  );
}
