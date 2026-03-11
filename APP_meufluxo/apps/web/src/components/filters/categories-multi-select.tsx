"use client";

import type { Category } from "@meufluxo/types";

import { useCategories } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { MultiSelectDropdown } from "./multi-select-dropdown";
import type { MovementTypeFilter } from "./movement-type-select";

type CategoriesMultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  /** Filtrar categorias por tipo de movimento (opcional) */
  movementType?: MovementTypeFilter;
  className?: string;
  triggerClassName?: string;
};

/** Retorna apenas categorias pai (sem parentId), opcionalmente filtradas por tipo. */
function getParentCategories(
  categories: Category[],
  movementType?: MovementTypeFilter,
): Category[] {
  const parents = categories.filter((c) => !c.parentId);
  if (movementType === "ALL") return parents;
  if (movementType === "INCOME") return parents.filter((c) => c.type === "INCOME");
  if (movementType === "EXPENSE") return parents.filter((c) => c.type === "EXPENSE");
  return parents;
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
  const parents = getParentCategories(categories, movementType);

  const options = parents.map((c) => ({
    value: c.id,
    label: c.name,
    color: c.color,
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
