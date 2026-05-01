"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { DateRangeValue } from "@/components/filters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  buildAccountMonthQuickRanges,
  rangesEqual,
} from "@/features/accounts/lib/account-movement-month-ranges";

export type AccountMovementMonthFilterSlice = {
  categoryId: string;
  subCategoryId: string;
  dateRange: DateRangeValue;
};

export function AccountMovementMonthButtons({
  filters,
  onChange,
  futureMovementMonthKeys,
  minMonthKey,
  disabled,
}: {
  filters: AccountMovementMonthFilterSlice;
  onChange: (next: AccountMovementMonthFilterSlice) => void;
  futureMovementMonthKeys: readonly string[];
  minMonthKey?: string;
  disabled?: boolean;
}) {
  const futureSet = React.useMemo(
    () => new Set(futureMovementMonthKeys),
    [futureMovementMonthKeys],
  );

  const monthQuickRanges = React.useMemo(
    () =>
      buildAccountMonthQuickRanges({
        today: new Date(),
        futureMonthKeysWithMovements: futureSet,
        minMonthKey,
      }),
    [futureSet, minMonthKey],
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Atalhos de mês</p>
      <div
        className={cn(
          "flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]",
          "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80",
        )}
      >
        {monthQuickRanges.map((range) => {
          const start = parseISO(range.startDate);
          const label = format(start, "MM/yyyy", { locale: ptBR });
          const selected = rangesEqual(filters.dateRange, range);
          return (
            <Button
              key={range.startDate}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              className={cn(
                "min-w-[4.25rem] shrink-0 rounded-lg tabular-nums",
                selected && "shadow-sm ring-2 ring-primary/30 dark:ring-primary/40",
              )}
              disabled={disabled}
              onClick={() => onChange({ ...filters, dateRange: range })}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
