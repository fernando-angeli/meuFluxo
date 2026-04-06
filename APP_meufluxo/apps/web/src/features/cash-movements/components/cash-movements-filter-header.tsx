"use client";

import * as React from "react";

import type { DateRangeValue, MovementTypeFilter } from "@/components/filters";
import { AccountsMultiSelect, DateRangePicker, FilterSelect, MovementTypeSelect } from "@/components/filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export type CashMovementsFilterState = {
  accountIds: string[];
  movementType: MovementTypeFilter;
  categoryId: string;
  subCategoryId: string;
  dateRange: DateRangeValue;
};

export function CashMovementsFilterHeader({
  filters,
  onChange,
  categoryOptions,
  subCategoryOptions,
}: {
  filters: CashMovementsFilterState;
  onChange: (next: CashMovementsFilterState) => void;
  categoryOptions: Array<{ id: string; name: string }>;
  subCategoryOptions: Array<{ id: string; name: string }>;
}) {
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
        <CardTitle className="text-base">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-5">
        <div className="space-y-1.5">
          <Label htmlFor="statement-filter-accounts">Contas</Label>
          <AccountsMultiSelect
            value={filters.accountIds}
            onChange={(value) => onChange({ ...filters, accountIds: value })}
            triggerClassName="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 hover:border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="statement-filter-type">Tipo</Label>
          <MovementTypeSelect
            value={filters.movementType}
            onChange={(value) => onChange({ ...filters, movementType: value })}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 hover:border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="statement-filter-category">Categoria</Label>
          <FilterSelect
            id="statement-filter-category"
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
          <Label htmlFor="statement-filter-subcategory">Subcategoria</Label>
          <FilterSelect
            id="statement-filter-subcategory"
            value={filters.subCategoryId}
            onChange={(value) => onChange({ ...filters, subCategoryId: value })}
            options={subCategoryOptionsWithAll}
            placeholder="Todas"
            disabled={!filters.categoryId}
            triggerClassName="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 hover:border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20 disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="statement-filter-period">Período</Label>
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
