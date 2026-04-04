"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import type { ExpenseRecord } from "@meufluxo/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/DataTable";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useAuthOptional } from "@/hooks/useAuth";
import { useCategories, useSubCategories, useCancelExpense, useAccounts } from "@/hooks/api";
import { useToast } from "@/components/toast";
import { getQueryErrorMessage } from "@/lib/query-error";
import { fetchExpensesPage } from "@/features/expenses/expenses-list.service";
import { getExpensesTableColumns } from "@/features/expenses/expenses.columns";
import { FinancialRecordsFilterHeader, type FinancialRecordsFilterState } from "@/features/financial-records/components/financial-records-filter-header";
import { ExpenseRowActions } from "@/features/expenses/components/expense-row-actions";
import { ExpenseFormModal } from "@/features/expenses/components/expense-form-modal";
import { ExpenseSettleModal } from "@/features/expenses/components/expense-settle-modal";
import { DetailsDrawer } from "@/components/details";
import { DetailsRow, DetailsSection } from "@/components/details";
import { getMonthRange } from "@/features/dashboard/lib/date-range";

const expensesQueryKey = ["expenses"] as const;

export default function ExpensesPage() {
  const auth = useAuthOptional();
  const { success, error } = useToast();
  const cancelMutation = useCancelExpense();
  const { data: categories = [] } = useCategories({ realOnly: true });
  const { data: subCategories = [] } = useSubCategories({ realOnly: true });
  const { data: accounts = [] } = useAccounts();

  const initialMonthRange = React.useMemo(() => {
    const now = new Date();
    return getMonthRange(now.getFullYear(), now.getMonth());
  }, []);

  const [filters, setFilters] = React.useState<FinancialRecordsFilterState>({
    status: "OPEN",
    categoryId: "",
    subCategoryId: "",
    dateRange: initialMonthRange,
  });
  const [selected, setSelected] = React.useState<ExpenseRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<ExpenseRecord | null>(null);
  const [settleOpen, setSettleOpen] = React.useState(false);
  const [settlingExpense, setSettlingExpense] = React.useState<ExpenseRecord | null>(null);

  const availableSubCategories = React.useMemo(() => {
    if (!filters.categoryId) return [];
    return subCategories.filter((s) => s.category.id === filters.categoryId);
  }, [filters.categoryId, subCategories]);

  const table = useServerDataTable<ExpenseRecord>({
    queryKey: expensesQueryKey,
    fetchPage: fetchExpensesPage,
    initialPageSize: 20,
    initialSortKey: "dueDate",
    initialDirection: "asc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      ...(filters.status !== "ALL" ? { status: filters.status } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.subCategoryId ? { subCategoryId: filters.subCategoryId } : {}),
      ...(filters.dateRange.startDate ? { issueDateStart: filters.dateRange.startDate } : {}),
      ...(filters.dateRange.endDate ? { issueDateEnd: filters.dateRange.endDate } : {}),
      ...(filters.dateRange.startDate ? { dueDateStart: filters.dateRange.startDate } : {}),
      ...(filters.dateRange.endDate ? { dueDateEnd: filters.dateRange.endDate } : {}),
    },
  });

  const pageResponse = table.pageResponseQuery.data ?? null;
  const rows = pageResponse?.content ?? [];
  const errorMessage = table.pageResponseQuery.isError
    ? getQueryErrorMessage(table.pageResponseQuery.error, "Não foi possível carregar as despesas.")
    : null;

  const categoryNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);
  const subCategoryNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    subCategories.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [subCategories]);

  const columns = React.useMemo(
    () =>
      getExpensesTableColumns({
        categoryNameById,
        subCategoryNameById,
        renderActions: (expense) => (
          <ExpenseRowActions
            expense={expense}
            deleting={cancelMutation.isPending}
            onEdit={(row) => {
              setEditingExpense(row);
              setFormOpen(true);
            }}
            onSettle={(row) => {
              setSettlingExpense(row);
              setSettleOpen(true);
            }}
            onDelete={async (row) => {
              try {
                await cancelMutation.mutateAsync(row.id);
                success("Despesa cancelada com sucesso.");
                table.pageResponseQuery.refetch();
              } catch {
                error("Não foi possível cancelar a despesa.");
              }
            }}
          />
        ),
      }),
    [cancelMutation, categoryNameById, error, subCategoryNameById, success, table.pageResponseQuery],
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Despesas"
          description="Consulte e opere despesas com filtros e ações por linha."
          right={
            <Button
              className="gap-2"
              onClick={() => {
                setEditingExpense(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova despesa
            </Button>
          }
        />

        <FinancialRecordsFilterHeader
          title="Filtros"
          filters={filters}
          onChange={setFilters}
          categoryOptions={categories
            .filter((c) => c.movementType === "EXPENSE")
            .map((c) => ({ id: c.id, name: c.name }))}
          subCategoryOptions={availableSubCategories.map((s) => ({ id: s.id, name: s.name }))}
        />

        <Card className="border-none bg-transparent shadow-none">
          <CardContent>
            <DataTable
              columns={columns}
              data={rows}
              loading={table.pageResponseQuery.isLoading}
              error={errorMessage}
              pageResponse={pageResponse}
              sortState={{ sortKey: table.sortKey, direction: table.direction }}
              onSortChange={table.onSortChange}
              onPageChange={table.onPageChange}
              onPageSizeChange={table.onPageSizeChange}
              onRowClick={(row) => {
                setSelected(row);
                setDetailsOpen(true);
              }}
              getRowKey={(row) => row.id}
              emptyTitle="Nenhuma despesa encontrada"
              emptyDescription="Ajuste os filtros ou cadastre uma nova despesa."
              pageSizeOptions={[10, 20, 50]}
            />
          </CardContent>
        </Card>
      </div>

      <DetailsDrawer
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={selected?.description ?? "Detalhes da despesa"}
        description="Visualização rápida da despesa selecionada."
      >
        {selected ? (
          <div className="space-y-4">
            <DetailsSection title="Resumo">
              <DetailsRow label="Descrição" value={selected.description} />
              <DetailsRow label="Categoria" value={categoryNameById.get(selected.categoryId) ?? "—"} />
              <DetailsRow label="Subcategoria" value={selected.subCategoryId ? subCategoryNameById.get(selected.subCategoryId) ?? "—" : "—"} />
              <DetailsRow label="Valor previsto" value={selected.expectedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
              <DetailsRow label="Emissão" value={selected.issueDate} />
              <DetailsRow label="Vencimento" value={selected.dueDate} />
              <DetailsRow label="Tipo" value={selected.amountBehavior === "FIXED" ? "Fixo" : "Estimado"} />
              <DetailsRow label="Status" value={selected.status} />
            </DetailsSection>
          </div>
        ) : null}
      </DetailsDrawer>

      <ExpenseFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editingExpense}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          movementType: c.movementType,
        }))}
        subCategories={subCategories.map((s) => ({
          id: s.id,
          name: s.name,
          categoryId: s.category.id,
        }))}
        accounts={accounts.map((account) => ({ id: account.id, name: account.name }))}
        onSaved={() => {
          table.pageResponseQuery.refetch();
        }}
      />

      <ExpenseSettleModal
        open={settleOpen}
        onOpenChange={setSettleOpen}
        expense={settlingExpense}
        categoryName={settlingExpense ? categoryNameById.get(settlingExpense.categoryId) ?? "—" : "—"}
        subCategoryName={
          settlingExpense?.subCategoryId
            ? subCategoryNameById.get(settlingExpense.subCategoryId) ?? "—"
            : null
        }
        accounts={accounts.map((account) => ({ id: account.id, name: account.name }))}
        onSettled={() => {
          table.pageResponseQuery.refetch();
        }}
      />
    </>
  );
}
