"use client";

import { useTranslation } from "@/lib/i18n";
import { FilterSelect } from "./filter-select";

export type MovementTypeFilter = "ALL" | "INCOME" | "EXPENSE";

type MovementTypeSelectProps = {
  value: MovementTypeFilter;
  onChange: (value: MovementTypeFilter) => void;
  className?: string;
  placeholder?: string;
};

export function MovementTypeSelect({
  value,
  onChange,
  className,
  placeholder,
}: MovementTypeSelectProps) {
  const { t } = useTranslation();
  const options = [
    { value: "ALL" as const, label: t("filters.movementType.all") },
    { value: "INCOME" as const, label: t("filters.movementType.income") },
    { value: "EXPENSE" as const, label: t("filters.movementType.expense") },
  ];
  return (
    <FilterSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder ?? t("filters.type")}
      triggerClassName={className}
    />
  );
}
