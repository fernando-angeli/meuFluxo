"use client";

import { CheckCircle2, CircleX, Pencil, Trash2 } from "lucide-react";

import type { ExpenseRecord } from "@meufluxo/types";
import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function ExpenseRowActions({
  expense,
  onEdit,
  onDelete,
  onSettle,
  onUnsettle,
  deleting,
  labels,
}: {
  expense: ExpenseRecord;
  onEdit: (expense: ExpenseRecord) => void;
  onDelete: (expense: ExpenseRecord) => void;
  onSettle: (expense: ExpenseRecord) => void;
  onUnsettle: (expense: ExpenseRecord) => void;
  deleting?: boolean;
  labels?: {
    edit?: string;
    delete?: string;
    settle?: string;
    cancel?: string;
    editAria?: string;
    deleteAria?: string;
    settleAria?: string;
    unsettleAria?: string;
  };
}) {
  const actionsOpened: RowActionButtonItem[] = [
    {
      key: "edit",
      label: labels?.edit ?? "Editar",
      icon: Pencil,
      ariaLabel: labels?.editAria ?? "Editar despesa",
      onClick: () => onEdit(expense),
    },
    {
      key: "delete",
      label: labels?.delete ?? "Excluir",
      icon: Trash2,
      ariaLabel: labels?.deleteAria ?? "Excluir despesa",
      disabled: expense.status === "OPEN",
      onClick: () => onDelete(expense),
    },
    {
      key: "settle",
      label: labels?.settle ?? "Baixar",
      icon: CheckCircle2,
      ariaLabel: labels?.settleAria ?? "Baixar despesa",
      onClick: () => onSettle(expense),
    },
  ];

  const actionsClosed: RowActionButtonItem[] = [
    {
      key: "unsettle",
      label: labels?.unsettle ?? "Cancelar baixa",
      icon: CircleX,
      ariaLabel: labels?.unsettleAria ?? "Cancelar baixa da despesa",
      onClick: () => onUnsettle(expense),
    }
  ];

  const selectedActions = expense.status === "COMPLETED" ? actionsClosed : actionsOpened;
  return (
    <RowActionButtons
      actions={selectedActions.map((action) => ({
        ...action,
        buttonClassName: "h-10 w-10",
      }))}
      density="default"
      className="justify-center gap-2"
    />
  );
}

