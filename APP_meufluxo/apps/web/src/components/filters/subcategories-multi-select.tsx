"use client";

import type { Category } from "@meufluxo/types";

import { useCategories } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { MultiSelectDropdown } from "./multi-select-dropdown";

type SubcategoriesMultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  /** IDs das categorias pai selecionadas; subcategorias são filtradas por esses pais. Vazio = mostra todas as subcategorias. */
  parentCategoryIds: string[];
  className?: string;
  triggerClassName?: string;
};

function getSubcategories(
  categories: Category[],
  parentIds: string[],
): Category[] {
  const subcategories = categories.filter((c) => c.parentId != null);
  if (parentIds.length === 0) return subcategories;
  return subcategories.filter((c) => c.parentId && parentIds.includes(c.parentId));
}

export function SubcategoriesMultiSelect({
  value,
  onChange,
  parentCategoryIds,
  className,
  triggerClassName,
}: SubcategoriesMultiSelectProps) {
  const { data: categories = [], isLoading } = useCategories();
  const subcategories = getSubcategories(categories, parentCategoryIds);

  const options = subcategories.map((c) => ({
    value: c.id,
    label: c.name,
    color: c.color,
  }));

  const { t } = useTranslation();
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
