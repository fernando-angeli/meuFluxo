"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReactNode } from "react";

import type { CreditCardExpense } from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";

import type { DataTableColumn } from "@/components/data-table/types";

import { CreditCardExpenseStatusBadge } from "./components/credit-card-expense-status-badge";

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

function installmentLabel(expense: CreditCardExpense) {
  if (!expense.installmentNumber || !expense.installmentCount) return "Única";
  return `${expense.installmentNumber}/${expense.installmentCount}`;
}

export function getCreditCardExpensesColumns({
  currency,
  renderActions,
}: {
  currency: "BRL" | "USD" | "EUR";
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
      sortable: true,
      sortKey: "creditCardName",
      render: (expense) => expense.creditCardName || "—",
    },
    {
      key: "invoiceReference",
      title: "Fatura",
      sortable: true,
      sortKey: "invoiceReference",
      render: (expense) => expense.invoiceReference || "—",
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "categoryName",
      title: "Categoria",
      sortable: true,
      sortKey: "categoryName",
      render: (expense) => expense.categoryName || "—",
    },
    {
      key: "subcategoryName",
      title: "Subcategoria",
      sortable: true,
      sortKey: "subcategoryName",
      render: (expense) => expense.subcategoryName || "—",
    },
    {
      key: "purchaseDate",
      title: "Data",
      sortable: true,
      sortKey: "purchaseDate",
      render: (expense) => formatDate(expense.purchaseDate),
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "installment",
      title: "Parcela",
      render: (expense) => installmentLabel(expense),
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "amount",
      title: "Valor",
      sortable: true,
      sortKey: "amount",
      align: "right",
      render: (expense) => formatCurrency(expense.amount, currency),
      cellClassName: "tabular-nums",
    },
    {
      key: "status",
      title: "Situação",
      render: (expense) => (
        <CreditCardExpenseStatusBadge
          status={expense.status}
          label={expense.statusLabel}
        />
      ),
    },
    {
      key: "actions",
      title: "Ações",
      align: "right",
      width: 96,
      cellClassName: "text-right",
      render: (expense) => renderActions(expense),
    },
  ];
}
