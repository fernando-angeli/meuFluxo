"use client";

import type { ReactNode } from "react";
import type { ExpenseRecord } from "@meufluxo/types";
import type { DataTableColumn } from "@/components/data-table/types";
import { getExpensesTableColumns } from "@/features/expenses/expenses.columns";

export function getIncomeTableColumns({
  categoryNameById,
  subCategoryNameById,
  renderActions,
}: {
  categoryNameById: Map<string, string>;
  subCategoryNameById: Map<string, string>;
  renderActions: (row: ExpenseRecord) => ReactNode;
}): Array<DataTableColumn<ExpenseRecord>> {
  return getExpensesTableColumns({
    categoryNameById,
    subCategoryNameById,
    renderActions,
    labels: {
      COMPLETED: "Recebido",
      overdueTitle: "Vencido",
      amountTitle: "Valor",
    },
  });
}
