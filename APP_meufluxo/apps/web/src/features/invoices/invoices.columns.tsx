"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReactNode } from "react";

import type { Invoice } from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";

import type { DataTableColumn } from "@/components/data-table/types";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";

function formatDueDate(value: string): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function getInvoicesTableColumns({
  renderActions,
}: {
  renderActions: (invoice: Invoice) => ReactNode;
}): Array<DataTableColumn<Invoice>> {
  return [
    {
      key: "creditCardName",
      title: "Cartão",
      sortable: true,
      sortKey: "creditCardName",
      render: (invoice) => invoice.cardDisplayName || invoice.creditCardName || "—",
      cellClassName: "font-medium",
    },
    {
      key: "referenceLabel",
      title: "Referência",
      sortable: true,
      sortKey: "referenceLabel",
      dataIndex: "referenceLabel",
    },
    {
      key: "dueDate",
      title: "Vencimento",
      sortable: true,
      sortKey: "dueDate",
      render: (invoice) => formatDueDate(invoice.dueDate),
    },
    {
      key: "purchasesAmount",
      title: "Compras do período",
      sortable: true,
      sortKey: "purchasesAmount",
      align: "right",
      render: (invoice) => (
        <span className="tabular-nums">{formatCurrency(invoice.purchasesAmount, "BRL")}</span>
      ),
    },
    {
      key: "previousBalance",
      title: "Saldo anterior",
      sortable: true,
      sortKey: "previousBalance",
      align: "right",
      render: (invoice) => (
        <span className="tabular-nums">{formatCurrency(invoice.previousBalance, "BRL")}</span>
      ),
    },
    {
      key: "totalAmount",
      title: "Total",
      sortable: true,
      sortKey: "totalAmount",
      align: "right",
      render: (invoice) => (
        <span className="tabular-nums">{formatCurrency(invoice.totalAmount, "BRL")}</span>
      ),
    },
    {
      key: "paidAmount",
      title: "Pago",
      sortable: true,
      sortKey: "paidAmount",
      align: "right",
      render: (invoice) => (
        <span className="tabular-nums">{formatCurrency(invoice.paidAmount, "BRL")}</span>
      ),
    },
    {
      key: "remainingAmount",
      title: "Saldo pendente",
      sortable: true,
      sortKey: "remainingAmount",
      align: "right",
      render: (invoice) => (
        <span className="tabular-nums">{formatCurrency(invoice.remainingAmount, "BRL")}</span>
      ),
    },
    {
      key: "status",
      title: "Situação",
      sortable: true,
      sortKey: "status",
      render: (invoice) => <InvoiceStatusBadge status={invoice.status} />,
    },
    {
      key: "actions",
      title: "Ações",
      align: "right",
      width: 110,
      render: (invoice) => renderActions(invoice),
    },
  ];
}
