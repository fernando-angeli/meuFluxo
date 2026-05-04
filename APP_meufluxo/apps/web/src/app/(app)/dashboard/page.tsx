"use client";

import { Fragment, useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@meufluxo/utils";

import {
  CategoryAnalysisSection,
  DashboardMovementsTable,
  DashboardSkeleton,
  KpiCard,
  TemporalEvolutionChart,
} from "@/features/dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardFiltersBar, getDefaultDashboardFilters } from "@/components/filters";
import { toDashboardKpisParams } from "@/features/dashboard/lib/kpis-params";
import { useDashboardKpis } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [filters, setFilters] = useState(getDefaultDashboardFilters);
  const { startDate, endDate } = filters.dateRange;
  const periodLabel = `${format(parse(startDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy", { locale: ptBR })} - ${format(parse(endDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy", { locale: ptBR })}`;

  const kpisParams = useMemo(() => toDashboardKpisParams(filters), [filters]);

  const chartsRemountKey = useMemo(
    () =>
      [
        filters.dateRange.startDate,
        filters.dateRange.endDate,
        filters.includeProjections,
        filters.paymentMethod,
        filters.accountIds.join(","),
        filters.categoryIds.join(","),
        filters.subcategoryIds.join(","),
      ].join("|"),
    [filters],
  );

  const { data, isLoading, isError, error } = useDashboardKpis(kpisParams);

  const { t } = useTranslation();

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: string }).message)
        : t("dashboard.loadError");
    return (
      <div className="space-y-6">
        <PageHeader title={t("dashboard.title")} description={t("dashboard.errorSummary")} />
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-center text-muted-foreground">{message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const empty =
    data.totalIncome === 0 &&
    data.totalExpense === 0 &&
    data.expensesByCategory.length === 0 &&
    data.incomeByCategory.length === 0;

  return (
    <div className="space-y-8">
      <PageHeader title={t("dashboard.title")} />
      <DashboardFiltersBar value={filters} onChange={setFilters} />

      <section aria-label={t("dashboard.indicators")}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title={t("dashboard.currentBalance")}
            value={formatCurrency(data.currentBalance)}
            tone={data.currentBalance >= 0 ? "success" : "danger"}
          />
          <KpiCard
            title={t("dashboard.income")}
            value={formatCurrency(data.totalIncome)}
            tone="success"
          />
          <KpiCard
            title={t("dashboard.expenses")}
            value={formatCurrency(data.totalExpense)}
            tone="danger"
          />
          <KpiCard
            title={t("dashboard.netBalance")}
            value={formatCurrency(data.netBalance)}
            tone={data.netBalance >= 0 ? "success" : "danger"}
          />
        </div>
      </section>

      {empty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">
              {t("dashboard.emptyMessage")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Fragment key={chartsRemountKey}>
            <section aria-label={t("dashboard.analysisByCategory")}>
              <CategoryAnalysisSection
                incomeByCategory={data.incomeByCategory ?? []}
                expensesByCategory={data.expensesByCategory}
                totalIncome={data.totalIncome}
                totalExpense={data.totalExpense}
                periodLabel={periodLabel}
              />
            </section>

            <section aria-label={t("dashboard.temporalEvolution")}>
              <TemporalEvolutionChart
                data={
                  data.temporalEvolution ?? {
                    labels: [],
                    income: [],
                    expenses: [],
                  }
                }
              />
            </section>
          </Fragment>

          <section aria-label={t("dashboard.movements")}>
            <DashboardMovementsTable filters={filters} />
          </section>
        </>
      )}
    </div>
  );
}
