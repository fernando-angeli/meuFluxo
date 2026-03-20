"use client";

import type { Category } from "@meufluxo/types";

import { useCategories } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { MultiSelectDropdown } from "./multi-select-dropdown";
import type { MovementTypeFilter } from "./movement-type-select";

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
    <MultiSelectDropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={t("filters.categories")}
      allLabel={t("filters.allCategories")}
      applyLabel={t("filters.apply")}
      emptyMessage={isLoading ? t("filters.loading") : t("filters.noCategory")}
      className={className}
      triggerClassName={triggerClassName}
    />
  );
}
