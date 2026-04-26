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

function formatInstallmentDisplay(expense: CreditCardExpense): string {
  if (expense.installmentNumber != null) {
    return `${expense.installmentNumber}/${Math.max(1, expense.installmentCount || 1)}`;
  }

  const rawLabel = expense.installmentLabel?.trim();
  if (!rawLabel) return "1/1";
  const normalized = rawLabel.toLowerCase();
  if (normalized === "única" || normalized === "unica") return "1/1";
  if (rawLabel.includes("/")) return rawLabel;
  return "1/1";
}

export function getCreditCardExpensesColumns({
  renderActions,
}: {
  renderActions: (expense: CreditCardExpense) => ReactNode;
}): Array<DataTableColumn<CreditCardExpense>> {
  return [
    {
      key: "invoiceReference",
      title: "Fatura",
      sortable: true,
      sortKey: "purchaseDate",
      render: (expense) => expense.invoiceReference ?? "—",
    },
    {
      key: "description",
      title: "Descrição",
      dataIndex: "description",
      sortable: true,
      sortKey: "description",
      cellClassName: "font-medium",
    },
    {
      key: "installmentLabel",
      title: "Parcela",
      render: (expense) => formatInstallmentDisplay(expense),
    },
    {
      key: "purchaseDate",
      title: "Vencimento",
      sortable: true,
      sortKey: "purchaseDate",
      render: (expense) => formatDate(expense.purchaseDate),
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
