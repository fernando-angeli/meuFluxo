"use client";

import * as React from "react";

import type { PlannedEntryStatus } from "@meufluxo/types";
import { CategoriesMultiSelect, DateRangePicker, SubcategoriesMultiSelect, type DateRangeValue } from "@/components/filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";
import { getDefaultPlannedEntriesDateRange } from "@/features/financial-records/lib/date-range";
import { PlannedStatusMultiSelect } from "./planned-status-multi-select";

export type FinancialRecordsFilterState = {
  /** Vazio = nenhum status selecionado (API sem filtro de status). */
  statuses: PlannedEntryStatus[];
  categoryIds: string[];
  subCategoryIds: string[];
  dateRange: DateRangeValue;
};

export function getDefaultFinancialRecordsFilterState(): FinancialRecordsFilterState {
  return {
    statuses: ["OPEN", "OVERDUE"],
    categoryIds: [],
    subCategoryIds: [],
    dateRange: getDefaultPlannedEntriesDateRange(),
  };
}

export function FinancialRecordsFilterHeader({
  title,
  filters,
  onChange,
  variant,
  statusLabelOverrides,
  idPrefix = "financial-filter",
}: {
  title: string;
  filters: FinancialRecordsFilterState;
  onChange: (next: FinancialRecordsFilterState) => void;
  variant: "income" | "expense";
  statusLabelOverrides?: Partial<Record<PlannedEntryStatus, string>>;
  idPrefix?: string;
}) {
  const { t } = useTranslation();
  const movementType = variant === "income" ? "INCOME" : "EXPENSE";

  const statusLabels = React.useMemo(
    (): Partial<Record<PlannedEntryStatus, string>> => ({
      OPEN: statusLabelOverrides?.OPEN ?? "Em aberto",
      OVERDUE: statusLabelOverrides?.OVERDUE ?? "Vencido",
      COMPLETED: statusLabelOverrides?.COMPLETED ?? "Liquidado",
      CANCELED: statusLabelOverrides?.CANCELED ?? "Cancelado",
    }),
    [statusLabelOverrides],
  );

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor={`${idPrefix}-status`}>{t("table.status")}</Label>
            <PlannedStatusMultiSelect
              value={filters.statuses}
              onChange={(statuses) => onChange({ ...filters, statuses })}
              labelByStatus={statusLabels}
              triggerClassName="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 hover:border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor={`${idPrefix}-categories`}>{t("filters.categories")}</Label>
            <CategoriesMultiSelect
              value={filters.categoryIds}
              onChange={(categoryIds) => onChange({ ...filters, categoryIds, subCategoryIds: [] })}
              movementType={movementType}
              triggerClassName="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 hover:border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor={`${idPrefix}-subcategories`}>{t("filters.subcategories")}</Label>
            <SubcategoriesMultiSelect
              value={filters.subCategoryIds}
              onChange={(subCategoryIds) => onChange({ ...filters, subCategoryIds })}
              parentCategoryIds={filters.categoryIds}
              triggerClassName="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 hover:border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor={`${idPrefix}-period`}>{t("filters.period")}</Label>
            <DateRangePicker
              value={filters.dateRange}
              onChange={(dateRange) => dateRange && onChange({ ...filters, dateRange })}
              placeholder={t("filters.selectPeriod")}
              className="h-10 w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
