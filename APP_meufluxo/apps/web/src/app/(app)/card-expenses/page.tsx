"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import type { CreditCardExpense } from "@meufluxo/types";

import { CardsModuleNav } from "@/components/credit-cards";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FilterSelect, DateRangePicker } from "@/components/filters";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { CreditCardExpensesTable } from "@/components/credit-card-expenses";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useAuthOptional } from "@/hooks/useAuth";
import {
  useCategories,
  useSubCategories,
  useCreditCards,
  useInvoices,
  useCancelCreditCardExpense,
  creditCardExpensesQueryKey,
} from "@/hooks/api";
import { useToast } from "@/components/toast";
import { getQueryErrorMessage } from "@/lib/query-error";
import { extractApiError } from "@/lib/api-error";
import { toNumericId, toNumericIdString } from "@/lib/numeric-id";
import { getCreditCardExpensesColumns } from "@/features/credit-card-expenses/credit-card-expenses.columns";
import { fetchCreditCardExpensesPage } from "@/features/credit-card-expenses/credit-card-expenses.service";
import { CreditCardExpenseRowActions } from "@/features/credit-card-expenses/components/credit-card-expense-row-actions";
import { CreditCardExpenseFormModal } from "@/features/credit-card-expenses/components/credit-card-expense-form-modal";

export default function CardExpensesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useAuthOptional();
  const { success, error } = useToast();
  const cancelMutation = useCancelCreditCardExpense();
  const { data: categories = [] } = useCategories({ realOnly: true, activeOnly: true });
  const { data: subCategories = [] } = useSubCategories({ realOnly: true, activeOnly: true });
  const { data: creditCards = [] } = useCreditCards();

  const initialCreditCardId = toNumericId(searchParams.get("creditCardId"));
  const rawCreditCardIdParam = searchParams.get("creditCardId");
  const [filters, setFilters] = React.useState({
    creditCardId: initialCreditCardId,
    invoiceId: searchParams.get("invoiceId") ?? "",
    categoryId: "",
    subCategoryId: "",
    dateRange: null as { startDate: string; endDate: string } | null,
  });
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<CreditCardExpense | null>(null);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelingExpense, setCancelingExpense] = React.useState<CreditCardExpense | null>(null);

  React.useEffect(() => {
    const normalized = toNumericIdString(rawCreditCardIdParam);

    if (!rawCreditCardIdParam || !normalized || rawCreditCardIdParam === normalized) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("creditCardId", normalized);
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, rawCreditCardIdParam, router, searchParams]);

  React.useEffect(() => {
    const nextCreditCardId = toNumericId(searchParams.get("creditCardId"));
    const nextInvoiceId = searchParams.get("invoiceId") ?? "";
    setFilters((prev) => {
      if (prev.creditCardId === nextCreditCardId && prev.invoiceId === nextInvoiceId) {
        return prev;
      }
      return {
        ...prev,
        creditCardId: nextCreditCardId,
        invoiceId: nextInvoiceId,
      };
    });
  }, [searchParams]);

  const { data: invoices = [] } = useInvoices({
    ...(filters.creditCardId ? { creditCardId: String(filters.creditCardId) } : {}),
  });

  const availableSubCategories = React.useMemo(() => {
    if (!filters.categoryId) return [];
    return subCategories.filter((item) => item.category.id === filters.categoryId);
  }, [filters.categoryId, subCategories]);

  React.useEffect(() => {
    if (!filters.invoiceId) return;
    const stillExists = invoices.some((item) => item.id === filters.invoiceId);
    if (!stillExists) {
      setFilters((prev) => ({ ...prev, invoiceId: "" }));
    }
  }, [filters.invoiceId, invoices]);

  const table = useServerDataTable<CreditCardExpense>({
    queryKey: creditCardExpensesQueryKey,
    fetchPage: fetchCreditCardExpensesPage,
    initialPageSize: 20,
    initialSortKey: "purchaseDate",
    initialDirection: "desc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      ...(filters.creditCardId ? { creditCardId: String(filters.creditCardId) } : {}),
      ...(filters.invoiceId ? { invoiceId: filters.invoiceId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.subCategoryId ? { subCategoryId: filters.subCategoryId } : {}),
      ...(filters.dateRange?.startDate ? { purchaseDateStart: filters.dateRange.startDate } : {}),
      ...(filters.dateRange?.endDate ? { purchaseDateEnd: filters.dateRange.endDate } : {}),
    },
  });

  const filterKey = React.useMemo(() => JSON.stringify(filters), [filters]);
  React.useEffect(() => {
    table.onReset();
  }, [filterKey, table]);

  const pageResponse = table.pageResponseQuery.data ?? null;
  const rows = pageResponse?.content ?? [];
  const errorMessage = table.pageResponseQuery.isError
    ? getQueryErrorMessage(table.pageResponseQuery.error, "Não foi possível carregar os lançamentos do cartão.")
    : null;

  const columns = React.useMemo(
    () =>
      getCreditCardExpensesColumns({
        renderActions: (expense) => (
          <CreditCardExpenseRowActions
            expense={expense}
            canceling={cancelMutation.isPending && cancelingExpense?.id === expense.id}
            onEdit={(row) => {
              setEditingExpense(row);
              setFormOpen(true);
            }}
            onCancel={(row) => {
              setCancelingExpense(row);
              setCancelOpen(true);
            }}
          />
        ),
      }),
    [cancelMutation.isPending, cancelingExpense?.id],
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Despesas no cartão"
          description="Cadastre e gerencie lançamentos do cartão com suporte a parcelamento."
          right={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <CardsModuleNav />
              <Button
                className="gap-2"
                onClick={() => {
                  setEditingExpense(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Novo lançamento
              </Button>
            </div>
          }
        />

        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 xl:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="card-expenses-filter-card">Cartão</Label>
              <FilterSelect
                id="card-expenses-filter-card"
                value={filters.creditCardId ? String(filters.creditCardId) : ""}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    creditCardId: toNumericId(value),
                    invoiceId: "",
                  }))
                }
                options={[
                  { value: "", label: "Todos" },
                  ...creditCards
                    .map((card) => {
                      const id = toNumericIdString(card.id);
                      if (!id) return null;
                      return { value: id, label: card.name };
                    })
                    .filter((item): item is { value: string; label: string } => item != null),
                ]}
                placeholder="Todos os cartões"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="card-expenses-filter-invoice">Fatura</Label>
              <FilterSelect
                id="card-expenses-filter-invoice"
                value={filters.invoiceId}
                onChange={(value) => setFilters((prev) => ({ ...prev, invoiceId: value }))}
                options={[
                  { value: "", label: "Todas" },
                  ...invoices.map((invoice) => ({
                    value: invoice.id,
                    label: invoice.referenceLabel,
                  })),
                ]}
                placeholder="Todas as faturas"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="card-expenses-filter-category">Categoria</Label>
              <FilterSelect
                id="card-expenses-filter-category"
                value={filters.categoryId}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    categoryId: value,
                    subCategoryId: "",
                  }))
                }
                options={[
                  { value: "", label: "Todas" },
                  ...categories
                    .filter((item) => item.movementType !== "INCOME")
                    .map((item) => ({ value: item.id, label: item.name })),
                ]}
                placeholder="Todas as categorias"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="card-expenses-filter-sub-category">Subcategoria</Label>
              <FilterSelect
                id="card-expenses-filter-sub-category"
                value={filters.subCategoryId}
                onChange={(value) => setFilters((prev) => ({ ...prev, subCategoryId: value }))}
                options={[
                  { value: "", label: "Todas" },
                  ...availableSubCategories.map((item) => ({ value: item.id, label: item.name })),
                ]}
                placeholder="Todas as subcategorias"
                disabled={!filters.categoryId}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="card-expenses-filter-period">Período</Label>
              <DateRangePicker
                value={filters.dateRange}
                onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                placeholder="Período da compra"
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-transparent shadow-none">
          <CardContent>
            <CreditCardExpensesTable
              columns={columns}
              data={rows}
              loading={table.pageResponseQuery.isLoading}
              error={errorMessage}
              pageResponse={pageResponse}
              sortState={{ sortKey: table.sortKey, direction: table.direction }}
              onSortChange={table.onSortChange}
              onPageChange={table.onPageChange}
              onPageSizeChange={table.onPageSizeChange}
            />
          </CardContent>
        </Card>
      </div>

      <CreditCardExpenseFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editingExpense}
        creditCards={creditCards.map((item) => ({ id: item.id, name: item.name }))}
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
        onSaved={() => {
          table.pageResponseQuery.refetch();
        }}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancelar lançamento"
        description="Confirma o cancelamento deste lançamento no cartão?"
        confirmText="Confirmar cancelamento"
        confirmVariant="destructive"
        isConfirming={cancelMutation.isPending}
        onConfirm={async () => {
          if (!cancelingExpense) return;
          try {
            await cancelMutation.mutateAsync(cancelingExpense.id);
            success("Lançamento cancelado com sucesso.");
            table.pageResponseQuery.refetch();
            setCancelingExpense(null);
          } catch (err) {
            const apiError = extractApiError(err);
            error(apiError?.detail ?? "Não foi possível cancelar este lançamento.");
          }
        }}
      />
    </>
  );
}
