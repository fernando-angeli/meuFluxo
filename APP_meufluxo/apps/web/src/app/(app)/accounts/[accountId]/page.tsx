"use client";

import * as React from "react";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency } from "@meufluxo/utils";
import { getAccountTypeLabel } from "@meufluxo/types";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker, FilterSelect, MovementTypeSelect, type DateRangeValue } from "@/components/filters";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/data-table/DataTable";
import { SectionErrorState, SectionLoadingState } from "@/components/patterns";
import { useAccountDetails, useCategories, useDashboardKpis, useSubCategories } from "@/hooks/api";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useAuthOptional } from "@/hooks/useAuth";
import { getQueryErrorMessage } from "@/lib/query-error";
import { fetchCashMovementsPage, type CashMovementListItem } from "@/features/cash-movements/cash-movements-list.service";
import { getCashMovementsColumns } from "@/features/cash-movements/cash-movements.columns";
import { AnalyticPieChart, KpiCard } from "@/features/dashboard";

function toIsoDate(value: Date) {
  return format(value, "yyyy-MM-dd");
}

function getCurrentMonthRange(): DateRangeValue {
  const now = new Date();
  return {
    startDate: toIsoDate(startOfMonth(now)),
    endDate: toIsoDate(endOfMonth(now)),
  };
}

function getMonthRange(offset: number): DateRangeValue {
  const base = subMonths(new Date(), offset);
  return {
    startDate: toIsoDate(startOfMonth(base)),
    endDate: toIsoDate(endOfMonth(base)),
  };
}

function readOverdraft(account: unknown): { total: number; used: number; available: number } | null {
  const data = (account ?? {}) as Record<string, unknown>;
  const total = Number(data.overdraftLimit ?? data.specialCheckLimit ?? 0);
  if (!Number.isFinite(total) || total <= 0) return null;
  const used = Math.max(0, Number(data.overdraftUsed ?? data.specialCheckUsed ?? 0));
  return {
    total,
    used,
    available: Math.max(0, total - used),
  };
}

export default function AccountManagerPage() {
  const params = useParams<{ accountId: string }>();
  const router = useRouter();
  const auth = useAuthOptional();
  const accountId = String(params?.accountId ?? "");
  const currency = (auth?.preferences?.currency as "BRL" | "USD" | "EUR") ?? "BRL";

  const accountQuery = useAccountDetails(accountId, !!accountId);
  const { data: categories = [] } = useCategories({ realOnly: true });
  const { data: subCategories = [] } = useSubCategories({ realOnly: true });

  const [filters, setFilters] = React.useState({
    movementType: "ALL" as "ALL" | "INCOME" | "EXPENSE",
    categoryId: "",
    subCategoryId: "",
    dateRange: getCurrentMonthRange(),
  });

  const availableSubCategories = React.useMemo(() => {
    if (!filters.categoryId) return [];
    return subCategories.filter((item) => item.category.id === filters.categoryId);
  }, [filters.categoryId, subCategories]);

  const availableCategories = React.useMemo(() => {
    if (filters.movementType === "ALL") return categories;
    return categories.filter((item) => item.movementType === filters.movementType);
  }, [categories, filters.movementType]);

  const table = useServerDataTable<CashMovementListItem>({
    queryKey: ["account-manager", "movements", accountId],
    fetchPage: fetchCashMovementsPage,
    initialPageSize: 20,
    initialSortKey: "occurredAt",
    initialDirection: "desc",
    enabled: !!accountId && !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      accountId,
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.subCategoryId ? { subCategoryId: filters.subCategoryId } : {}),
      ...(filters.movementType !== "ALL" ? { movementType: filters.movementType } : {}),
      ...(filters.dateRange.startDate ? { startDate: filters.dateRange.startDate } : {}),
      ...(filters.dateRange.endDate ? { endDate: filters.dateRange.endDate } : {}),
    },
  });

  const filterKey = React.useMemo(() => JSON.stringify(filters), [filters]);
  React.useEffect(() => {
    table.onReset();
  }, [filterKey, table]);

  const dashboardKpisQuery = useDashboardKpis({
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    accountIds: [accountId],
  });

  const pageResponse = table.pageResponseQuery.data ?? null;
  const rows = pageResponse?.content ?? [];
  const account = accountQuery.data ?? null;
  const overdraft = readOverdraft(account);
  const overdraftUtilization = overdraft ? (overdraft.total > 0 ? (overdraft.used / overdraft.total) * 100 : 0) : 0;
  const columns = React.useMemo(() => getCashMovementsColumns(), []);
  const totalIncome = rows
    .filter((item) => item.movementType === "INCOME")
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalExpense = rows
    .filter((item) => item.movementType === "EXPENSE")
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  const quickMonthOptions = React.useMemo(
    () => [
      { label: "Mês atual", value: getCurrentMonthRange() },
      { label: "Mês anterior", value: getMonthRange(1) },
      { label: format(subMonths(new Date(), 2), "MMM/yyyy", { locale: ptBR }), value: getMonthRange(2) },
      { label: format(subMonths(new Date(), 3), "MMM/yyyy", { locale: ptBR }), value: getMonthRange(3) },
    ],
    [],
  );

  const tableError = table.pageResponseQuery.isError
    ? getQueryErrorMessage(table.pageResponseQuery.error, "Não foi possível carregar lançamentos desta conta.")
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={account?.name ? `Conta • ${account.name}` : "Visão gerencial da conta"}
        description="Central da conta selecionada com saldo, indicadores e lançamentos contextualizados."
        right={
          <Button type="button" variant="outline" className="gap-2" onClick={() => router.push("/accounts")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para contas
          </Button>
        }
      />

      {accountQuery.isLoading ? (
        <SectionLoadingState message="Carregando dados da conta..." />
      ) : accountQuery.isError || !account ? (
        <SectionErrorState message={getQueryErrorMessage(accountQuery.error, "Não foi possível carregar a conta.")} />
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Cabeçalho da conta</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="font-medium">{account.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-medium">{getAccountTypeLabel(account.accountType)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo atual</p>
                <p className="font-medium">{formatCurrency(account.currentBalance ?? 0, currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={account.meta.active ? "success" : "muted"}>
                  {account.meta.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">Resumo financeiro</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard title="Saldo atual" value={formatCurrency(account.currentBalance ?? 0, currency)} />
              <KpiCard title="Entradas no período" value={formatCurrency(totalIncome, currency)} tone="success" />
              <KpiCard title="Saídas no período" value={formatCurrency(totalExpense, currency)} tone="danger" />
              <KpiCard
                title="Saldo líquido do período"
                value={formatCurrency(totalIncome - totalExpense, currency)}
                tone={totalIncome - totalExpense >= 0 ? "success" : "danger"}
              />
            </div>
          </section>

          {overdraft ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cheque especial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Limite total</p>
                    <p className="font-medium">{formatCurrency(overdraft.total, currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Em uso</p>
                    <p className="font-medium">{formatCurrency(overdraft.used, currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Disponível</p>
                    <p className="font-medium">{formatCurrency(overdraft.available, currency)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Barra visual de uso</p>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, overdraftUtilization))}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-4 text-sm text-muted-foreground">
                Esta conta não possui cheque especial disponível ou o backend ainda não expôs os campos necessários.
              </CardContent>
            </Card>
          )}

          <section className="space-y-3">
            <h2 className="text-base font-semibold">Mini dashboard da conta</h2>
            {dashboardKpisQuery.isLoading ? (
              <SectionLoadingState message="Carregando indicadores da conta..." />
            ) : dashboardKpisQuery.isError || !dashboardKpisQuery.data ? (
              <SectionErrorState
                message={getQueryErrorMessage(
                  dashboardKpisQuery.error,
                  "Não foi possível carregar indicadores da conta.",
                )}
              />
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <KpiCard title="Entradas" value={formatCurrency(dashboardKpisQuery.data.totalIncome, currency)} tone="success" />
                  <KpiCard title="Saídas" value={formatCurrency(dashboardKpisQuery.data.totalExpense, currency)} tone="danger" />
                  <KpiCard
                    title="Saldo do período"
                    value={formatCurrency(dashboardKpisQuery.data.netBalance, currency)}
                    tone={dashboardKpisQuery.data.netBalance >= 0 ? "success" : "danger"}
                  />
                  <KpiCard title="Saldo atual" value={formatCurrency(dashboardKpisQuery.data.currentBalance, currency)} />
                </div>
                <AnalyticPieChart
                  title="Distribuição por categoria"
                  data={dashboardKpisQuery.data.expensesByCategory ?? []}
                  total={dashboardKpisQuery.data.totalExpense}
                  onCategoryClick={() => undefined}
                />
              </>
            )}
          </section>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lançamentos da conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <MovementTypeSelect
                    value={filters.movementType}
                    onChange={(value) => setFilters((prev) => ({ ...prev, movementType: value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="account-manager-category">Categoria</Label>
                  <FilterSelect
                    id="account-manager-category"
                    value={filters.categoryId}
                    onChange={(value) => setFilters((prev) => ({ ...prev, categoryId: value, subCategoryId: "" }))}
                    options={[
                      { value: "", label: "Todas" },
                      ...availableCategories.map((item) => ({ value: item.id, label: item.name })),
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="account-manager-subcategory">Subcategoria</Label>
                  <FilterSelect
                    id="account-manager-subcategory"
                    value={filters.subCategoryId}
                    onChange={(value) => setFilters((prev) => ({ ...prev, subCategoryId: value }))}
                    options={[
                      { value: "", label: "Todas" },
                      ...availableSubCategories.map((item) => ({ value: item.id, label: item.name })),
                    ]}
                    disabled={!filters.categoryId}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Período</Label>
                  <DateRangePicker
                    value={filters.dateRange}
                    onChange={(value) => value && setFilters((prev) => ({ ...prev, dateRange: value }))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickMonthOptions.map((item) => {
                  const selected =
                    item.value.startDate === filters.dateRange.startDate &&
                    item.value.endDate === filters.dateRange.endDate;
                  return (
                    <Button
                      key={item.label}
                      type="button"
                      size="sm"
                      variant={selected ? "default" : "outline"}
                      onClick={() => setFilters((prev) => ({ ...prev, dateRange: item.value }))}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>

              <DataTable
                columns={columns}
                data={rows}
                loading={table.pageResponseQuery.isLoading}
                error={tableError}
                pageResponse={pageResponse}
                sortState={{ sortKey: table.sortKey, direction: table.direction }}
                onSortChange={table.onSortChange}
                onPageChange={table.onPageChange}
                onPageSizeChange={table.onPageSizeChange}
                getRowKey={(row) => row.id}
                emptyTitle="Nenhum lançamento encontrado"
                emptyDescription="Ajuste os filtros para consultar os lançamentos desta conta."
                pageSizeOptions={[10, 20, 50]}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

