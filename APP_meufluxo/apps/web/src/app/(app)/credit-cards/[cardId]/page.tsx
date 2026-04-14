"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, History, Plus, RotateCcw } from "lucide-react";
import type {
  CreditCard,
  CreditCardExpense,
  DashboardCategoryKpi,
  Invoice,
} from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockCreditCards } from "@/services/mocks/credit-cards";
import { toNumericIdString } from "@/lib/numeric-id";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useAuthOptional } from "@/hooks/useAuth";
import {
  useAccounts,
  useCancelCreditCardExpense,
  useCategories,
  useCloseInvoice,
  useInvoiceDetails,
  useInvoices,
  useReopenInvoice,
  useSubCategories,
} from "@/hooks/api";
import { useToast } from "@/components/toast";
import { getQueryErrorMessage } from "@/lib/query-error";
import { extractApiError } from "@/lib/api-error";
import { fetchCreditCardExpensesPage } from "@/features/credit-card-expenses/credit-card-expenses.service";
import { getCreditCardExpensesColumns } from "@/features/credit-card-expenses/credit-card-expenses.columns";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";
import { CreditCardExpenseRowActions } from "@/features/credit-card-expenses/components/credit-card-expense-row-actions";
import { InvoicePaymentModal } from "@/features/invoices/components/invoice-payment-modal";
import { InvoiceChargesModal } from "@/features/invoices/components/invoice-charges-modal";
import { CreditCardExpenseFormModal } from "@/features/credit-card-expenses/components/credit-card-expense-form-modal";
import { InvoiceDetailsPanel } from "@/components/invoices";
import { CreditCardExpensesTable } from "@/components/credit-card-expenses";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FilterSelect, DateRangePicker } from "@/components/filters";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { SectionErrorState, SectionLoadingState } from "@/components/patterns";
import { RowActionButtons } from "@/components/patterns";
import { DataTable } from "@/components/data-table/DataTable";
import { DetailsDrawer } from "@/components/details";
import { AnalyticPieChart, KpiCard, getDefaultDashboardDateRange } from "@/features/dashboard";
import type { DataTableColumn } from "@/components/data-table/types";

function normalizeCardFromMocks(cardId: string): CreditCard | null {
  const byRaw = mockCreditCards.find((card) => card.id === cardId);
  if (byRaw) return byRaw;
  const normalizedTarget = toNumericIdString(cardId);
  if (!normalizedTarget) return null;
  return (
    mockCreditCards.find((card) => toNumericIdString(card.id) === normalizedTarget) ?? null
  );
}

function buildExpenseCategoryKpis(expenses: CreditCardExpense[]): DashboardCategoryKpi[] {
  const totals = new Map<string, { name: string; total: number }>();
  let grandTotal = 0;

  expenses.forEach((expense) => {
    const total = Number(expense.totalAmount) || 0;
    if (total <= 0) return;
    grandTotal += total;
    const key = expense.categoryId || expense.categoryName;
    const current = totals.get(key);
    if (current) {
      current.total += total;
      return;
    }
    totals.set(key, { name: expense.categoryName || "Sem categoria", total });
  });

  if (grandTotal <= 0) return [];

  return Array.from(totals.entries())
    .map(([key, value], index) => {
      const numericId = Number(key);
      return {
        categoryId: Number.isFinite(numericId) ? numericId : index + 1,
        categoryName: value.name,
        total: value.total,
        percent: Number(((value.total / grandTotal) * 100).toFixed(2)),
        subCategories: [],
      };
    })
    .sort((a, b) => b.total - a.total);
}

function toIsoDate(iso: string): number {
  return new Date(`${iso}T00:00:00`).getTime();
}

function formatBrDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default function CreditCardManagerPage() {
  const params = useParams<{ cardId: string }>();
  const router = useRouter();
  const auth = useAuthOptional();
  const { success, error } = useToast();
  const cardId = String(params?.cardId ?? "");

  const closeInvoiceMutation = useCloseInvoice();
  const reopenInvoiceMutation = useReopenInvoice();
  const cancelExpenseMutation = useCancelCreditCardExpense();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories({ realOnly: true });
  const { data: subCategories = [] } = useSubCategories({ realOnly: true });
  const { data: allInvoicesByCard = [], refetch: refetchInvoicesByCard } = useInvoices({
    creditCardId: cardId,
  });

  const cardQuery = useQuery({
    queryKey: ["credit-card-details", cardId],
    queryFn: async () => {
      if (env.useMocks) {
        const mock = normalizeCardFromMocks(cardId);
        if (!mock) throw new Error("Cartão não encontrado.");
        return mock;
      }
      return api.creditCards.getById(cardId);
    },
    enabled: !!cardId && !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });

  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<string | null>(null);
  const [closeConfirmOpen, setCloseConfirmOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [historyReopenConfirmOpen, setHistoryReopenConfirmOpen] = React.useState(false);
  const [historyTargetInvoice, setHistoryTargetInvoice] = React.useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [chargesModalOpen, setChargesModalOpen] = React.useState(false);
  const [dashboardDateRange, setDashboardDateRange] = React.useState(getDefaultDashboardDateRange());

  const operationalInvoices = React.useMemo(() => {
    const nowTs = Date.now();
    const upcoming = [...allInvoicesByCard]
      .sort((a, b) => toIsoDate(a.dueDate) - toIsoDate(b.dueDate))
      .find((item) => toIsoDate(item.dueDate) >= nowTs);

    const selectedSet = new Map<string, Invoice>();
    allInvoicesByCard.forEach((invoice) => {
      const isOpen = invoice.status === "OPEN";
      const hasPending = (invoice.remainingAmount ?? 0) > 0;
      const isOverdue = invoice.status === "OVERDUE";
      const isUpcoming = upcoming?.id === invoice.id;
      if (isOpen || hasPending || isOverdue || isUpcoming) {
        selectedSet.set(invoice.id, invoice);
      }
    });

    return Array.from(selectedSet.values()).sort((a, b) => toIsoDate(a.dueDate) - toIsoDate(b.dueDate));
  }, [allInvoicesByCard]);

  const historyInvoices = React.useMemo(
    () =>
      allInvoicesByCard
        .filter((invoice) => invoice.status === "CLOSED" || invoice.status === "PAID")
        .sort((a, b) => toIsoDate(b.dueDate) - toIsoDate(a.dueDate)),
    [allInvoicesByCard],
  );

  React.useEffect(() => {
    if (!operationalInvoices.length) {
      setSelectedInvoiceId(null);
      return;
    }
    const exists = selectedInvoiceId ? operationalInvoices.some((item) => item.id === selectedInvoiceId) : false;
    if (!exists) {
      setSelectedInvoiceId(operationalInvoices[0].id);
    }
  }, [operationalInvoices, selectedInvoiceId]);

  const invoiceDetailsQuery = useInvoiceDetails(
    selectedInvoiceId,
    !!selectedInvoiceId || paymentModalOpen || chargesModalOpen,
  );

  const refreshInvoices = React.useCallback(async () => {
    await Promise.all([refetchInvoicesByCard(), cardQuery.refetch()]);
    if (selectedInvoiceId) {
      await invoiceDetailsQuery.refetch();
    }
  }, [refetchInvoicesByCard, cardQuery, invoiceDetailsQuery, selectedInvoiceId]);

  const [expenseFilters, setExpenseFilters] = React.useState({
    invoiceId: "",
    categoryId: "",
    subCategoryId: "",
    dateRange: null as { startDate: string; endDate: string } | null,
  });
  const [expenseFormOpen, setExpenseFormOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<CreditCardExpense | null>(null);
  const [cancelExpenseOpen, setCancelExpenseOpen] = React.useState(false);
  const [cancelingExpense, setCancelingExpense] = React.useState<CreditCardExpense | null>(null);

  const expensesTable = useServerDataTable<CreditCardExpense>({
    queryKey: ["card-manager", "expenses", cardId],
    fetchPage: fetchCreditCardExpensesPage,
    initialPageSize: 10,
    initialSortKey: "purchaseDate",
    initialDirection: "desc",
    enabled: !!cardId && !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      creditCardId: cardId,
      ...(expenseFilters.invoiceId ? { invoiceId: expenseFilters.invoiceId } : {}),
      ...(expenseFilters.categoryId ? { categoryId: expenseFilters.categoryId } : {}),
      ...(expenseFilters.subCategoryId ? { subCategoryId: expenseFilters.subCategoryId } : {}),
      ...(expenseFilters.dateRange?.startDate ? { purchaseDateStart: expenseFilters.dateRange.startDate } : {}),
      ...(expenseFilters.dateRange?.endDate ? { purchaseDateEnd: expenseFilters.dateRange.endDate } : {}),
    },
  });

  const expenseFilterKey = React.useMemo(() => JSON.stringify(expenseFilters), [expenseFilters]);
  React.useEffect(() => {
    expensesTable.onReset();
  }, [expenseFilterKey, expensesTable]);

  const availableSubCategories = React.useMemo(() => {
    if (!expenseFilters.categoryId) return [];
    return subCategories.filter((item) => item.category.id === expenseFilters.categoryId);
  }, [expenseFilters.categoryId, subCategories]);

  const expenseColumns = React.useMemo(
    () =>
      getCreditCardExpensesColumns({
        renderActions: (expense) => (
          <CreditCardExpenseRowActions
            expense={expense}
            canceling={cancelExpenseMutation.isPending && cancelingExpense?.id === expense.id}
            onEdit={(item) => {
              setEditingExpense(item);
              setExpenseFormOpen(true);
            }}
            onCancel={(item) => {
              setCancelingExpense(item);
              setCancelExpenseOpen(true);
            }}
          />
        ),
      }),
    [cancelExpenseMutation.isPending, cancelingExpense?.id],
  );

  const analyticsQuery = useQuery({
    queryKey: [
      "card-manager",
      "analytics",
      cardId,
      dashboardDateRange.startDate,
      dashboardDateRange.endDate,
    ],
    queryFn: () =>
      fetchCreditCardExpensesPage({
        page: 0,
        size: 500,
        sort: "purchaseDate,DESC",
        creditCardId: cardId,
        purchaseDateStart: dashboardDateRange.startDate,
        purchaseDateEnd: dashboardDateRange.endDate,
      }),
    enabled: !!cardId && !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });

  const refreshExpenses = React.useCallback(async () => {
    await Promise.all([
      expensesTable.pageResponseQuery.refetch(),
      analyticsQuery.refetch(),
      refetchInvoicesByCard(),
      cardQuery.refetch(),
    ]);
    if (selectedInvoiceId) {
      await invoiceDetailsQuery.refetch();
    }
  }, [
    expensesTable.pageResponseQuery,
    analyticsQuery,
    refetchInvoicesByCard,
    cardQuery,
    selectedInvoiceId,
    invoiceDetailsQuery,
  ]);

  const card = cardQuery.data ?? null;
  const usedAmount = allInvoicesByCard.reduce(
    (sum, invoice) => sum + (invoice.status === "PAID" ? 0 : invoice.remainingAmount),
    0,
  );
  const creditLimit = card?.creditLimit ?? 0;
  const availableAmount = Math.max(0, creditLimit - usedAmount);
  const utilization = creditLimit > 0 ? Math.min(100, (usedAmount / creditLimit) * 100) : 0;
  const openInvoices = allInvoicesByCard.filter((invoice) => invoice.status !== "PAID").length;
  const expensesTotal =
    expensesTable.pageResponseQuery.data?.content.reduce((sum, item) => sum + (item.totalAmount || 0), 0) ?? 0;
  const analyticsExpenses = analyticsQuery.data?.content ?? [];
  const periodSpent = analyticsExpenses.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const nextInvoice = [...allInvoicesByCard]
    .filter((invoice) => invoice.remainingAmount > 0)
    .sort((a, b) => toIsoDate(a.dueDate) - toIsoDate(b.dueDate))
    .find((invoice) => toIsoDate(invoice.dueDate) >= Date.now());
  const nextInvoiceTotal = nextInvoice?.remainingAmount ?? 0;
  const categoryKpis = React.useMemo(() => buildExpenseCategoryKpis(analyticsExpenses), [analyticsExpenses]);
  const historyPage = React.useMemo(
    () => ({
      content: historyInvoices,
      page: 0,
      size: Math.max(historyInvoices.length, 1),
      totalElements: historyInvoices.length,
      totalPages: 1,
      first: true,
      last: true,
    }),
    [historyInvoices],
  );

  const historyColumns = React.useMemo<Array<DataTableColumn<Invoice>>>(
    () => [
      {
        key: "reference",
        title: "Referência",
        sortable: false,
        render: (row) => row.referenceLabel || "—",
      },
      {
        key: "dueDate",
        title: "Vencimento",
        sortable: false,
        render: (row) => formatBrDate(row.dueDate),
      },
      {
        key: "total",
        title: "Total",
        align: "right",
        sortable: false,
        render: (row) => formatCurrency(row.totalAmount, "BRL"),
      },
      {
        key: "paid",
        title: "Pago",
        align: "right",
        sortable: false,
        render: (row) => formatCurrency(row.paidAmount, "BRL"),
      },
      {
        key: "status",
        title: "Situação",
        sortable: false,
        render: (row) => <InvoiceStatusBadge status={row.status} />,
      },
      {
        key: "actions",
        title: "Ações",
        align: "right",
        sortable: false,
        render: (row) => (
          <RowActionButtons
            actions={[
              {
                key: `view-${row.id}`,
                label: "Ver detalhes na tela principal",
                icon: Eye,
                ariaLabel: "Ver detalhes da fatura",
                onClick: () => {
                  setSelectedInvoiceId(row.id);
                  setHistoryOpen(false);
                },
              },
              {
                key: `reopen-${row.id}`,
                label: "Reabrir fatura",
                icon: RotateCcw,
                ariaLabel: "Reabrir fatura",
                disabled: !(row.canReopen ?? row.status === "CLOSED"),
                onClick: () => {
                  setHistoryTargetInvoice(row);
                  setHistoryReopenConfirmOpen(true);
                },
              },
            ]}
            density="compact"
          />
        ),
      },
    ],
    [],
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={card?.name ? `Cartão • ${card.name}` : "Visão gerencial do cartão"}
          description="Contexto operacional do cartão selecionado: limite, faturas, detalhes e lançamentos."
          right={
            <Button type="button" variant="outline" className="gap-2" onClick={() => router.push("/credit-cards")}>
              <ArrowLeft className="h-4 w-4" />
              Voltar para cartões
            </Button>
          }
        />

        {cardQuery.isLoading ? (
          <SectionLoadingState message="Carregando cartão..." />
        ) : cardQuery.isError || !card ? (
          <SectionErrorState message={getQueryErrorMessage(cardQuery.error, "Não foi possível carregar o cartão.")} />
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Dados do cartão</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{card.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bandeira</p>
                  <p className="font-medium">{card.brandCard ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fechamento</p>
                  <p className="font-medium">Dia {card.closingDay}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencimento</p>
                  <p className="font-medium">Dia {card.dueDay}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Limite total</p>
                  <p className="font-medium">{formatCurrency(card.creditLimit ?? 0, "BRL")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Limite e uso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${utilization}%` }} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Utilizado</p>
                    <p className="font-medium">{formatCurrency(usedAmount, "BRL")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Disponível</p>
                    <p className="font-medium">{formatCurrency(availableAmount, "BRL")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Utilização</p>
                    <p className="font-medium">{utilization.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-base font-semibold">Mini dashboard do cartão</h2>
                <div className="w-full max-w-xs">
                  <DateRangePicker
                    value={dashboardDateRange}
                    onChange={(value) => value && setDashboardDateRange(value)}
                    placeholder="Período dos indicadores"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard title="Total gasto no período" value={formatCurrency(periodSpent, "BRL")} tone="danger" />
                <KpiCard title="Total em aberto" value={formatCurrency(usedAmount, "BRL")} tone="danger" />
                <KpiCard title="Próxima fatura" value={formatCurrency(nextInvoiceTotal, "BRL")} />
                <KpiCard title="Faturas em aberto" value={String(openInvoices)} />
              </div>

              {analyticsQuery.isLoading ? (
                <SectionLoadingState message="Carregando indicadores do cartão..." />
              ) : analyticsQuery.isError ? (
                <SectionErrorState
                  message={getQueryErrorMessage(
                    analyticsQuery.error,
                    "Não foi possível carregar os indicadores do cartão.",
                  )}
                />
              ) : (
                <AnalyticPieChart
                  title="Gastos por categoria"
                  data={categoryKpis}
                  total={periodSpent}
                  onCategoryClick={() => undefined}
                />
              )}
            </section>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">Faturas operacionais do cartão</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setHistoryOpen(true)}
                  >
                    <History className="h-4 w-4" />
                    Histórico de faturas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {operationalInvoices.length === 0 ? (
                  <SectionErrorState message="Sem faturas operacionais para este cartão no momento." />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {operationalInvoices.map((invoice) => {
                      const isSelected = selectedInvoiceId === invoice.id;
                      return (
                        <button
                          key={invoice.id}
                          type="button"
                          className={`rounded-xl border p-3 text-left transition ${
                            isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                          }`}
                          onClick={() => {
                            setSelectedInvoiceId(invoice.id);
                          }}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold">{invoice.referenceLabel}</p>
                              <p className="text-xs text-muted-foreground">
                                Vencimento: {formatBrDate(invoice.dueDate)}
                              </p>
                            </div>
                            <InvoiceStatusBadge status={invoice.status} />
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-medium">{formatCurrency(invoice.totalAmount, "BRL")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pago</p>
                              <p className="font-medium">{formatCurrency(invoice.paidAmount, "BRL")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pendente</p>
                              <p className="font-medium">{formatCurrency(invoice.remainingAmount, "BRL")}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Detalhe da fatura selecionada</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedInvoiceId ? (
                  <SectionErrorState message="Selecione uma fatura para ver o detalhe." />
                ) : invoiceDetailsQuery.isLoading ? (
                  <SectionLoadingState message="Carregando detalhe da fatura..." />
                ) : invoiceDetailsQuery.isError || !invoiceDetailsQuery.data ? (
                  <SectionErrorState
                    message={getQueryErrorMessage(invoiceDetailsQuery.error, "Não foi possível carregar o detalhe da fatura.")}
                  />
                ) : (
                  <InvoiceDetailsPanel
                    invoice={invoiceDetailsQuery.data}
                    closing={closeInvoiceMutation.isPending}
                    onCloseInvoice={() => setCloseConfirmOpen(true)}
                    onPayInvoice={() => setPaymentModalOpen(true)}
                    onEditCharges={() => setChargesModalOpen(true)}
                    onEditExpenses={() => setExpenseFilters((prev) => ({ ...prev, invoiceId: invoiceDetailsQuery.data.id }))}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">Lançamentos do cartão</CardTitle>
                  <Button
                    type="button"
                    className="gap-2"
                    onClick={() => {
                      setEditingExpense(null);
                      setExpenseFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Novo lançamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 xl:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="manager-expenses-filter-invoice">Fatura</Label>
                    <FilterSelect
                      id="manager-expenses-filter-invoice"
                      value={expenseFilters.invoiceId}
                      onChange={(value) => setExpenseFilters((prev) => ({ ...prev, invoiceId: value }))}
                      options={[
                        { value: "", label: "Todas" },
                        ...allInvoicesByCard.map((invoice) => ({ value: invoice.id, label: invoice.referenceLabel })),
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="manager-expenses-filter-category">Categoria</Label>
                    <FilterSelect
                      id="manager-expenses-filter-category"
                      value={expenseFilters.categoryId}
                      onChange={(value) =>
                        setExpenseFilters((prev) => ({ ...prev, categoryId: value, subCategoryId: "" }))
                      }
                      options={[
                        { value: "", label: "Todas" },
                        ...categories
                          .filter((item) => item.movementType !== "INCOME")
                          .map((item) => ({ value: item.id, label: item.name })),
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="manager-expenses-filter-subcategory">Subcategoria</Label>
                    <FilterSelect
                      id="manager-expenses-filter-subcategory"
                      value={expenseFilters.subCategoryId}
                      onChange={(value) => setExpenseFilters((prev) => ({ ...prev, subCategoryId: value }))}
                      options={[
                        { value: "", label: "Todas" },
                        ...availableSubCategories.map((item) => ({ value: item.id, label: item.name })),
                      ]}
                      disabled={!expenseFilters.categoryId}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="manager-expenses-filter-period">Período</Label>
                    <DateRangePicker
                      value={expenseFilters.dateRange}
                      onChange={(value) => setExpenseFilters((prev) => ({ ...prev, dateRange: value }))}
                      placeholder="Período da compra"
                    />
                  </div>
                </div>

                <CreditCardExpensesTable
                  columns={expenseColumns}
                  data={expensesTable.pageResponseQuery.data?.content ?? []}
                  loading={expensesTable.pageResponseQuery.isLoading}
                  error={
                    expensesTable.pageResponseQuery.isError
                      ? getQueryErrorMessage(
                          expensesTable.pageResponseQuery.error,
                          "Não foi possível carregar lançamentos deste cartão.",
                        )
                      : null
                  }
                  pageResponse={expensesTable.pageResponseQuery.data ?? null}
                  sortState={{ sortKey: expensesTable.sortKey, direction: expensesTable.direction }}
                  onSortChange={expensesTable.onSortChange}
                  onPageChange={expensesTable.onPageChange}
                  onPageSizeChange={expensesTable.onPageSizeChange}
                />
                <p className="text-xs text-muted-foreground">
                  Total dos lançamentos exibidos: {formatCurrency(expensesTotal, "BRL")}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <DetailsDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Histórico de faturas"
        description="Faturas antigas, fechadas ou quitadas deste cartão."
        widthClassName="w-full sm:max-w-4xl"
      >
        <DataTable
          columns={historyColumns}
          data={historyInvoices}
          loading={false}
          error={null}
          pageResponse={historyPage}
          sortState={{ sortKey: "dueDate", direction: "desc" }}
          onSortChange={() => undefined}
          onPageChange={() => undefined}
          onPageSizeChange={() => undefined}
          getRowKey={(row) => row.id}
          emptyTitle="Sem histórico para este cartão"
          emptyDescription="As faturas antigas fechadas/quitadas aparecerão aqui."
        />
      </DetailsDrawer>

      <ConfirmDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
        title="Fechar fatura"
        description="Confirma o fechamento desta fatura?"
        confirmText="Fechar fatura"
        isConfirming={closeInvoiceMutation.isPending}
        onConfirm={async () => {
          if (!selectedInvoiceId) return;
          try {
            await closeInvoiceMutation.mutateAsync(selectedInvoiceId);
            success("Fatura fechada com sucesso.");
            await refreshInvoices();
          } catch (err) {
            error(getQueryErrorMessage(err, "Não foi possível fechar a fatura."));
          }
        }}
      />

      <ConfirmDialog
        open={historyReopenConfirmOpen}
        onOpenChange={setHistoryReopenConfirmOpen}
        title="Reabrir fatura"
        description="Confirma a reabertura desta fatura no histórico?"
        confirmText="Reabrir fatura"
        isConfirming={reopenInvoiceMutation.isPending}
        onConfirm={async () => {
          if (!historyTargetInvoice?.id) return;
          try {
            await reopenInvoiceMutation.mutateAsync(historyTargetInvoice.id);
            success("Fatura reaberta com sucesso.");
            setHistoryReopenConfirmOpen(false);
            setHistoryOpen(false);
            setSelectedInvoiceId(historyTargetInvoice.id);
            setHistoryTargetInvoice(null);
            await refreshInvoices();
          } catch (err) {
            error(getQueryErrorMessage(err, "Não foi possível reabrir a fatura."));
          }
        }}
      />

      <InvoicePaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        invoice={invoiceDetailsQuery.data ?? null}
        accounts={accounts.map((account) => ({ id: account.id, name: account.name }))}
        onSaved={refreshInvoices}
      />

      <InvoiceChargesModal
        open={chargesModalOpen}
        onOpenChange={setChargesModalOpen}
        invoice={invoiceDetailsQuery.data ?? null}
        onSaved={refreshInvoices}
      />

      <CreditCardExpenseFormModal
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        expense={editingExpense}
        creditCards={card ? [{ id: card.id, name: card.name }] : []}
        forcedCreditCardId={cardId}
        categories={categories.map((item) => ({
          id: item.id,
          name: item.name,
          movementType: item.movementType,
        }))}
        subCategories={subCategories.map((item) => ({
          id: item.id,
          name: item.name,
          categoryId: item.category.id,
        }))}
        onSaved={refreshExpenses}
      />

      <ConfirmDialog
        open={cancelExpenseOpen}
        onOpenChange={setCancelExpenseOpen}
        title="Cancelar lançamento"
        description="Confirma o cancelamento deste lançamento no cartão?"
        confirmText="Confirmar cancelamento"
        confirmVariant="destructive"
        isConfirming={cancelExpenseMutation.isPending}
        onConfirm={async () => {
          if (!cancelingExpense) return;
          try {
            await cancelExpenseMutation.mutateAsync(cancelingExpense.id);
            success("Lançamento cancelado com sucesso.");
            setCancelingExpense(null);
            await refreshExpenses();
          } catch (err) {
            const apiError = extractApiError(err);
            error(apiError?.detail ?? "Não foi possível cancelar este lançamento.");
          }
        }}
      />
    </>
  );
}
