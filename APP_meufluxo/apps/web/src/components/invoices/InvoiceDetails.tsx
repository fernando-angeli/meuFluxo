"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as React from "react";

import type {
  CreditCardInvoiceDetails,
  CreditCardInvoiceDetailsExpenseItem,
  CreditCardInvoiceDetailsPaymentItem,
} from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";

import { DataTable } from "@/components/data-table/DataTable";
import type { DataTableColumn } from "@/components/data-table/types";
import { DetailsRow, DetailsSection } from "@/components/details";
import {
  SectionEmptyState,
  SectionErrorState,
  SectionLoadingState,
} from "@/components/patterns";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

function installmentLabel(item: CreditCardInvoiceDetailsExpenseItem) {
  if (!item.installmentNumber || !item.installmentCount) return "—";
  return `${item.installmentNumber}/${item.installmentCount}`;
}

function summaryItems(invoice: CreditCardInvoiceDetails) {
  return [
    { label: "Compras do período", value: invoice.purchasesAmount },
    { label: "Saldo anterior", value: invoice.previousBalance },
    { label: "Juros rotativo", value: invoice.revolvingInterest },
    { label: "Multa", value: invoice.lateFee },
    { label: "Outras tarifas", value: invoice.otherCharges },
    { label: "Total", value: invoice.totalAmount },
    { label: "Pago", value: invoice.paidAmount },
    { label: "Saldo pendente", value: invoice.remainingAmount },
  ] as const;
}

const invoiceItemsSortState = { sortKey: null, direction: "asc" as const };
const invoicePaymentsSortState = { sortKey: null, direction: "asc" as const };

export function InvoiceDetails({
  invoice,
  currency,
  loading = false,
  error = null,
}: {
  invoice: CreditCardInvoiceDetails | null;
  currency: "BRL" | "USD" | "EUR";
  loading?: boolean;
  error?: string | null;
}) {
  const itemColumns = React.useMemo<Array<DataTableColumn<CreditCardInvoiceDetailsExpenseItem>>>(
    () => [
      { key: "description", title: "Descrição", dataIndex: "description", cellClassName: "font-medium" },
      {
        key: "category",
        title: "Categoria",
        render: (item) => item.categoryName || "—",
      },
      {
        key: "subcategory",
        title: "Subcategoria",
        render: (item) => item.subcategoryName || "—",
      },
      {
        key: "purchaseDate",
        title: "Data da compra",
        render: (item) => formatDate(item.purchaseDate),
      },
      {
        key: "installment",
        title: "Parcela",
        render: (item) => installmentLabel(item),
        cellClassName: "whitespace-nowrap",
      },
      {
        key: "amount",
        title: "Valor",
        align: "right",
        render: (item) => formatCurrency(item.amount, currency),
        cellClassName: "tabular-nums",
      },
      {
        key: "status",
        title: "Situação",
        render: (item) => item.statusLabel || item.status || "—",
      },
    ],
    [currency],
  );

  const paymentColumns =
    React.useMemo<Array<DataTableColumn<CreditCardInvoiceDetailsPaymentItem>>>(
      () => [
        {
          key: "paymentDate",
          title: "Data",
          render: (payment) => formatDate(payment.paymentDate),
          cellClassName: "whitespace-nowrap",
        },
        {
          key: "accountName",
          title: "Conta",
          render: (payment) => payment.accountName || "—",
        },
        {
          key: "amount",
          title: "Valor",
          align: "right",
          render: (payment) => formatCurrency(payment.amount, currency),
          cellClassName: "tabular-nums",
        },
        {
          key: "notes",
          title: "Observação",
          render: (payment) => payment.notes?.trim() || "—",
        },
      ],
      [currency],
    );

  if (loading) {
    return <SectionLoadingState message="Carregando detalhes da fatura..." />;
  }

  if (error) {
    return <SectionErrorState message={error} />;
  }

  if (!invoice) {
    return <SectionEmptyState message="Selecione uma fatura para visualizar os detalhes." />;
  }

  return (
    <div className="space-y-4">
      <DetailsSection title="Cabeçalho" description="Dados principais da fatura">
        <DetailsRow label="Cartão" value={invoice.creditCardName || "—"} />
        <DetailsRow label="Referência" value={invoice.referenceLabel || "—"} />
        <DetailsRow
          label="Período"
          value={`${formatDate(invoice.periodStart)} até ${formatDate(invoice.periodEnd)}`}
        />
        <DetailsRow label="Fechamento" value={formatDate(invoice.closingDate)} />
        <DetailsRow label="Vencimento" value={formatDate(invoice.dueDate)} />
        <DetailsRow
          label="Situação"
          value={<InvoiceStatusBadge status={invoice.status} label={invoice.statusLabel} />}
        />
      </DetailsSection>

      <DetailsSection title="Resumo financeiro" description="Totais e encargos da fatura">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {summaryItems(invoice).map((item) => (
            <div key={item.label} className="rounded-lg border bg-card px-3 py-2">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold tabular-nums">
                {formatCurrency(item.value, currency)}
              </p>
            </div>
          ))}
        </div>
      </DetailsSection>

      <DetailsSection title="Lançamentos" description="Itens que compõem esta fatura">
        <DataTable
          columns={itemColumns}
          data={invoice.expenses}
          loading={false}
          error={null}
          pageResponse={null}
          sortState={invoiceItemsSortState}
          onSortChange={() => {}}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          getRowKey={(item) => item.id}
          emptyTitle="Sem lançamentos na fatura"
          emptyDescription="Esta fatura não possui lançamentos no período."
        />
      </DetailsSection>

      <DetailsSection title="Pagamentos" description="Pagamentos registrados para esta fatura">
        <DataTable
          columns={paymentColumns}
          data={invoice.payments}
          loading={false}
          error={null}
          pageResponse={null}
          sortState={invoicePaymentsSortState}
          onSortChange={() => {}}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          getRowKey={(payment) => payment.id}
          emptyTitle="Sem pagamentos registrados"
          emptyDescription="Registre um pagamento para atualizar o saldo pendente."
        />
      </DetailsSection>
    </div>
  );
}
