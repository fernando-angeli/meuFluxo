"use client";

import { getDefaultDashboardDateRange } from "@/features/dashboard/lib/date-range";
import {
  DateRangePicker,
  MovementTypeSelect,
  AccountsMultiSelect,
  CategoriesMultiSelect,
  SubcategoriesMultiSelect,
  type DateRangeValue,
  type MovementTypeFilter,
} from "@/components/filters";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type DashboardFiltersValue = {
  dateRange: DateRangeValue;
  movementType: MovementTypeFilter;
  accountIds: string[];
  categoryIds: string[];
  subcategoryIds: string[];
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
    movementType: "ALL",
    accountIds: [],
    categoryIds: [],
    subcategoryIds: [],
  };
};

export function getDefaultDashboardFilters(): DashboardFiltersValue {
  return defaultFilters();
}

const FILTER_HEIGHT = "h-10";
const FILTER_MIN_WIDTH = "min-w-[140px]";
const FILTER_DATE_WIDTH = "min-w-[180px] sm:min-w-[200px]";

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

  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch gap-3",
        compact && "flex-col sm:flex-row",
        className,
      )}
    >
      <div className={cn("flex items-center", FILTER_HEIGHT, FILTER_DATE_WIDTH)}>
        <DateRangePicker
          value={value.dateRange}
          onChange={(dateRange) => dateRange && update({ dateRange })}
          placeholder={t("filters.period")}
          className={cn("h-full w-full", FILTER_HEIGHT)}
        />
      </div>
      {!compact && (
        <>
          <div className={cn("flex items-center", FILTER_HEIGHT, FILTER_MIN_WIDTH)}>
            <MovementTypeSelect
              value={value.movementType}
              onChange={(movementType) => update({ movementType })}
              placeholder={t("filters.type")}
              className={cn("h-full w-full", FILTER_HEIGHT)}
            />
          </div>
          <div className={cn("flex items-center", FILTER_HEIGHT, FILTER_MIN_WIDTH)}>
            <AccountsMultiSelect
              value={value.accountIds}
              onChange={(accountIds) => update({ accountIds })}
              triggerClassName={cn("h-full w-full", FILTER_HEIGHT)}
            />
          </div>
          <div className={cn("flex items-center", FILTER_HEIGHT, FILTER_MIN_WIDTH)}>
            <CategoriesMultiSelect
              value={value.categoryIds}
              onChange={(categoryIds) => update({ categoryIds })}
              movementType={value.movementType}
              triggerClassName={cn("h-full w-full", FILTER_HEIGHT)}
            />
          </div>
          <div className={cn("flex items-center", FILTER_HEIGHT, FILTER_MIN_WIDTH)}>
            <SubcategoriesMultiSelect
              value={value.subcategoryIds}
              onChange={(subcategoryIds) => update({ subcategoryIds })}
              parentCategoryIds={value.categoryIds}
              triggerClassName={cn("h-full w-full", FILTER_HEIGHT)}
            />
          </div>
        </>
      )}
    </div>
  );
}
