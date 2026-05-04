"use client";

import type { SubCategory } from "@meufluxo/types";

import { useSubCategories } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { FilterMultiSelect } from "./filter-multi-select";

type SubcategoriesMultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  parentCategoryIds: string[];
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
};

function filterSubCategories(subCategories: SubCategory[], parentIds: string[]): SubCategory[] {
  if (parentIds.length === 0) return subCategories;
  const idSet = new Set(parentIds);
  return subCategories.filter((subCategory) => idSet.has(subCategory.category.id));
}

export function SubcategoriesMultiSelect({
  value,
  onChange,
  parentCategoryIds,
  className,
  triggerClassName,
  disabled = false,
}: SubcategoriesMultiSelectProps) {
  const { data: subCategories = [], isLoading } = useSubCategories({ activeOnly: true });
  const filteredSubCategories = filterSubCategories(subCategories, parentCategoryIds);
  const { t } = useTranslation();

  const options = filteredSubCategories.map((subCategory) => ({
    value: subCategory.id,
    label: subCategory.name,
  }));

  return (
    <FilterMultiSelect
      options={options}
      value={value}
      onChange={onChange}
      allLabel={t("filters.allSubcategories")}
      emptyMessage={isLoading ? t("filters.loading") : t("filters.noSubcategory")}
      className={className}
      triggerClassName={triggerClassName}
      disabled={disabled}
      renderTriggerSummary={(ids) => {
        if (ids.length === 1) {
          return filteredSubCategories.find((s) => s.id === ids[0])?.name ?? ids[0];
        }
        return t("filters.multiSelectedCount").replace("{count}", String(ids.length));
      }}
    />
  );
}
