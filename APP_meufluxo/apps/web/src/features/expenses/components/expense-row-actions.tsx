"use client";

import { CheckCircle2, Pencil, Trash2 } from "lucide-react";

import type { ExpenseRecord } from "@meufluxo/types";
import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function ExpenseRowActions({
  expense,
  onEdit,
  onDelete,
  onSettle,
  deleting,
}: {
  expense: ExpenseRecord;
  onEdit: (expense: ExpenseRecord) => void;
  onDelete: (expense: ExpenseRecord) => void;
  onSettle: (expense: ExpenseRecord) => void;
  deleting?: boolean;
}) {
  const actions: RowActionButtonItem[] = [
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      ariaLabel: "Editar despesa",
      onClick: () => onEdit(expense),
    },
    {
      key: "delete",
      label: "Excluir",
      icon: Trash2,
      ariaLabel: "Excluir despesa",
      disabled: deleting,
      onClick: () => onDelete(expense),
    },
    {
      key: "settle",
      label: "Baixar",
      icon: CheckCircle2,
      ariaLabel: "Baixar despesa",
      onClick: () => onSettle(expense),
    },
  ];

  return (
    <RowActionButtons
      actions={actions.map((action) => ({
        ...action,
        buttonClassName: "h-10 w-10",
      }))}
      density="default"
      className="justify-center gap-2"
    />
  );
}

