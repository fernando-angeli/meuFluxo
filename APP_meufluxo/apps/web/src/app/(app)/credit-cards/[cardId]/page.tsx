"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import type {
  CreditCard,
  CreditCardExpense,
  DashboardCategoryKpi,
  Invoice,
  InvoicePaymentItem,
  InvoiceStatus,
} from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { toNumericIdString } from "@/lib/numeric-id";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useAuthOptional } from "@/hooks/useAuth";
import {
  useAccounts,
  useCancelCreditCardExpense,
  useCategories,
  useCloseInvoice,
  useDeleteInvoicePayment,
  useDeleteCreditCard,
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
import { CreditCardExpenseRowActions } from "@/features/credit-card-expenses/components/credit-card-expense-row-actions";
import { InvoicePaymentModal } from "@/features/invoices/components/invoice-payment-modal";
import { InvoiceChargesModal } from "@/features/invoices/components/invoice-charges-modal";
import { CreditCardExpenseFormModal } from "@/features/credit-card-expenses/components/credit-card-expense-form-modal";
import { InvoiceDetailsPanel, InvoicesTable } from "@/components/invoices";
import { CreditCardExpensesTable } from "@/components/credit-card-expenses";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FilterMultiSelect, FilterSelect, DateRangePicker } from "@/components/filters";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { SectionErrorState, SectionLoadingState } from "@/components/patterns";
import { DetailsDrawer } from "@/components/details";
import { getMockCreditCardsSnapshot } from "@/features/credit-cards/credit-cards.service";
import { CreditCardFormModal } from "@/features/credit-cards/components/credit-card-form-modal";
import { getCardBrandLabel } from "@/constants/card-brands";
import { fetchInvoicesPage } from "@/features/invoices/invoices.service";
import { getInvoicesTableColumns } from "@/features/invoices/invoices.columns";
import { DateRangeValue } from "@/components/filters/date-range-picker";
import { InvoiceRowActions } from "@/features/invoices/components/invoice-row-actions";

function normalizeCardFromMocks(cardId: string): CreditCard | null {
  const effective = getMockCreditCardsSnapshot();
  const byRaw = effective.find((card) => card.id === cardId);
  if (byRaw) return byRaw;
  const normalizedTarget = toNumericIdString(cardId);
  if (!normalizedTarget) return null;
  return effective.find((card) => toNumericIdString(card.id) === normalizedTarget) ?? null;
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

function formatBrDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function isZeroAmount(value: number | null | undefined): boolean {
  return Math.abs(Number(value ?? 0)) < 0.000001;
}

function isEmptyInvoice(invoice: Invoice): boolean {
  return (
    isZeroAmount(invoice.purchasesAmount) &&
    isZeroAmount(invoice.previousBalance) &&
    isZeroAmount(invoice.totalAmount) &&
    isZeroAmount(invoice.paidAmount) &&
    isZeroAmount(invoice.remainingAmount)
  );
}

export default function CreditCardManagerPage() {
  const params = useParams<{ cardId: string }>();
  const router = useRouter();
  const auth = useAuthOptional();
  const { success, error } = useToast();
  const cardId = String(params?.cardId ?? "");

  const closeInvoiceMutation = useCloseInvoice();
  const deleteInvoicePaymentMutation = useDeleteInvoicePayment();
  const cancelExpenseMutation = useCancelCreditCardExpense();
  const deleteCardMutation = useDeleteCreditCard();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories({ realOnly: true, activeOnly: true });
  const { data: subCategories = [] } = useSubCategories({ realOnly: true, activeOnly: true });
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
  const [invoiceDetailsOpen, setInvoiceDetailsOpen] = React.useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = React.useState(false);
  const [selectedInvoicePreview, setSelectedInvoicePreview] = React.useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [chargesModalOpen, setChargesModalOpen] = React.useState(false);
  const [deletePaymentConfirmOpen, setDeletePaymentConfirmOpen] = React.useState(false);
  const [paymentToDelete, setPaymentToDelete] = React.useState<InvoicePaymentItem | null>(null);
  const [invoiceFilters, setInvoiceFilters] = React.useState<{
    statuses: InvoiceStatus[];
    dueDateRange: DateRangeValue | null;
  }>({
    statuses: [],
    dueDateRange: null,
  });

  const invoicesTable = useServerDataTable<Invoice>({
    queryKey: ["card-manager", "invoices", cardId],
    fetchPage: fetchInvoicesPage,
    initialPageSize: 10,
    initialSortKey: "dueDate",
    initialDirection: "desc",
    enabled: !!cardId && !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      creditCardId: cardId,
      ...(invoiceFilters.statuses.length === 1 ? { status: invoiceFilters.statuses[0] } : {}),
      ...(invoiceFilters.dueDateRange?.startDate ? { dueDateStart: invoiceFilters.dueDateRange.startDate } : {}),
      ...(invoiceFilters.dueDateRange?.endDate ? { dueDateEnd: invoiceFilters.dueDateRange.endDate } : {}),
    },
  });

  const invoiceFilterKey = React.useMemo(
    () =>
      JSON.stringify({
        statuses: invoiceFilters.statuses,
        dueDateRange: invoiceFilters.dueDateRange,
      }),
    [invoiceFilters],
  );

  React.useEffect(() => {
    invoicesTable.onReset();
  }, [invoiceFilterKey, invoicesTable.onReset]);

  const invoiceDetailsQuery = useInvoiceDetails(
    selectedInvoiceId,
    !!selectedInvoiceId || paymentModalOpen || chargesModalOpen || invoiceDetailsOpen,
  );

  const refreshInvoices = React.useCallback(async () => {
    await Promise.all([
      refetchInvoicesByCard(),
      cardQuery.refetch(),
      invoicesTable.pageResponseQuery.refetch(),
    ]);
    if (selectedInvoiceId) {
      await invoiceDetailsQuery.refetch();
    }
  }, [refetchInvoicesByCard, cardQuery, invoiceDetailsQuery, selectedInvoiceId, invoicesTable.pageResponseQuery]);

  const [expenseFilters, setExpenseFilters] = React.useState({
    invoiceIds: [] as string[],
    categoryIds: [] as string[],
    subCategoryIds: [] as string[],
    dateRange: null as { startDate: string; endDate: string } | null,
  });
  const [expenseFormOpen, setExpenseFormOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<CreditCardExpense | null>(null);
  const [cancelExpenseOpen, setCancelExpenseOpen] = React.useState(false);
  const [cancelingExpense, setCancelingExpense] = React.useState<CreditCardExpense | null>(null);
  const [cardEditModalOpen, setCardEditModalOpen] = React.useState(false);
  const [cardDeleteConfirmOpen, setCardDeleteConfirmOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"invoices" | "expenses">("invoices");

  const expensesTable = useServerDataTable<CreditCardExpense>({
    queryKey: ["card-manager", "expenses", cardId],
    fetchPage: fetchCreditCardExpensesPage,
    initialPageSize: 10,
    initialSortKey: "purchaseDate",
    initialDirection: "desc",
    enabled: !!cardId && !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      creditCardId: cardId,
      ...(expenseFilters.invoiceIds.length === 1 ? { invoiceId: expenseFilters.invoiceIds[0] } : {}),
      ...(expenseFilters.categoryIds.length === 1 ? { categoryId: expenseFilters.categoryIds[0] } : {}),
      ...(expenseFilters.subCategoryIds.length === 1 ? { subCategoryId: expenseFilters.subCategoryIds[0] } : {}),
      ...(expenseFilters.dateRange?.startDate ? { purchaseDateStart: expenseFilters.dateRange.startDate } : {}),
      ...(expenseFilters.dateRange?.endDate ? { purchaseDateEnd: expenseFilters.dateRange.endDate } : {}),
    },
  });

  const expenseFilterKey = React.useMemo(() => JSON.stringify(expenseFilters), [expenseFilters]);
  React.useEffect(() => {
    expensesTable.onReset();
  }, [expenseFilterKey, expensesTable.onReset]);

  const availableSubCategories = React.useMemo(() => {
    if (expenseFilters.categoryIds.length === 0) return [];
    const categoryIds = new Set(expenseFilters.categoryIds);
    return subCategories.filter((item) => categoryIds.has(item.category.id));
  }, [expenseFilters.categoryIds, subCategories]);

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

  const refreshExpenses = React.useCallback(async () => {
    await Promise.all([
      expensesTable.pageResponseQuery.refetch(),
      refetchInvoicesByCard(),
      cardQuery.refetch(),
    ]);
    if (selectedInvoiceId) {
      await invoiceDetailsQuery.refetch();
    }
  }, [
    expensesTable.pageResponseQuery,
    refetchInvoicesByCard,
    cardQuery,
    selectedInvoiceId,
    invoiceDetailsQuery,
  ]);

  const card = cardQuery.data ?? null;
  const visibleInvoicesByCard = React.useMemo(
    () => allInvoicesByCard.filter((invoice) => !isEmptyInvoice(invoice)),
    [allInvoicesByCard],
  );
  const usedAmount = allInvoicesByCard.reduce(
    (sum, invoice) => sum + (invoice.status === "PAID" ? 0 : invoice.remainingAmount),
    0,
  );
  const creditLimit = card?.creditLimit ?? 0;
  const availableAmount = Math.max(0, creditLimit - usedAmount);
  const utilization = creditLimit > 0 ? Math.min(100, (usedAmount / creditLimit) * 100) : 0;
  const expensesTotal =
    expensesTable.pageResponseQuery.data?.content.reduce((sum, item) => sum + (item.totalAmount || 0), 0) ?? 0;
  const filteredInvoices = React.useMemo(() => {
    const rows = invoicesTable.pageResponseQuery.data?.content ?? [];
    const nonEmptyRows = rows.filter((row) => !isEmptyInvoice(row));
    if (invoiceFilters.statuses.length === 0) return nonEmptyRows;
    return nonEmptyRows.filter((row) => invoiceFilters.statuses.includes(row.status));
  }, [invoicesTable.pageResponseQuery.data?.content, invoiceFilters.statuses]);
  const filteredExpenses = React.useMemo(() => {
    const rows = expensesTable.pageResponseQuery.data?.content ?? [];
    return rows.filter((row) => {
      if (row.status === "CANCELED") return false;
      const byInvoice =
        expenseFilters.invoiceIds.length === 0 ||
        (row.invoiceId != null && expenseFilters.invoiceIds.includes(String(row.invoiceId)));
      const byCategory =
        expenseFilters.categoryIds.length === 0 || expenseFilters.categoryIds.includes(String(row.categoryId));
      const bySubCategory =
        expenseFilters.subCategoryIds.length === 0 ||
        (row.subCategoryId != null && expenseFilters.subCategoryIds.includes(String(row.subCategoryId)));
      return byInvoice && byCategory && bySubCategory;
    });
  }, [
    expensesTable.pageResponseQuery.data?.content,
    expenseFilters.invoiceIds,
    expenseFilters.categoryIds,
    expenseFilters.subCategoryIds,
  ]);
  const filteredExpensesTotal = React.useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
    [filteredExpenses],
  );

  const handleViewInvoiceDetails = React.useCallback((invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id);
    setSelectedInvoicePreview(invoice);
    setInvoiceDetailsOpen(true);
  }, []);

  const handleCloseInvoice = React.useCallback((invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id);
    setSelectedInvoicePreview(invoice);
    setCloseConfirmOpen(true);
  }, []);

  const handlePayInvoice = React.useCallback((invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id);
    setSelectedInvoicePreview(invoice);
    setPaymentModalOpen(true);
  }, []);

  const invoiceTableColumns = React.useMemo(
    () =>
      getInvoicesTableColumns({
        renderActions: (invoice) => (
          <InvoiceRowActions
            invoice={invoice}
            onViewDetails={handleViewInvoiceDetails}
            onCloseInvoice={handleCloseInvoice}
            onPayInvoice={handlePayInvoice}
          />
        ),
      }).filter((column) => column.key !== "creditCardName"),
    [handleViewInvoiceDetails, handleCloseInvoice, handlePayInvoice],
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={card?.name ? `${card.name}` : "Visão gerencial do cartão"}
          description="Contexto operacional do cartão selecionado: limite, faturas, detalhes e lançamentos."
          right={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {card ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setCardEditModalOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar cartão
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={() => setCardDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir cartão
                  </Button>
                </>
              ) : null}
              <Button type="button" variant="outline" className="gap-2" onClick={() => router.push("/credit-cards")}>
                <ArrowLeft className="h-4 w-4" />
                Voltar para cartões
              </Button>
            </div>
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
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Bandeira</p>
                  <p className="font-medium">{getCardBrandLabel(card.brand ?? card.brandCard)}</p>
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
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Utilizado</p>
                    <p className="font-medium">
                      {formatCurrency(usedAmount, "BRL")}
                      <span className="tabular-nums text-xs text-muted-foreground"> ({utilization.toFixed(1)}%)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Utilização</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Disponível</p>
                    <p className="font-medium">{formatCurrency(availableAmount, "BRL")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border bg-card p-1">
              <button
                type="button"
                onClick={() => setActiveTab("invoices")}
                className={
                  activeTab === "invoices"
                    ? "rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                    : "rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
                }
              >
                Faturas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("expenses")}
                className={
                  activeTab === "expenses"
                    ? "rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                    : "rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
                }
              >
                Lançamentos
              </button>
            </div>

            {activeTab === "invoices" ? (
            <Card>
              <CardHeader className="min-h-[68px] pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">Faturas do cartão</CardTitle>
                  <Button
                    type="button"
                    className="invisible gap-2"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <Plus className="h-4 w-4" />
                    Novo lançamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 xl:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="manager-invoices-filter-status">Status</Label>
                    <FilterMultiSelect
                      value={invoiceFilters.statuses}
                      onChange={(value) => {
                        setInvoiceFilters((prev) => ({ ...prev, statuses: value as InvoiceStatus[] }));
                      }}
                      placeholder="Selecione um ou mais status"
                      options={[
                        { value: "OPEN", label: "Aberta" },
                        { value: "CLOSED", label: "Fechada" },
                        { value: "PARTIALLY_PAID", label: "Parcial" },
                        { value: "PAID", label: "Quitada" },
                        { value: "OVERDUE", label: "Em atraso" },
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="manager-invoices-filter-period">Período</Label>
                    <DateRangePicker
                      value={invoiceFilters.dueDateRange}
                      onChange={(value) => {
                        setInvoiceFilters((prev) => ({ ...prev, dueDateRange: value }));
                      }}
                      placeholder="Período de vencimento"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Limpar período</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full"
                      disabled={!invoiceFilters.dueDateRange}
                      onClick={() => {
                        setInvoiceFilters((prev) => ({ ...prev, dueDateRange: null }));
                      }}
                    >
                      Limpar filtro
                    </Button>
                  </div>
                  <div className="hidden xl:block" aria-hidden="true" />
                </div>
                <InvoicesTable
                  columns={invoiceTableColumns}
                  data={filteredInvoices}
                  loading={invoicesTable.pageResponseQuery.isLoading}
                  error={
                    invoicesTable.pageResponseQuery.isError
                      ? getQueryErrorMessage(
                          invoicesTable.pageResponseQuery.error,
                          "Não foi possível carregar as faturas deste cartão.",
                        )
                      : null
                  }
                  pageResponse={invoicesTable.pageResponseQuery.data ?? null}
                  sortState={{ sortKey: invoicesTable.sortKey, direction: invoicesTable.direction }}
                  onSortChange={invoicesTable.onSortChange}
                  onPageChange={invoicesTable.onPageChange}
                  onPageSizeChange={invoicesTable.onPageSizeChange}
                />
              </CardContent>
            </Card>
            ) : null}

            {activeTab === "expenses" ? (
            <Card>
              <CardHeader className="min-h-[68px] pb-2">
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
                    <FilterMultiSelect
                      value={expenseFilters.invoiceIds}
                      onChange={(value) => setExpenseFilters((prev) => ({ ...prev, invoiceIds: value }))}
                      placeholder="Selecione uma ou mais faturas"
                      options={[
                        ...visibleInvoicesByCard.map((invoice) => ({ value: invoice.id, label: invoice.referenceLabel })),
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="manager-expenses-filter-category">Categoria</Label>
                    <FilterMultiSelect
                      value={expenseFilters.categoryIds}
                      onChange={(value) =>
                        setExpenseFilters((prev) => ({ ...prev, categoryIds: value, subCategoryIds: [] }))
                      }
                      placeholder="Selecione uma ou mais categorias"
                      options={[
                        ...categories
                          .filter((item) => item.movementType !== "INCOME")
                          .map((item) => ({ value: item.id, label: item.name })),
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="manager-expenses-filter-subcategory">Subcategoria</Label>
                    <FilterMultiSelect
                      value={expenseFilters.subCategoryIds}
                      onChange={(value) => setExpenseFilters((prev) => ({ ...prev, subCategoryIds: value }))}
                      placeholder="Selecione uma ou mais subcategorias"
                      options={[
                        ...availableSubCategories.map((item) => ({ value: item.id, label: item.name })),
                      ]}
                      disabled={expenseFilters.categoryIds.length === 0}
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
                  data={filteredExpenses}
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
                  Total dos lançamentos exibidos: {formatCurrency(filteredExpensesTotal, "BRL")}
                </p>
              </CardContent>
            </Card>
            ) : null}
          </>
        )}
      </div>

      <DetailsDrawer
        isOpen={invoiceDetailsOpen}
        onClose={() => setInvoiceDetailsOpen(false)}
        title={invoiceDetailsQuery.data?.referenceLabel ?? selectedInvoicePreview?.referenceLabel ?? "Detalhes da fatura"}
        description="Dashboard e gestão operacional da fatura selecionada."
        widthClassName="w-full sm:max-w-5xl"
      >
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
            onDeletePayment={(payment) => {
              setPaymentToDelete(payment);
              setDeletePaymentConfirmOpen(true);
            }}
            deletingPaymentId={
              deleteInvoicePaymentMutation.isPending ? (paymentToDelete?.id ?? null) : null
            }
            onEditExpenses={() => setExpenseFilters((prev) => ({ ...prev, invoiceId: invoiceDetailsQuery.data.id }))}
          />
        )}
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

      <ConfirmDialog
        open={deletePaymentConfirmOpen}
        onOpenChange={(open) => {
          setDeletePaymentConfirmOpen(open);
          if (!open) setPaymentToDelete(null);
        }}
        title="Excluir pagamento"
        description="Confirma a exclusão deste pagamento? O saldo da conta será estornado e a fatura recalculada."
        confirmText="Excluir pagamento"
        confirmVariant="destructive"
        isConfirming={deleteInvoicePaymentMutation.isPending}
        onConfirm={async () => {
          if (!selectedInvoiceId || !paymentToDelete) return;
          try {
            await deleteInvoicePaymentMutation.mutateAsync({
              invoiceId: selectedInvoiceId,
              paymentId: paymentToDelete.id,
            });
            success("Pagamento excluído com sucesso.");
            setPaymentToDelete(null);
            await refreshInvoices();
          } catch (err) {
            const apiError = extractApiError(err);
            error(apiError?.detail ?? "Não foi possível excluir o pagamento.");
          }
        }}
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
        title="Excluir lançamento"
        description="Confirma a exclusão deste lançamento? A ação só é permitida para faturas em aberto."
        confirmText="Confirmar exclusão"
        confirmVariant="destructive"
        isConfirming={cancelExpenseMutation.isPending}
        onConfirm={async () => {
          if (!cancelingExpense) return;
          try {
            await cancelExpenseMutation.mutateAsync(cancelingExpense.id);
            success("Lançamento excluído com sucesso.");
            setCancelingExpense(null);
            await refreshExpenses();
          } catch (err) {
            const apiError = extractApiError(err);
            error(apiError?.detail ?? "Não foi possível excluir este lançamento.");
          }
        }}
      />

      <CreditCardFormModal
        open={cardEditModalOpen && !!card}
        onOpenChange={(open) => {
          setCardEditModalOpen(open);
          if (!open) void cardQuery.refetch();
        }}
        creditCard={cardEditModalOpen && card ? card : null}
      />

      <ConfirmDialog
        open={cardDeleteConfirmOpen && !!card}
        onOpenChange={(open) => {
          if (!open) setCardDeleteConfirmOpen(false);
        }}
        title="Excluir cartão"
        description={
          card
            ? `Excluir permanentemente o cartão "${card.name}"? A exclusão só é permitida se não houver lançamentos — o servidor valida isso.`
            : ""
        }
        cancelText="Cancelar"
        confirmText="Excluir"
        confirmVariant="destructive"
        isConfirming={deleteCardMutation.isPending}
        onConfirm={async () => {
          if (!card) return;
          try {
            await deleteCardMutation.mutateAsync(card.id);
            success("Cartão excluído com sucesso.");
            setCardDeleteConfirmOpen(false);
            router.push("/credit-cards");
          } catch (err) {
            const apiError = extractApiError(err);
            error(apiError?.detail ?? "Não foi possível excluir o cartão.");
          }
        }}
      />
    </>
  );
}
