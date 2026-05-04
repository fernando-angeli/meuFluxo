"use client";

import { useMemo } from "react";
import {
  getDefaultDashboardDateRange,
  getMonthRange,
  getMonthIndexFromRange,
  getYearFromDate,
} from "@/features/dashboard/lib/date-range";
import {
  DateRangePicker,
  FilterSelect,
  AccountsMultiSelect,
  CategoriesMultiSelect,
  SubcategoriesMultiSelect,
  type DateRangeValue,
} from "@/components/filters";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type DashboardFiltersValue = {
  dateRange: DateRangeValue;
  accountIds: string[];
  categoryIds: string[];
  subcategoryIds: string[];
  /** `"__ALL__"` = todas as formas (evita string vazia no Select, que vira “não selecionado”). */
  paymentMethod: string;
  /** Quando true, inclui planejados em aberto ou em atraso (vencimento no período ou antes do início) nos KPIs, gráficos e tabela. */
  includeProjections: boolean;
};

type DashboardFiltersBarProps = {
  value: DashboardFiltersValue;
  onChange: (value: DashboardFiltersValue) => void;
  className?: string;
  compact?: boolean;
};

const defaultFilters = (): DashboardFiltersValue => {
  const { startDate, endDate } = getDefaultDashboardDateRange();
  return {
    dateRange: { startDate, endDate },
    accountIds: [],
    categoryIds: [],
    subcategoryIds: [],
    paymentMethod: "__ALL__",
    includeProjections: false,
  };
};

export function getDefaultDashboardFilters(): DashboardFiltersValue {
  return defaultFilters();
}

const FILTER_HEIGHT = "h-10";
const FILTER_MIN_WIDTH = "min-w-[140px]";
const FILTER_DATE_WIDTH = "min-w-[180px] sm:min-w-[200px]";
const YEAR_MIN_WIDTH = "min-w-[100px]";

/** Abreviações dos meses em PT-BR para os atalhos rápidos */
const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/** Gera opções de ano para o seletor, incluindo o ano atual quando fora do range padrão */
function getYearOptions(selectedYear: number): { value: string; label: string }[] {
  const current = new Date().getFullYear();
  const from = Math.min(current - 5, selectedYear);
  const to = Math.max(current + 1, selectedYear);
  const options: { value: string; label: string }[] = [];
  for (let y = to; y >= from; y--) {
    options.push({ value: String(y), label: String(y) });
  }
  return options;
}

export function DashboardFiltersBar({
  value,
  onChange,
  className,
  compact = false,
}: DashboardFiltersBarProps) {
  const { t } = useTranslation();
  const update = (patch: Partial<DashboardFiltersValue>) => {
    onChange({ ...value, ...patch });
  };

  const { startDate, endDate } = value.dateRange;
  const selectedYear = useMemo(
    () => getYearFromDate(startDate),
    [startDate],
  );
  const activeMonthIndex = useMemo(
    () => getMonthIndexFromRange(startDate, endDate),
    [startDate, endDate],
  );
  const yearOptions = useMemo(
    () => getYearOptions(selectedYear),
    [selectedYear],
  );

  const paymentMethodOptions = useMemo(
    () => [
      { value: "__ALL__", label: t("filters.paymentMethod.all") },
      { value: "PIX", label: "PIX" },
      { value: "DEBIT", label: t("filters.paymentMethod.debit") },
      { value: "CASH", label: t("filters.paymentMethod.cash") },
      { value: "TRANSFER", label: t("filters.paymentMethod.transfer") },
      { value: "BOLETO", label: t("filters.paymentMethod.boleto") },
      { value: "VA", label: t("filters.paymentMethod.va") },
      { value: "INVOICE_CREDIT_CARD", label: t("filters.paymentMethod.invoiceCard") },
    ],
    [t],
  );

  const handleYearChange = (yearStr: string) => {
    const newYear = parseInt(yearStr, 10);
    if (Number.isNaN(newYear)) return;
    if (activeMonthIndex !== null) {
      update({
        dateRange: getMonthRange(newYear, activeMonthIndex),
      });
    } else {
      update({
        dateRange: getMonthRange(newYear, 0),
      });
    }
  };

  const handleMonthClick = (monthIndex: number) => {
    update({
      dateRange: getMonthRange(selectedYear, monthIndex),
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        compact && "flex-col sm:flex-row sm:flex-wrap",
        className,
      )}
    >
      {/* Primeira linha: filtros de período */}
      <div
        className={cn(
          "flex flex-wrap items-stretch gap-3",
          compact && "flex-col sm:flex-row",
        )}
      >
        <div
          className={cn(
            "flex items-center",
            FILTER_HEIGHT,
            YEAR_MIN_WIDTH,
          )}
        >
          <FilterSelect
            value={String(selectedYear)}
            onChange={handleYearChange}
            options={yearOptions}
            placeholder={t("filters.year")}
            triggerClassName={cn(
              "h-full w-full rounded-xl border border-input bg-background shadow-sm transition-colors",
              "hover:bg-muted/50 hover:border-input",
              "focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
              FILTER_HEIGHT,
            )}
          />
        </div>
        <div
          className={cn(
            "flex items-center",
            FILTER_HEIGHT,
            FILTER_DATE_WIDTH,
          )}
        >
          <DateRangePicker
            value={value.dateRange}
            onChange={(dateRange) => dateRange && update({ dateRange })}
            placeholder={t("filters.period")}
            className={cn("h-full w-full", FILTER_HEIGHT)}
          />
        </div>
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5",
            FILTER_HEIGHT,
          )}
          role="group"
          aria-label={t("filters.quickMonths")}
        >
          {MONTH_LABELS.map((label, index) => {
            const isActive =
              activeMonthIndex === index &&
              getYearFromDate(startDate) === selectedYear;
            return (
              <Button
                key={label}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 min-w-[2.25rem] rounded-lg px-2 text-xs font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive &&
                    "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                )}
                onClick={() => handleMonthClick(index)}
                aria-pressed={isActive}
                aria-label={`${label} ${selectedYear}`}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-input bg-muted/20 px-3 py-2.5">
          <Switch
            checked={value.includeProjections}
            onCheckedChange={(checked) => update({ includeProjections: checked })}
            aria-label={t("dashboard.includeProjections.aria")}
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium leading-tight">{t("dashboard.includeProjections.label")}</p>
            <p className="text-xs text-muted-foreground">{t("dashboard.includeProjections.hint")}</p>
          </div>
        </div>
      )}

      {/* Segunda linha: filtros complementares */}
      {!compact && (
        <div className="flex flex-wrap items-stretch gap-3">
          <div
            className={cn(
              "flex items-center",
              FILTER_HEIGHT,
              FILTER_MIN_WIDTH,
            )}
          >
            <AccountsMultiSelect
              value={value.accountIds}
              onChange={(accountIds) => update({ accountIds })}
              triggerClassName={cn("h-full w-full", FILTER_HEIGHT)}
            />
          </div>
          <div
            className={cn(
              "flex items-center",
              FILTER_HEIGHT,
              FILTER_MIN_WIDTH,
            )}
          >
            <CategoriesMultiSelect
              value={value.categoryIds}
              onChange={(categoryIds) => update({ categoryIds })}
              triggerClassName={cn("h-full w-full", FILTER_HEIGHT)}
            />
          </div>
          <div
            className={cn(
              "flex items-center",
              FILTER_HEIGHT,
              FILTER_MIN_WIDTH,
            )}
          >
            <SubcategoriesMultiSelect
              value={value.subcategoryIds}
              onChange={(subcategoryIds) => update({ subcategoryIds })}
              parentCategoryIds={value.categoryIds}
              triggerClassName={cn("h-full w-full", FILTER_HEIGHT)}
            />
          </div>
          <div
            className={cn(
              "flex items-center",
              FILTER_HEIGHT,
              "min-w-[160px]",
            )}
          >
            <FilterSelect
              value={value.paymentMethod}
              onChange={(paymentMethod) => update({ paymentMethod })}
              options={paymentMethodOptions}
              placeholder={t("filters.paymentMethod.placeholder")}
              triggerClassName={cn(
                "h-full w-full rounded-xl border border-input bg-background shadow-sm transition-colors",
                "hover:bg-muted/50 hover:border-input",
                "focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
                FILTER_HEIGHT,
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
