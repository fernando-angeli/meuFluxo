"use client";

import { Pencil, Trash2 } from "lucide-react";

import type { CreditCardExpense } from "@meufluxo/types";

import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function CreditCardExpenseRowActions({
  expense,
  onEdit,
  onCancel,
  isCancelling,
}: {
  expense: CreditCardExpense;
  onEdit: (expense: CreditCardExpense) => void;
  onCancel: (expense: CreditCardExpense) => void;
  isCancelling?: boolean;
}) {
  const canEdit = expense.status === "OPEN";

  const actions: RowActionButtonItem[] = [
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      ariaLabel: "Editar gasto do cartão",
      disabled: !canEdit,
      onClick: () => onEdit(expense),
    },
    {
      key: "cancel",
      label: "Cancelar",
      icon: Trash2,
      ariaLabel: "Cancelar gasto do cartão",
      disabled: !canEdit || isCancelling,
      onClick: () => onCancel(expense),
    },
  ];

  return <RowActionButtons actions={actions} density="default" className="justify-end" />;
}
