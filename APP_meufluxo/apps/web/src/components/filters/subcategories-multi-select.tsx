"use client";

import type { SubCategory } from "@meufluxo/types";

import { useSubCategories } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { MultiSelectDropdown } from "./multi-select-dropdown";

type SubcategoriesMultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  parentCategoryIds: string[];
  className?: string;
  triggerClassName?: string;
};

function filterSubCategories(subCategories: SubCategory[], parentIds: string[]): SubCategory[] {
  if (parentIds.length === 0) return subCategories;
  return subCategories.filter((subCategory) => parentIds.includes(subCategory.category.id));
}

export function SubcategoriesMultiSelect({
  value,
  onChange,
  parentCategoryIds,
  className,
  triggerClassName,
}: SubcategoriesMultiSelectProps) {
  const { data: subCategories = [], isLoading } = useSubCategories();
  const filteredSubCategories = filterSubCategories(subCategories, parentCategoryIds);
  const { t } = useTranslation();

  const options = filteredSubCategories.map((subCategory) => ({
    value: subCategory.id,
    label: subCategory.name,
  }));

  return (
    <MultiSelectDropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={t("filters.subcategories")}
      allLabel={t("filters.allSubcategories")}
      applyLabel={t("filters.apply")}
      emptyMessage={isLoading ? t("filters.loading") : t("filters.noSubcategory")}
      className={className}
      triggerClassName={triggerClassName}
    />
  );
}
