"use client";

import type { ExpenseRecord } from "@meufluxo/types";
import { ExpenseFormModal } from "@/features/expenses/components/expense-form-modal";

export function IncomeFormModal({
  open,
  onOpenChange,
  income,
  categories,
  subCategories,
  accounts,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: ExpenseRecord | null;
  categories: Array<{ id: string; name: string; movementType?: string }>;
  subCategories: Array<{ id: string; name: string; categoryId: string }>;
  accounts: Array<{ id: string; name: string }>;
  onSaved: () => void;
}) {
  return (
    <ExpenseFormModal
      open={open}
      onOpenChange={onOpenChange}
      expense={income}
      categories={categories}
      subCategories={subCategories}
      accounts={accounts}
      onSaved={onSaved}
      mode="income"
      labels={{
        createTitle: "Nova receita",
        editTitle: "Editar receita",
        updatedSuccess: "Receita atualizada com sucesso.",
        singleCreatedSuccess: "Receita criada com sucesso.",
        batchCreatedSuccess: "Receitas criadas com sucesso.",
        accountLabel: "Conta de destino",
      }}
    />
  );
}
