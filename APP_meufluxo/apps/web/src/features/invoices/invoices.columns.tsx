"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReactNode } from "react";

import type { CreditCardInvoiceListItem } from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";

import type { DataTableColumn } from "@/components/data-table/types";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function getInvoicesTableColumns({
  currency,
  renderActions,
}: {
  currency: "BRL" | "USD" | "EUR";
  renderActions: (invoice: CreditCardInvoiceListItem) => ReactNode;
}): Array<DataTableColumn<CreditCardInvoiceListItem>> {
  return [
    {
      key: "creditCardName",
      title: "Cartão",
      sortable: true,
      sortKey: "creditCardName",
      render: (invoice) => invoice.creditCardName || "—",
      cellClassName: "font-medium",
    },
    {
      key: "referenceLabel",
      title: "Referência",
      dataIndex: "referenceLabel",
      sortable: true,
      sortKey: "referenceYear",
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "dueDate",
      title: "Vencimento",
      sortable: true,
      sortKey: "dueDate",
      render: (invoice) => formatDate(invoice.dueDate),
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "purchasesAmount",
      title: "Compras do período",
      sortable: true,
      sortKey: "purchasesAmount",
      align: "right",
      render: (invoice) => formatCurrency(invoice.purchasesAmount, currency),
      cellClassName: "tabular-nums",
    },
    {
      key: "previousBalance",
      title: "Saldo anterior",
      sortable: true,
      sortKey: "previousBalance",
      align: "right",
      render: (invoice) => formatCurrency(invoice.previousBalance, currency),
      cellClassName: "tabular-nums",
    },
    {
      key: "totalAmount",
      title: "Total",
      sortable: true,
      sortKey: "totalAmount",
      align: "right",
      render: (invoice) => formatCurrency(invoice.totalAmount, currency),
      cellClassName: "tabular-nums font-medium",
    },
    {
      key: "paidAmount",
      title: "Pago",
      sortable: true,
      sortKey: "paidAmount",
      align: "right",
      render: (invoice) => formatCurrency(invoice.paidAmount, currency),
      cellClassName: "tabular-nums",
    },
    {
      key: "remainingAmount",
      title: "Saldo restante",
      sortable: true,
      sortKey: "remainingAmount",
      align: "right",
      render: (invoice) => formatCurrency(invoice.remainingAmount, currency),
      cellClassName: "tabular-nums",
    },
    {
      key: "status",
      title: "Situação",
      sortable: true,
      sortKey: "status",
      render: (invoice) => (
        <InvoiceStatusBadge status={invoice.status} label={invoice.statusLabel} />
      ),
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "actions",
      title: "Ações",
      align: "right",
      width: 150,
      cellClassName: "text-right",
      render: (invoice) => renderActions(invoice),
    },
  ];
}
