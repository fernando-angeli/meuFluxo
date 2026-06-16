"use client";

import type { ExpenseRecord } from "@meufluxo/types";
import { ExpenseRowActions } from "@/features/expenses/components/expense-row-actions";

export function IncomeRowActions({
  income,
  onEdit,
  onDelete,
  onSettle,
  deleting,
  onUnsettle,
}: {
  income: ExpenseRecord;
  onEdit: (income: ExpenseRecord) => void;
  onDelete: (income: ExpenseRecord) => void;
  onSettle: (income: ExpenseRecord) => void;
  deleting?: boolean;
  onUnsettle: (income: ExpenseRecord) => void;
}) {
  return (
    <ExpenseRowActions
      expense={income}
      deleting={deleting}
      onEdit={onEdit}
      onDelete={onDelete}
      onSettle={onSettle}
      onUnsettle={onUnsettle}
      labels={{
        settle: "Receber",
        settleAria: "Marcar como recebido",
        editAria: "Editar receita",
        deleteAria: "Cancelar receita",
        unsettle: "Cancelar recebimento",
        unsettleAria: "Cancelar recebimento da receita",
      }}
    />
  );
}
