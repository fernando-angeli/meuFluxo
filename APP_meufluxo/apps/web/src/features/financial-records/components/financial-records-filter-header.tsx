"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DateRangePicker, FilterSelect, type DateRangeValue } from "@/components/filters";

export type FinancialFilterStatus =
  | "OPEN"
  | "OVERDUE"
  | "COMPLETED"
  | "CANCELED"
  | "ALL";

export type FinancialRecordsFilterState = {
  status: FinancialFilterStatus;
  categoryId: string;
  subCategoryId: string;
  dateRange: DateRangeValue;
};

export function FinancialRecordsFilterHeader({
  title,
  filters,
  onChange,
  categoryOptions,
  subCategoryOptions,
  statusLabelOverrides,
  idPrefix = "expenses-filter",
}: {
  title: string;
  filters: FinancialRecordsFilterState;
  onChange: (next: FinancialRecordsFilterState) => void;
  categoryOptions: Array<{ id: string; name: string }>;
  subCategoryOptions: Array<{ id: string; name: string }>;
  statusLabelOverrides?: Partial<Record<FinancialFilterStatus, string>>;
  idPrefix?: string;
}) {
  const statusOptions = React.useMemo(
    () => [
      { value: "OPEN", label: statusLabelOverrides?.OPEN ?? "Em aberto" },
      { value: "OVERDUE", label: statusLabelOverrides?.OVERDUE ?? "Em atraso" },
      { value: "COMPLETED", label: statusLabelOverrides?.COMPLETED ?? "Liquidado" },
      { value: "CANCELED", label: statusLabelOverrides?.CANCELED ?? "Cancelado" },
      { value: "ALL", label: statusLabelOverrides?.ALL ?? "Todos" },
    ] as const,
    [statusLabelOverrides],
  );
  const categoryOptionsWithAll = React.useMemo(
    () => [{ value: "", label: "Todas" }, ...categoryOptions.map((c) => ({ value: c.id, label: c.name }))],
    [categoryOptions],
  );
  const subCategoryOptionsWithAll = React.useMemo(
    () => [{ value: "", label: "Todas" }, ...subCategoryOptions.map((s) => ({ value: s.id, label: s.name }))],
    [subCategoryOptions],
  );

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-status`}>Status</Label>
          <FilterSelect
            id={`${idPrefix}-status`}
            value={filters.status}
            onChange={(value) => onChange({ ...filters, status: value as FinancialFilterStatus })}
            options={statusOptions.map((item) => ({ value: item.value, label: item.label }))}
            placeholder="Status"
            triggerClassName="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 hover:border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-category`}>Categoria</Label>
          <FilterSelect
            id={`${idPrefix}-category`}
            value={filters.categoryId}
            onChange={(value) =>
              onChange({
                ...filters,
                categoryId: value,
                subCategoryId: "",
              })
            }
            options={categoryOptionsWithAll}
            placeholder="Todas"
            triggerClassName="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 hover:border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-subcategory`}>Subcategoria</Label>
          <FilterSelect
            id={`${idPrefix}-subcategory`}
            value={filters.subCategoryId}
            onChange={(value) => onChange({ ...filters, subCategoryId: value })}
            options={subCategoryOptionsWithAll}
            placeholder="Todas"
            disabled={!filters.categoryId}
            triggerClassName="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 hover:border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20 disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-period`}>Período</Label>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(dateRange) => dateRange && onChange({ ...filters, dateRange })}
            placeholder="Período"
            className="h-10 w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

