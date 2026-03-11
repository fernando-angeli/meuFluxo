"use client";

import * as React from "react";

import type { DashboardCategoryKpi } from "@meufluxo/types";

import { AnalyticPieChart } from "./analytic-pie-chart";
import { CategoryDrillDownModal } from "./category-drill-down-modal";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type CategoryAnalysisSectionProps = {
  incomeByCategory: DashboardCategoryKpi[];
  expensesByCategory: DashboardCategoryKpi[];
  totalIncome: number;
  totalExpense: number;
  periodLabel?: string;
};

export function CategoryAnalysisSection({
  incomeByCategory,
  expensesByCategory,
  totalIncome,
  totalExpense,
  periodLabel,
}: CategoryAnalysisSectionProps) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] =
    React.useState<DashboardCategoryKpi | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleCategoryClick = React.useCallback(
    (category: DashboardCategoryKpi) => {
      setSelectedCategory(category);
      setModalOpen(true);
    },
    [],
  );

  const handleModalOpenChange = React.useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) setSelectedCategory(null);
  }, []);

  return (
    <>
      <div
        className={cn(
          "grid gap-6",
          "lg:grid-cols-2",
        )}
      >
        <AnalyticPieChart
          title={t("dashboard.incomeByCategory")}
          data={incomeByCategory}
          total={totalIncome}
          onCategoryClick={handleCategoryClick}
        />
        <AnalyticPieChart
          title={t("dashboard.expensesByCategory")}
          data={expensesByCategory}
          total={totalExpense}
          onCategoryClick={handleCategoryClick}
        />
      </div>
      <CategoryDrillDownModal
        category={selectedCategory}
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        periodLabel={periodLabel}
      />
    </>
  );
}
