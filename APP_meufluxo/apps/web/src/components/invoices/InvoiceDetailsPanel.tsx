"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import type { InvoiceDetails } from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getCardBrandLabel } from "@/constants/card-brands";

import { DataTable } from "@/components/data-table/DataTable";
import type { DataTableColumn } from "@/components/data-table/types";
import { DetailsSection } from "@/components/details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";
import { RowActionButtons } from "@/components/patterns";

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

function getCardLabel(invoice: InvoiceDetails): string {
  const name = invoice.creditCardName?.trim() || "—";
  const brandLabel = getCardBrandLabel(invoice.creditCardBrand);
  return brandLabel ? `${name} - ${brandLabel}` : name;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

export function InvoiceDetailsPanel({
  invoice,
  onCloseInvoice,
  onPayInvoice,
  onEditCharges,
  onEditExpenses,
  onDeletePayment,
  deletingPaymentId,
  closing,
}: {
  invoice: InvoiceDetails;
  onCloseInvoice: () => void;
  onPayInvoice: () => void;
  onEditCharges: () => void;
  onEditExpenses?: () => void;
  onDeletePayment: (payment: InvoiceDetails["payments"][number]) => void;
  deletingPaymentId?: string | null;
  closing?: boolean;
}) {
  const [dashboardOpen, setDashboardOpen] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null);
  const canClose = invoice.canClose ?? invoice.status === "OPEN";
  const canPay = invoice.canPay ?? (invoice.status !== "PAID" && invoice.remainingAmount > 0);
  const canEditCharges = invoice.canEditCharges ?? invoice.status !== "PAID";
  const canEditExpenses = invoice.canEditExpenses ?? false;
  const visibleExpenses = React.useMemo(
    () => invoice.expenses.filter((expense) => expense.status !== "CANCELED"),
    [invoice.expenses],
  );

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
        render: (row) =>
          row.installmentLabel ??
          (row.installmentNumber != null && row.installmentCount != null
            ? `${row.installmentNumber}/${row.installmentCount}`
            : "1/1"),
      },
      {
        key: "amount",
        title: "Valor",
        align: "right",
        render: (row) => <span className="tabular-nums">{formatCurrency(row.amount, "BRL")}</span>,
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
      {
        key: "actions",
        title: "Ações",
        align: "center",
        render: (row) => (
          <RowActionButtons
            actions={[
              {
                key: "delete-payment",
                label: "Excluir pagamento",
                icon: Trash2,
                ariaLabel: "Excluir pagamento da fatura",
                disabled: deletingPaymentId === row.id,
                onClick: () => onDeletePayment(row),
              },
            ]}
            density="compact"
            className="justify-center"
          />
        ),
      },
    ],
    [deletingPaymentId, onDeletePayment],
  );

  const dashboardData = React.useMemo(() => {
    const categoryMap = new Map<
      string,
      {
        categoryId: number;
        categoryName: string;
        total: number;
        subCategories: Array<{ subCategoryId: number; subCategoryName: string; total: number }>;
      }
    >();

    visibleExpenses.forEach((expense) => {
      const categoryName = expense.categoryName?.trim() || "Sem categoria";
      const subCategoryName = expense.subCategoryName?.trim() || "Sem subcategoria";
      const key = categoryName.toLowerCase();
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          categoryId: categoryMap.size + 1,
          categoryName,
          total: 0,
          subCategories: [],
        });
      }

      const category = categoryMap.get(key);
      if (!category) return;
      category.total += expense.amount;

      const subKey = subCategoryName.toLowerCase();
      const existingSub = category.subCategories.find(
        (sub) => sub.subCategoryName.toLowerCase() === subKey,
      );
      if (existingSub) {
        existingSub.total += expense.amount;
      } else {
        category.subCategories.push({
          subCategoryId: category.subCategories.length + 1,
          subCategoryName,
          total: expense.amount,
        });
      }
    });

    const categories = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
    const total = categories.reduce((sum, category) => sum + category.total, 0);

    return {
      total,
      categories: categories.map((category) => ({
        ...category,
        percent: total > 0 ? Number(((category.total / total) * 100).toFixed(2)) : 0,
        subCategories: category.subCategories
          .sort((a, b) => b.total - a.total)
          .map((sub) => ({
            ...sub,
            percent: category.total > 0 ? Number(((sub.total / category.total) * 100).toFixed(2)) : 0,
          })),
      })),
    };
  }, [visibleExpenses]);

  const selectedCategory = React.useMemo(
    () => dashboardData.categories.find((category) => category.categoryId === selectedCategoryId) ?? null,
    [dashboardData.categories, selectedCategoryId],
  );

  return (
    <div className="space-y-4">
      <DetailsSection title="Resumo da fatura" description="Dados principais e ações operacionais.">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
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
            <Button type="button" variant="outline" onClick={() => setDashboardOpen(true)}>
              Dashboard
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <p className="text-xs text-muted-foreground">Referência</p>
              <p className="font-medium">{invoice.referenceLabel || "—"}</p>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs text-muted-foreground">Período</p>
              <p className="font-medium">{formatPeriod(invoice.periodStart, invoice.periodEnd)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fechamento</p>
              <p className="font-medium">{formatDate(invoice.closingDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vencimento</p>
              <p className="font-medium">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Situação</p>
              <div className="pt-0.5">
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
          </CardContent>
        </Card>
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
          data={visibleExpenses}
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

      <Dialog
        open={dashboardOpen}
        onOpenChange={(open) => {
          setDashboardOpen(open);
          if (!open) setSelectedCategoryId(null);
        }}
      >
        <DialogContent className={selectedCategory ? "max-w-6xl" : "max-w-3xl"}>
          <DialogHeader>
            <DialogTitle>Dashboard de gastos por categoria</DialogTitle>
          </DialogHeader>

          {dashboardData.categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum lançamento disponível para montar o dashboard.
            </p>
          ) : (
            <div className={selectedCategory ? "grid gap-4 lg:grid-cols-2" : "space-y-4"}>
              <div className="rounded-lg border p-3">
                <p className="mb-2 text-sm font-medium">Categorias</p>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.categories}
                        dataKey="total"
                        nameKey="categoryName"
                        innerRadius="52%"
                        outerRadius="82%"
                        paddingAngle={2}
                        onClick={(item) => {
                          const category = item as { categoryId?: number };
                          if (category.categoryId == null) return;
                          setSelectedCategoryId(category.categoryId);
                        }}
                        label={(props) =>
                          `${String(props.name ?? "")} ${
                            "percent" in props ? Number(props.percent ?? 0).toFixed(0) : 0
                          }%`
                        }
                        labelLine={false}
                      >
                        {dashboardData.categories.map((entry, index) => (
                          <Cell
                            key={`category-${entry.categoryId}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            stroke={
                              selectedCategoryId === entry.categoryId
                                ? "hsl(var(--primary))"
                                : "hsl(var(--background))"
                            }
                            strokeWidth={selectedCategoryId === entry.categoryId ? 3 : 1.5}
                            style={{ cursor: "pointer" }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value ?? 0), "BRL")}
                        labelFormatter={(label) => `Categoria: ${String(label)}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {selectedCategory ? (
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">
                    Subcategorias - {selectedCategory.categoryName}
                  </p>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={selectedCategory.subCategories}
                          dataKey="total"
                          nameKey="subCategoryName"
                          innerRadius="52%"
                          outerRadius="82%"
                          paddingAngle={2}
                          label={(props) =>
                            `${String(props.name ?? "")} ${
                              "percent" in props ? Number(props.percent ?? 0).toFixed(0) : 0
                            }%`
                          }
                          labelLine={false}
                        >
                          {selectedCategory.subCategories.map((entry, index) => (
                            <Cell
                              key={`subcategory-${entry.subCategoryId}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                              stroke="hsl(var(--background))"
                              strokeWidth={1.5}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value ?? 0), "BRL")}
                          labelFormatter={(label) => `Subcategoria: ${String(label)}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
