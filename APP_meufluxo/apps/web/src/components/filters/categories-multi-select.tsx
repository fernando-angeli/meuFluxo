"use client";

import type { Category } from "@meufluxo/types";

import { useCategories } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import type { MovementTypeFilter } from "./movement-type-select";
import { FilterMultiSelect } from "./filter-multi-select";

type CategoriesMultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  movementType?: MovementTypeFilter;
  className?: string;
  triggerClassName?: string;
};

function getParentCategories(categories: Category[], movementType?: MovementTypeFilter): Category[] {
  if (movementType === "ALL") return categories;
  if (movementType === "INCOME") return categories.filter((category) => category.movementType === "INCOME");
  if (movementType === "EXPENSE") return categories.filter((category) => category.movementType === "EXPENSE");
  return categories;
}

export function CategoriesMultiSelect({
  value,
  onChange,
  movementType = "ALL",
  className,
  triggerClassName,
}: CategoriesMultiSelectProps) {
  const { t } = useTranslation();
  const { data: categories = [], isLoading } = useCategories();
  const filteredCategories = getParentCategories(categories, movementType);

  const options = filteredCategories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <FilterMultiSelect
      options={options}
      value={value}
      onChange={onChange}
      allLabel={t("filters.allCategories")}
      emptyMessage={isLoading ? t("filters.loading") : t("filters.noCategory")}
      className={className}
      triggerClassName={triggerClassName}
      renderTriggerSummary={(ids) => {
        if (ids.length === 1) {
          return filteredCategories.find((c) => c.id === ids[0])?.name ?? ids[0];
        }
        return t("filters.multiSelectedCount").replace("{count}", String(ids.length));
      }}
    />
  );
}
