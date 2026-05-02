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
import {
  useAccounts,
  useCategories,
  useSubCategories,
  useCancelIncome,
} from "@/hooks/api";
import { useToast } from "@/components/toast";
import { getQueryErrorMessage } from "@/lib/query-error";
import { fetchIncomePage } from "@/features/income/income-list.service";
import { getIncomeTableColumns } from "@/features/income/income.columns";
import {
  FinancialRecordsFilterHeader,
  getDefaultFinancialRecordsFilterState,
} from "@/features/financial-records/components/financial-records-filter-header";
import { IncomeRowActions } from "@/features/income/components/income-row-actions";
import { IncomeFormModal } from "@/features/income/components/income-form-modal";
import { IncomeSettleModal } from "@/features/income/components/income-settle-modal";
import { DetailsDrawer } from "@/components/details";
import { DetailsRow, DetailsSection } from "@/components/details";
const incomeQueryKey = ["income"] as const;

export default function IncomePage() {
  const auth = useAuthOptional();
  const { success, error } = useToast();
  const cancelMutation = useCancelIncome();
  const { data: categories = [] } = useCategories({ realOnly: true });
  const { data: subCategories = [] } = useSubCategories({ realOnly: true });
  const { data: accounts = [] } = useAccounts();

  const [filters, setFilters] = React.useState(() => getDefaultFinancialRecordsFilterState());
  const [selected, setSelected] = React.useState<ExpenseRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingIncome, setEditingIncome] = React.useState<ExpenseRecord | null>(null);
  const [settleOpen, setSettleOpen] = React.useState(false);
  const [settlingIncome, setSettlingIncome] = React.useState<ExpenseRecord | null>(null);

  const table = useServerDataTable<ExpenseRecord>({
    queryKey: incomeQueryKey,
    fetchPage: fetchIncomePage,
    initialPageSize: 20,
    initialSortKey: "dueDate",
    initialDirection: "asc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      ...(filters.statuses.length ? { statuses: filters.statuses } : {}),
      ...(filters.categoryIds.length ? { categoryIds: filters.categoryIds } : {}),
      ...(filters.subCategoryIds.length ? { subCategoryIds: filters.subCategoryIds } : {}),
      ...(filters.dateRange.startDate ? { issueDateStart: filters.dateRange.startDate } : {}),
      ...(filters.dateRange.endDate ? { issueDateEnd: filters.dateRange.endDate } : {}),
      ...(filters.dateRange.startDate ? { dueDateStart: filters.dateRange.startDate } : {}),
      ...(filters.dateRange.endDate ? { dueDateEnd: filters.dateRange.endDate } : {}),
    },
  });

  const pageResponse = table.pageResponseQuery.data ?? null;
  const rows = pageResponse?.content ?? [];
  const errorMessage = table.pageResponseQuery.isError
    ? getQueryErrorMessage(table.pageResponseQuery.error, "Não foi possível carregar as contas a receber.")
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
      getIncomeTableColumns({
        categoryNameById,
        subCategoryNameById,
        renderActions: (income) => (
          <IncomeRowActions
            income={income}
            deleting={cancelMutation.isPending}
            onEdit={(row) => {
              setEditingIncome(row);
              setFormOpen(true);
            }}
            onSettle={(row) => {
              setSettlingIncome(row);
              setSettleOpen(true);
            }}
            onDelete={async (row) => {
              try {
                await cancelMutation.mutateAsync(row.id);
                success("Receita cancelada com sucesso.");
                table.pageResponseQuery.refetch();
              } catch {
                error("Não foi possível cancelar a receita.");
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
          title="Contas a Receber"
          description="Consulte e opere receitas planejadas com filtros e ações por linha."
          right={
            <Button
              className="gap-2"
              onClick={() => {
                setEditingIncome(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova receita
            </Button>
          }
        />

        <FinancialRecordsFilterHeader
          title="Filtros"
          variant="income"
          filters={filters}
          onChange={setFilters}
          idPrefix="income-filter"
          statusLabelOverrides={{
            COMPLETED: "Recebido",
            OVERDUE: "Vencido",
            OPEN: "Em aberto",
          }}
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
              emptyTitle="Nenhuma receita encontrada"
              emptyDescription="Ajuste os filtros ou cadastre uma nova receita."
              pageSizeOptions={[10, 20, 50]}
            />
          </CardContent>
        </Card>
      </div>

      <DetailsDrawer
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={selected?.description ?? "Detalhes da receita"}
        description="Visualização rápida da receita selecionada."
      >
        {selected ? (
          <div className="space-y-4">
            <DetailsSection title="Resumo">
              <DetailsRow label="Descrição" value={selected.description} />
              <DetailsRow label="Categoria" value={categoryNameById.get(selected.categoryId) ?? "—"} />
              <DetailsRow
                label="Subcategoria"
                value={
                  selected.subCategoryId ? subCategoryNameById.get(selected.subCategoryId) ?? "—" : "—"
                }
              />
              <DetailsRow
                label="Valor"
                value={selected.expectedAmount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              />
              <DetailsRow label="Emissão" value={selected.issueDate} />
              <DetailsRow label="Vencimento" value={selected.dueDate} />
              <DetailsRow label="Tipo" value={selected.amountBehavior === "FIXED" ? "Fixo" : "Estimado"} />
              <DetailsRow
                label="Status"
                value={
                  selected.status === "COMPLETED"
                    ? "Recebido"
                    : selected.status === "OVERDUE"
                      ? "Vencido"
                      : selected.status === "OPEN"
                        ? "Em aberto"
                        : selected.status === "CANCELED"
                          ? "Cancelado"
                          : selected.status
                }
              />
            </DetailsSection>
          </div>
        ) : null}
      </DetailsDrawer>

      <IncomeFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        income={editingIncome}
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
        accounts={accounts.map((account) => ({
          id: account.id,
          name: account.name,
          initialBalanceDate: account.initialBalanceDate,
        }))}
        onSaved={() => {
          table.pageResponseQuery.refetch();
        }}
      />

      <IncomeSettleModal
        open={settleOpen}
        onOpenChange={setSettleOpen}
        income={settlingIncome}
        categoryName={settlingIncome ? categoryNameById.get(settlingIncome.categoryId) ?? "—" : "—"}
        subCategoryName={
          settlingIncome?.subCategoryId
            ? subCategoryNameById.get(settlingIncome.subCategoryId) ?? "—"
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
