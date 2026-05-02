"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { DateRangePicker, FilterSelect, type DateRangeValue } from "@/components/filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { AccountMovementMonthButtons } from "./account-movement-month-buttons";

export type AccountMovementsFilterState = {
  categoryId: string;
  subCategoryId: string;
  dateRange: DateRangeValue;
};

export { monthRangeForDate } from "@/features/accounts/lib/account-movement-month-ranges";

function toMonthKey(value?: string | null): string | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (iso) return `${iso[1]}-${iso[2]}`;
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  if (br) return `${br[3]}-${br[2]}`;
  return undefined;
}

export function AccountMovementsFilters({
  filters,
  onChange,
  categoryOptions,
  subCategoryOptions,
  futureMovementMonthKeys,
  initialBalanceDate,
  disabled,
}: {
  filters: AccountMovementsFilterState;
  onChange: (next: AccountMovementsFilterState) => void;
  categoryOptions: Array<{ id: string; name: string }>;
  subCategoryOptions: Array<{ id: string; name: string }>;
  futureMovementMonthKeys: readonly string[];
  initialBalanceDate?: string | null;
  disabled?: boolean;
}) {
  const minMonthKey = toMonthKey(initialBalanceDate);

  const periodLabel = React.useMemo(() => {
    try {
      const a = parseISO(filters.dateRange.startDate);
      const b = parseISO(filters.dateRange.endDate);
      return `${format(a, "dd/MM/yyyy", { locale: ptBR })} – ${format(b, "dd/MM/yyyy", { locale: ptBR })}`;
    } catch {
      return null;
    }
  }, [filters.dateRange.endDate, filters.dateRange.startDate]);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="acc-mov-category">Categoria</Label>
            <FilterSelect
              id="acc-mov-category"
              value={filters.categoryId}
              onChange={(value) =>
                onChange({
                  ...filters,
                  categoryId: value,
                  subCategoryId: "",
                })
              }
              options={[
                { value: "", label: "Todas" },
                ...categoryOptions.map((item) => ({ value: item.id, label: item.name })),
              ]}
              disabled={disabled}
              triggerClassName="h-10 w-full"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acc-mov-subcategory">Subcategoria</Label>
            <FilterSelect
              id="acc-mov-subcategory"
              value={filters.subCategoryId}
              onChange={(value) => onChange({ ...filters, subCategoryId: value })}
              options={[
                { value: "", label: "Todas" },
                ...subCategoryOptions.map((item) => ({ value: item.id, label: item.name })),
              ]}
              disabled={disabled || !filters.categoryId}
              triggerClassName="h-10 w-full"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label>Período selecionado</Label>
            <DateRangePicker
              value={filters.dateRange}
              onChange={(value) => value && onChange({ ...filters, dateRange: value })}
              placeholder="Intervalo de datas"
              className="h-10 w-full"
            />
          </div>
        </div>

        <AccountMovementMonthButtons
          filters={filters}
          onChange={onChange}
          futureMovementMonthKeys={futureMovementMonthKeys}
          minMonthKey={minMonthKey}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
