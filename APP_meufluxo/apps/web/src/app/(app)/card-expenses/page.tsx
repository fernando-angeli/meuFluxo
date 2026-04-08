"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import type { CreditCardExpense } from "@meufluxo/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateRangePicker, FilterSelect } from "@/components/filters";
import { CreditCardExpensesTable } from "@/components/credit-card-expenses";
import {
  creditCardExpensesQueryKey,
  useCancelCreditCardExpense,
  useCategories,
  useCreditCards,
  useInvoices,
  useSubCategories,
} from "@/hooks/api";
import { useAuthOptional } from "@/hooks/useAuth";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useToast } from "@/components/toast";
import { extractApiError } from "@/lib/api-error";
import { getQueryErrorMessage } from "@/lib/query-error";
import { getCreditCardExpensesColumns } from "@/features/credit-card-expenses/credit-card-expenses.columns";
import { CreditCardExpenseFormModal } from "@/features/credit-card-expenses/components/credit-card-expense-form-modal";
import { CreditCardExpenseRowActions } from "@/features/credit-card-expenses/components/credit-card-expense-row-actions";
import { fetchCreditCardExpensesPage } from "@/features/credit-card-expenses/credit-card-expenses.service";

type CardExpensesDateRange = {
  startDate: string;
  endDate: string;
};

export default function CardExpensesPage() {
  const auth = useAuthOptional();
  const { success, error } = useToast();
  const cancelMutation = useCancelCreditCardExpense();

  const { data: cards = [] } = useCreditCards();
  const { data: categories = [] } = useCategories({ realOnly: true });
  const { data: subCategories = [] } = useSubCategories({ realOnly: true });

  const [search, setSearch] = React.useState("");
  const [creditCardId, setCreditCardId] = React.useState("");
  const [invoiceId, setInvoiceId] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [subcategoryId, setSubcategoryId] = React.useState("");
  const [dateRange, setDateRange] = React.useState<CardExpensesDateRange | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<CreditCardExpense | null>(null);

  const { data: invoices = [] } = useInvoices(
    creditCardId ? { creditCardId } : undefined,
  );

  const normalizedSearch = search.trim().toLowerCase();

  const table = useServerDataTable<CreditCardExpense>({
    queryKey: creditCardExpensesQueryKey,
    fetchPage: fetchCreditCardExpensesPage,
    initialPageSize: 20,
    initialSortKey: "purchaseDate",
    initialDirection: "desc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      ...(creditCardId ? { creditCardId } : {}),
      ...(invoiceId ? { invoiceId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(subcategoryId ? { subcategoryId } : {}),
      ...(dateRange?.startDate ? { purchaseDateStart: dateRange.startDate } : {}),
      ...(dateRange?.endDate ? { purchaseDateEnd: dateRange.endDate } : {}),
    },
  });

  React.useEffect(() => {
    table.onReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    normalizedSearch,
    creditCardId,
    invoiceId,
    categoryId,
    subcategoryId,
    dateRange?.startDate,
    dateRange?.endDate,
  ]);

  React.useEffect(() => {
    if (!categoryId) {
      setSubcategoryId("");
      return;
    }
    const isValid = subCategories.some(
      (item) =>
        item.id === subcategoryId &&
        item.category.id === categoryId &&
        item.movementType === "EXPENSE",
    );
    if (!isValid) {
      setSubcategoryId("");
    }
  }, [categoryId, subCategories, subcategoryId]);

  const availableSubCategories = React.useMemo(() => {
    if (!categoryId) return [];
    return subCategories.filter(
      (item) => item.category.id === categoryId && item.movementType === "EXPENSE",
    );
  }, [categoryId, subCategories]);

  const filteredInvoices = React.useMemo(() => {
    if (!creditCardId) return invoices;
    return invoices.filter((invoice) => invoice.creditCardId === creditCardId);
  }, [creditCardId, invoices]);

  const pageResponse = table.pageResponseQuery.data ?? null;
  const rows = pageResponse?.content ?? [];
  const filteredRows = React.useMemo(() => {
    if (!normalizedSearch) return rows;
    return rows.filter((row) => {
      const text = `${row.description} ${row.creditCardName} ${row.invoiceReference ?? ""}`.toLowerCase();
      return text.includes(normalizedSearch);
    });
  }, [rows, normalizedSearch]);

  const errorMessage = table.pageResponseQuery.isError
    ? getQueryErrorMessage(
        table.pageResponseQuery.error,
        "Não foi possível carregar os gastos do cartão.",
      )
    : null;

  const currency = (auth?.preferences?.currency as "BRL" | "USD" | "EUR") ?? "BRL";

  const columns = React.useMemo(
    () =>
      getCreditCardExpensesColumns({
        currency,
        renderActions: (expense) => (
          <CreditCardExpenseRowActions
            expense={expense}
            isCancelling={cancelMutation.isPending}
            onEdit={(row) => {
              setEditingExpense(row);
              setFormOpen(true);
            }}
            onCancel={async (row) => {
              try {
                await cancelMutation.mutateAsync(row.id);
                success("Gasto no cartão cancelado com sucesso.");
              } catch (err) {
                const apiError = extractApiError(err);
                error(
                  apiError?.detail ??
                    "Não foi possível cancelar o gasto no cartão.",
                );
              }
            }}
          />
        ),
      }),
    [cancelMutation, currency, error, success],
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Gastos no cartão"
          description="Cadastre, edite e cancele compras no cartão com suporte a parcelamento."
          right={
            <Button
              className="gap-2"
              onClick={() => {
                setEditingExpense(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Novo gasto
            </Button>
          }
        />

        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-3">
              <CardTitle className="text-base">Lista</CardTitle>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por descrição, cartão ou fatura..."
                />
                <FilterSelect
                  value={creditCardId}
                  onChange={(value) => {
                    setCreditCardId(value);
                    setInvoiceId("");
                  }}
                  options={[
                    { value: "", label: "Todos os cartões" },
                    ...cards.map((card) => ({ value: card.id, label: card.name })),
                  ]}
                />
                <FilterSelect
                  value={invoiceId}
                  onChange={setInvoiceId}
                  options={[
                    { value: "", label: "Todas as faturas" },
                    ...filteredInvoices.map((invoice) => ({
                      value: invoice.id,
                      label: `${invoice.referenceLabel} • ${invoice.creditCardName}`,
                    })),
                  ]}
                />
                <FilterSelect
                  value={categoryId}
                  onChange={setCategoryId}
                  options={[
                    { value: "", label: "Todas as categorias" },
                    ...categories
                      .filter((category) => category.movementType === "EXPENSE")
                      .map((category) => ({
                        value: category.id,
                        label: category.name,
                      })),
                  ]}
                />
                <FilterSelect
                  value={subcategoryId}
                  onChange={setSubcategoryId}
                  options={[
                    { value: "", label: "Todas as subcategorias" },
                    ...availableSubCategories.map((item) => ({
                      value: item.id,
                      label: item.name,
                    })),
                  ]}
                />
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Período da compra"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CreditCardExpensesTable
              columns={columns}
              data={filteredRows}
              loading={table.pageResponseQuery.isLoading}
              error={errorMessage}
              pageResponse={pageResponse}
              sortState={{
                sortKey: table.sortKey,
                direction: table.direction,
              }}
              onSortChange={table.onSortChange}
              onPageChange={table.onPageChange}
              onPageSizeChange={table.onPageSizeChange}
              onRowClick={(row) => {
                setEditingExpense(row);
                setFormOpen(true);
              }}
            />
          </CardContent>
        </Card>
      </div>

      <CreditCardExpenseFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editingExpense}
      />
    </>
  );
}
