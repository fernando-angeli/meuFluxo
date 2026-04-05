"use client";

import type { ExpenseRecord } from "@meufluxo/types";
import { ExpenseSettleModal } from "@/features/expenses/components/expense-settle-modal";

export function IncomeSettleModal({
  open,
  onOpenChange,
  income,
  categoryName,
  subCategoryName,
  accounts,
  onSettled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: ExpenseRecord | null;
  categoryName: string;
  subCategoryName: string | null;
  accounts: Array<{ id: string; name: string }>;
  onSettled: () => void;
}) {
  return (
    <ExpenseSettleModal
      open={open}
      onOpenChange={onOpenChange}
      expense={income}
      categoryName={categoryName}
      subCategoryName={subCategoryName}
      accounts={accounts}
      onSettled={onSettled}
      mode="income"
      labels={{
        title: "Baixa manual do recebimento",
        expectedAmount: "Valor previsto",
        dueDate: "Vencimento",
        suggestedAccount: "Conta de destino sugerida",
        actualAmount: "Valor recebido/real",
        settledDate: "Data do recebimento",
        settledAccount: "Conta de destino",
        success: "Recebimento confirmado com sucesso.",
        submit: "Confirmar recebimento",
        submitting: "Confirmando...",
        submitError: "Não foi possível confirmar o recebimento.",
      }}
    />
  );
}
