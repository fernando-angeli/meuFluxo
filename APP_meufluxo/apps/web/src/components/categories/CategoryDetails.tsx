"use client";

import type { Category } from "@meufluxo/types";

import {
  SectionEmptyState,
  SectionErrorState,
  SectionLoadingState,
} from "@/components/patterns";
import { CategorySubcategoriesPanel } from "@/features/categories/components/category-subcategories-panel";
import { useTranslation } from "@/lib/i18n";

export function CategoryDetails({
  category,
  loading = false,
  error = null,
}: {
  category: Category | null;
  loading?: boolean;
  error?: string | null;
}) {
  const { t } = useTranslation();

  if (loading) {
    return <SectionLoadingState message="Carregando detalhes da categoria..." />;
  }

  if (error) {
    return <SectionErrorState message={error} />;
  }

  if (!category) {
    return (
      <SectionEmptyState message="Selecione uma categoria para visualizar os detalhes." />
    );
  }

  const descriptionText = category.description?.trim()
    ? category.description.trim()
    : t("pages.categories.details.noDescription");

  const subCount =
    typeof category.subCategoryCount === "number" ? category.subCategoryCount : "—";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <section
        className="shrink-0 rounded-lg border border-border/80 bg-muted/15 px-4 py-3"
        aria-labelledby="category-summary-heading"
      >
        <h2 id="category-summary-heading" className="sr-only">
          {t("pages.categories.details.summaryTitle")}
        </h2>
        <p
          className={
            category.description?.trim()
              ? "text-sm leading-relaxed text-foreground"
              : "text-sm leading-relaxed text-muted-foreground italic"
          }
        >
          {descriptionText}
        </p>
        <dl className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-border/50 pt-3 text-sm">
          <dt className="text-muted-foreground">{t("pages.categories.details.subcategoryCountLabel")}</dt>
          <dd className="font-medium tabular-nums text-foreground">{subCount}</dd>
        </dl>
      </section>

      <CategorySubcategoriesPanel category={category} className="min-h-0 flex-1" />
    </div>
  );
}
