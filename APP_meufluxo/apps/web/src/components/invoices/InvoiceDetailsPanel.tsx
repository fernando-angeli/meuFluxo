"use client";

import * as React from "react";
import type { InvoiceDetails } from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";

import { DataTable } from "@/components/data-table/DataTable";
import type { DataTableColumn } from "@/components/data-table/types";
import { DetailsRow, DetailsSection } from "@/components/details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function formatPeriod(start?: string | null, end?: string | null): string {
  if (!start && !end) return "—";
  if (!start) return formatDate(end);
  if (!end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function expenseStatusLabel(value: InvoiceDetails["expenses"][number]["status"]): string {
  switch (value) {
    case "INVOICED":
      return "Faturado";
    case "PAID":
      return "Pago";
    case "CANCELED":
      return "Cancelado";
    case "OPEN":
      return "Em aberto";
    default:
      return value;
  }
}

export function InvoiceDetailsPanel({
  invoice,
  onCloseInvoice,
  onPayInvoice,
  onEditCharges,
  onEditExpenses,
  closing,
}: {
  invoice: InvoiceDetails;
  onCloseInvoice: () => void;
  onPayInvoice: () => void;
  onEditCharges: () => void;
  onEditExpenses?: () => void;
  closing?: boolean;
}) {
  const canClose = invoice.canClose ?? invoice.status === "OPEN";
  const canPay = invoice.canPay ?? (invoice.status !== "PAID" && invoice.remainingAmount > 0);
  const canEditCharges = invoice.canEditCharges ?? invoice.status !== "PAID";
  const canEditExpenses = invoice.canEditExpenses ?? false;

  const expenseColumns = React.useMemo<Array<DataTableColumn<InvoiceDetails["expenses"][number]>>>(
    () => [
      { key: "description", title: "Descrição", dataIndex: "description", cellClassName: "font-medium" },
      { key: "categoryName", title: "Categoria", dataIndex: "categoryName" },
      {
        key: "subCategoryName",
        title: "Subcategoria",
        render: (row) => row.subCategoryName ?? "—",
      },
      {
        key: "purchaseDate",
        title: "Data da compra",
        render: (row) => formatDate(row.purchaseDate),
      },
      {
        key: "installmentLabel",
        title: "Parcela",
        render: (row) => row.installmentLabel ?? "Única",
      },
      {
        key: "amount",
        title: "Valor",
        align: "right",
        render: (row) => <span className="tabular-nums">{formatCurrency(row.amount, "BRL")}</span>,
      },
      {
        key: "status",
        title: "Situação",
        render: (row) => expenseStatusLabel(row.status),
      },
    ],
    [],
  );

  const paymentColumns = React.useMemo<Array<DataTableColumn<InvoiceDetails["payments"][number]>>>(
    () => [
      {
        key: "paymentDate",
        title: "Data",
        render: (row) => formatDate(row.paymentDate),
      },
      { key: "accountName", title: "Conta", dataIndex: "accountName" },
      {
        key: "amount",
        title: "Valor",
        align: "right",
        render: (row) => <span className="tabular-nums">{formatCurrency(row.amount, "BRL")}</span>,
      },
      {
        key: "notes",
        title: "Observação",
        render: (row) => row.notes?.trim() || "—",
      },
      {
        key: "movementId",
        title: "Movimento",
        render: (row) => row.movementId ?? "—",
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <DetailsSection title="Resumo da fatura" description="Dados principais e ações operacionais.">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <InvoiceStatusBadge status={invoice.status} />
          <div className="flex flex-wrap gap-2">
            {onEditExpenses ? (
              <Button type="button" variant="outline" onClick={onEditExpenses} disabled={!canEditExpenses}>
                Editar lançamentos
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={onEditCharges} disabled={!canEditCharges}>
              Editar encargos
            </Button>
            <Button type="button" variant="outline" onClick={onCloseInvoice} disabled={!canClose || closing}>
              {closing ? "Fechando..." : "Fechar fatura"}
            </Button>
            <Button type="button" onClick={onPayInvoice} disabled={!canPay}>
              Pagar fatura
            </Button>
          </div>
        </div>
        <DetailsRow label="Cartão" value={invoice.cardDisplayName || invoice.creditCardName || "—"} />
        <DetailsRow label="Referência" value={invoice.referenceLabel || "—"} />
        <DetailsRow label="Período" value={formatPeriod(invoice.periodStart, invoice.periodEnd)} />
        <DetailsRow label="Fechamento" value={formatDate(invoice.closingDate)} />
        <DetailsRow label="Vencimento" value={formatDate(invoice.dueDate)} />
        <DetailsRow label="Situação" value={<InvoiceStatusBadge status={invoice.status} />} />
      </DetailsSection>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Compras do período</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold tabular-nums">
            {formatCurrency(invoice.purchasesAmount, "BRL")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Saldo anterior</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold tabular-nums">
            {formatCurrency(invoice.previousBalance, "BRL")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Juros rotativo</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold tabular-nums">
            {formatCurrency(invoice.interestAmount ?? 0, "BRL")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Multa</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold tabular-nums">
            {formatCurrency(invoice.lateFeeAmount ?? 0, "BRL")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Outras tarifas</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold tabular-nums">
            {formatCurrency(invoice.otherFeesAmount ?? 0, "BRL")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold tabular-nums">
            {formatCurrency(invoice.totalAmount, "BRL")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pago</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold tabular-nums">
            {formatCurrency(invoice.paidAmount, "BRL")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Saldo pendente</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold tabular-nums">
            {formatCurrency(invoice.remainingAmount, "BRL")}
          </CardContent>
        </Card>
      </section>

      <DetailsSection title="Lançamentos da fatura">
        <DataTable
          columns={expenseColumns}
          data={invoice.expenses}
          loading={false}
          error={null}
          pageResponse={null}
          sortState={{ sortKey: null, direction: "asc" }}
          onSortChange={() => undefined}
          onPageChange={() => undefined}
          onPageSizeChange={() => undefined}
          getRowKey={(row) => row.id}
          emptyTitle="Nenhum lançamento nesta fatura"
        />
      </DetailsSection>

      <DetailsSection title="Histórico de pagamentos">
        <DataTable
          columns={paymentColumns}
          data={invoice.payments}
          loading={false}
          error={null}
          pageResponse={null}
          sortState={{ sortKey: null, direction: "asc" }}
          onSortChange={() => undefined}
          onPageChange={() => undefined}
          onPageSizeChange={() => undefined}
          getRowKey={(row) => row.id}
          emptyTitle="Nenhum pagamento registrado"
        />
      </DetailsSection>
    </div>
  );
}
