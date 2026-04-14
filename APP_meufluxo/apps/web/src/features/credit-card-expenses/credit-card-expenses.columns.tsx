"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReactNode } from "react";

import type { CreditCardExpense } from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";
import type { DataTableColumn } from "@/components/data-table/types";

import { CreditCardExpenseStatusBadge } from "./components/credit-card-expense-status-badge";

function formatDate(value: string): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function getCreditCardExpensesColumns({
  renderActions,
}: {
  renderActions: (expense: CreditCardExpense) => ReactNode;
}): Array<DataTableColumn<CreditCardExpense>> {
  return [
    {
      key: "description",
      title: "Descrição",
      dataIndex: "description",
      sortable: true,
      sortKey: "description",
      cellClassName: "font-medium",
    },
    {
      key: "creditCardName",
      title: "Cartão",
      dataIndex: "creditCardName",
      sortable: true,
      sortKey: "creditCardName",
    },
    {
      key: "invoiceReference",
      title: "Fatura",
      sortable: true,
      sortKey: "invoiceReference",
      render: (expense) => expense.invoiceReference ?? "—",
    },
    {
      key: "categoryName",
      title: "Categoria",
      sortable: true,
      sortKey: "categoryName",
      dataIndex: "categoryName",
    },
    {
      key: "subCategoryName",
      title: "Subcategoria",
      sortable: true,
      sortKey: "subCategoryName",
      render: (expense) => expense.subCategoryName ?? "—",
    },
    {
      key: "purchaseDate",
      title: "Data da compra",
      sortable: true,
      sortKey: "purchaseDate",
      render: (expense) => formatDate(expense.purchaseDate),
    },
    {
      key: "installmentLabel",
      title: "Parcela",
      render: (expense) =>
        expense.entryType === "INSTALLMENT"
          ? expense.installmentLabel ?? `1/${expense.installmentCount}`
          : "Única",
    },
    {
      key: "totalAmount",
      title: "Valor",
      sortable: true,
      sortKey: "totalAmount",
      align: "right",
      render: (expense) => (
        <span className="tabular-nums">{formatCurrency(expense.totalAmount, "BRL")}</span>
      ),
    },
    {
      key: "status",
      title: "Situação",
      sortable: true,
      sortKey: "status",
      render: (expense) => <CreditCardExpenseStatusBadge status={expense.status} />,
    },
    {
      key: "actions",
      title: "Ações",
      align: "center",
      width: 120,
      render: (expense) => renderActions(expense),
    },
  ];
}
