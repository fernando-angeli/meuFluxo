"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SectionErrorState, SectionLoadingState } from "@/components/patterns";
import { useAccountDetails, useCategories, useSubCategories } from "@/hooks/api";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useAuthOptional } from "@/hooks/useAuth";
import { getQueryErrorMessage } from "@/lib/query-error";
import { fetchCashMovementsPage, type CashMovementListItem } from "@/features/cash-movements/cash-movements-list.service";
import { getCashMovementsColumns } from "@/features/cash-movements/cash-movements.columns";
import { AccountHeroCard } from "@/features/accounts/components/account-hero-card";
import {
  AccountMovementsFilters,
  type AccountMovementsFilterState,
  monthRangeForDate,
} from "@/features/accounts/components/account-movements-filters";
import { AccountMovementsSummary } from "@/features/accounts/components/account-movements-summary";
import { AccountMovementsTableCard } from "@/features/accounts/components/account-movements-table-card";
import { useAccountMovementTotals } from "@/features/accounts/hooks/use-account-movement-totals";
import { useAccountFutureMovementMonthKeys } from "@/features/accounts/hooks/use-account-future-movement-month-keys";

const EMPTY_RUNNING_BALANCE_MAP = new Map<string, number>();

function getDefaultFilters(): AccountMovementsFilterState {
  return {
    categoryId: "",
    subCategoryId: "",
    dateRange: monthRangeForDate(new Date()),
  };
}

export default function AccountManagerPage() {
  const params = useParams<{ accountId: string }>();
  const router = useRouter();
  const auth = useAuthOptional();
  const accountId = String(params?.accountId ?? "");
  const currency = (auth?.preferences?.currency as "BRL" | "USD" | "EUR") ?? "BRL";

  const accountQuery = useAccountDetails(accountId, !!accountId);
  const futureMonthKeysQuery = useAccountFutureMovementMonthKeys(
    accountId,
    !!accountId && !auth?.isBootstrapping && !!auth?.isAuthenticated,
  );
  const { data: categories = [] } = useCategories({ realOnly: true });
  const { data: subCategories = [] } = useSubCategories({ realOnly: true });

  const [filters, setFilters] = React.useState<AccountMovementsFilterState>(() => getDefaultFilters());

  const availableSubCategories = React.useMemo(() => {
    if (!filters.categoryId) return [];
    return subCategories.filter((item) => item.category.id === filters.categoryId);
  }, [filters.categoryId, subCategories]);

  const categoryOptions = React.useMemo(
    () => categories.map((item) => ({ id: item.id, name: item.name })),
    [categories],
  );

  const table = useServerDataTable<CashMovementListItem>({
    queryKey: ["account-manager", "movements", accountId],
    fetchPage: fetchCashMovementsPage,
    initialPageSize: 20,
    initialSortKey: "occurredAt",
    initialDirection: "asc",
    enabled: !!accountId && !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      accountId,
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.subCategoryId ? { subCategoryId: filters.subCategoryId } : {}),
      ...(filters.dateRange.startDate ? { startDate: filters.dateRange.startDate } : {}),
      ...(filters.dateRange.endDate ? { endDate: filters.dateRange.endDate } : {}),
    },
  });

  const filterKey = React.useMemo(() => JSON.stringify(filters), [filters]);
  React.useEffect(() => {
    table.onReset();
  }, [filterKey, table]);

  const account = accountQuery.data ?? null;

  const totalsQuery = useAccountMovementTotals({
    accountId,
    categoryId: filters.categoryId,
    subCategoryId: filters.subCategoryId,
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    currentBalance:
      account != null && Number.isFinite(account.currentBalance) ? account.currentBalance : 0,
    enabled:
      !!accountId &&
      !auth?.isBootstrapping &&
      !!auth?.isAuthenticated &&
      !!account &&
      Number.isFinite(account.currentBalance),
  });

  const pageResponse = table.pageResponseQuery.data ?? null;
  const rows = pageResponse?.content ?? [];

  const columns = React.useMemo(
    () =>
      getCashMovementsColumns({
        currency,
        accountStatement: {
          runningBalanceById: totalsQuery.data?.runningBalanceById ?? EMPTY_RUNNING_BALANCE_MAP,
          runningBalancesLoading: totalsQuery.isLoading || totalsQuery.isFetching,
        },
      }),
    [
      currency,
      totalsQuery.data?.runningBalanceById,
      totalsQuery.isLoading,
      totalsQuery.isFetching,
    ],
  );

  const tableError = table.pageResponseQuery.isError
    ? getQueryErrorMessage(table.pageResponseQuery.error, "Não foi possível carregar lançamentos desta conta.")
    : null;

  const totalsError = totalsQuery.isError
    ? getQueryErrorMessage(totalsQuery.error, "Não foi possível calcular o resumo do período.")
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão da conta"
        description="Filtre por período e categoria para analisar totais e lançamentos desta conta."
        className="sm:items-center"
        right={
          <Button type="button" variant="outline" className="gap-2 shrink-0" onClick={() => router.push("/accounts")}>
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
          <AccountHeroCard account={account} currency={currency} />

          <AccountMovementsFilters
            filters={filters}
            onChange={setFilters}
            categoryOptions={categoryOptions}
            subCategoryOptions={availableSubCategories.map((item) => ({ id: item.id, name: item.name }))}
            futureMovementMonthKeys={futureMonthKeysQuery.data ?? []}
            initialBalanceDate={account.initialBalanceDate}
            disabled={auth?.isBootstrapping || !auth?.isAuthenticated}
          />

          <AccountMovementsSummary
            currency={currency}
            totalIncome={totalsQuery.data?.totalIncome ?? 0}
            totalExpense={totalsQuery.data?.totalExpense ?? 0}
            currentBalance={account.currentBalance}
            loading={totalsQuery.isLoading || totalsQuery.isFetching}
            errorMessage={totalsError}
          />

          <AccountMovementsTableCard
            columns={columns}
            data={rows}
            loading={table.pageResponseQuery.isLoading}
            error={tableError}
            pageResponse={pageResponse}
            sortState={{ sortKey: table.sortKey, direction: table.direction }}
            onSortChange={table.onSortChange}
            onPageChange={table.onPageChange}
            onPageSizeChange={table.onPageSizeChange}
          />
        </>
      )}
    </div>
  );
}
