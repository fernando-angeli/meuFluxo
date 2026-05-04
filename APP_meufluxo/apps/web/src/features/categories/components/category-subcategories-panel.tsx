"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import type { Category, SubCategory, SortDirection } from "@meufluxo/types";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/toast";
import { extractApiError } from "@/lib/api-error";
import { getQueryErrorMessage } from "@/lib/query-error";
import { useTranslation } from "@/lib/i18n";
import {
  HierarchicalChildPanel,
  SectionEmptyState,
  SectionErrorState,
  SectionLoadingState,
} from "@/components/patterns";
import { cn } from "@/lib/utils";
import { buildPageableParams } from "@/lib/pageable";
import { fetchSubcategoriesPageForCategory } from "@/features/categories/subcategories.service";
import { SubcategoryFormModal } from "@/features/categories/components/subcategory-form-modal";
import { SubcategoryList } from "@/features/categories/components/subcategory-list";
import { useDeleteSubcategory } from "@/hooks/api";
import { InfoDialog } from "@/components/dialogs/info-dialog";
import { isDeleteBlockedByUsageMessage } from "@/features/categories/lib/delete-usage-blocked";
import {
  loadStoredSubcategoryPageSize,
  saveStoredSubcategoryPageSize,
} from "@/features/categories/lib/subcategories-panel-prefs";

type CategorySubcategoriesPanelProps = {
  category: Category;
  className?: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const NAME_SORT_KEY = "name";

function SubcategoriesPaginationBar({
  page,
  size,
  totalElements,
  totalPages,
  first,
  last,
  onPageChange,
  onPageSizeChange,
  rangeLabel,
  previousLabel,
  nextLabel,
  rowsPerPageLabel,
}: {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  onPageChange: (next: number) => void;
  onPageSizeChange: (next: number) => void;
  rangeLabel: string;
  previousLabel: string;
  nextLabel: string;
  rowsPerPageLabel: (size: number) => string;
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const currentPage = Math.min(Math.max(0, page), safeTotalPages - 1);
  const goToPage = React.useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(0, next), safeTotalPages - 1);
      onPageChange(clamped);
    },
    [onPageChange, safeTotalPages],
  );

  const visiblePages = React.useMemo(() => {
    const maxVisible = 5;
    if (safeTotalPages <= maxVisible) {
      return Array.from({ length: safeTotalPages }, (_, i) => i);
    }
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, currentPage - half);
    let end = start + maxVisible - 1;
    if (end >= safeTotalPages) {
      end = safeTotalPages - 1;
      start = end - maxVisible + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, safeTotalPages]);

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground sm:order-1">{rangeLabel}</p>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:order-3 sm:flex-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1 px-2 text-xs"
          aria-label={previousLabel}
          onClick={() => goToPage(currentPage - 1)}
          disabled={first}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {previousLabel}
        </Button>
        {visiblePages.map((pageIndex) => {
          const active = pageIndex === currentPage;
          return (
            <Button
              key={pageIndex}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              className={cn("h-8 min-w-8 px-2 text-xs tabular-nums", !active && "border-dashed")}
              onClick={() => onPageChange(pageIndex)}
              aria-current={active ? "page" : undefined}
            >
              {pageIndex + 1}
            </Button>
          );
        })}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1 px-2 text-xs"
          aria-label={nextLabel}
          onClick={() => goToPage(currentPage + 1)}
          disabled={last}
        >
          {nextLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex items-center justify-end gap-2 sm:order-2">
        <Select
          value={String(size)}
          onValueChange={(v) => {
            onPageSizeChange(Number(v));
          }}
        >
          <SelectTrigger className="h-8 w-[7.5rem] text-xs" aria-label={rowsPerPageLabel(size)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {rowsPerPageLabel(opt)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/**
 * Lista paginada de subcategorias; ordenação por nome no mesmo padrão do DataTable (cabeçalho clicável).
 */
export function CategorySubcategoriesPanel({ category, className }: CategorySubcategoriesPanelProps) {
  const { t } = useTranslation();
  const { success, error } = useToast();
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(loadStoredSubcategoryPageSize);
  const [sortKey, setSortKey] = React.useState<string | null>(NAME_SORT_KEY);
  const [direction, setDirection] = React.useState<SortDirection>("asc");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SubCategory | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<SubCategory | null>(null);
  const [usageBlockOpen, setUsageBlockOpen] = React.useState(false);
  const [usageBlockMessage, setUsageBlockMessage] = React.useState("");

  const deleteMutation = useDeleteSubcategory();
  const parentActive = category.meta.active;

  const pageable = React.useMemo(
    () =>
      buildPageableParams({
        page,
        size,
        sortField: sortKey,
        sortDirection: direction,
      }),
    [page, size, sortKey, direction],
  );

  const listQuery = useQuery({
    queryKey: [
      "subcategories",
      "byCategory",
      category.id,
      pageable.page,
      pageable.size,
      pageable.sort ?? "",
    ],
    queryFn: () => fetchSubcategoriesPageForCategory(category.id, pageable),
  });

  const pageResponse = listQuery.data ?? null;
  const rows = pageResponse?.content ?? [];
  const totalElements = pageResponse?.totalElements ?? 0;

  React.useEffect(() => {
    setPage(0);
  }, [category.id]);

  const onSortChange = React.useCallback((nextSortKey: string) => {
    setPage(0);
    if (sortKey === nextSortKey) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextSortKey);
    setDirection("asc");
  }, [sortKey]);

  const onPageSizeChange = React.useCallback((next: number) => {
    setSize(next);
    saveStoredSubcategoryPageSize(next);
    setPage(0);
  }, []);

  const errorMessage = listQuery.isError
    ? getQueryErrorMessage(listQuery.error, "Não foi possível carregar as subcategorias.")
    : null;

  const headingCount =
    typeof category.subCategoryCount === "number" ? category.subCategoryCount : totalElements;

  const rangeStart = totalElements === 0 ? 0 : page * size + 1;
  const rangeEnd = Math.min(totalElements, (page + 1) * size);
  const rangeLabel = t("pages.categories.subcategories.showingRange")
    .replace("{start}", String(rangeStart))
    .replace("{end}", String(rangeEnd))
    .replace("{total}", String(totalElements));

  const showPagination = totalElements >= 5;

  return (
    <HierarchicalChildPanel
      ariaLabel={`Subcategorias de ${category.name}`}
      className={cn(
        "ml-0 flex min-h-0 flex-1 flex-col border-0 bg-transparent py-0 pl-0 pr-0",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border/80 bg-card/40">
        <div className="flex shrink-0 flex-col gap-3 border-b border-border/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
          <h3 className="text-sm font-semibold tracking-tight">
            {t("pages.categories.subcategories.heading").replace("{count}", String(headingCount))}
          </h3>
          <Button
            type="button"
            size="sm"
            variant="default"
            className="h-9 w-full gap-1.5 shrink-0 sm:w-auto"
            disabled={!parentActive}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("pages.categories.subcategories.new")}
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4">
          {listQuery.isLoading ? (
            <SectionLoadingState message="Carregando subcategorias…" />
          ) : errorMessage ? (
            <SectionErrorState message={errorMessage} />
          ) : rows.length === 0 ? (
            <SectionEmptyState
              message={
                <>
                  Nenhuma subcategoria nesta categoria. Use &quot;{t("pages.categories.subcategories.new")}&quot; para
                  adicionar.
                </>
              }
            />
          ) : (
            <>
              <SubcategoryList
                rows={rows}
                parentActive={parentActive}
                nameColumnSort={{
                  sortKey,
                  sortField: NAME_SORT_KEY,
                  direction,
                  onSortChange,
                }}
                onEdit={(s) => {
                  setEditing(s);
                  setFormOpen(true);
                }}
                onDelete={(s) => {
                  setDeleting(s);
                  setDeleteOpen(true);
                }}
                deletingId={deleting?.id ?? null}
                isDeletePending={deleteMutation.isPending}
              />

              {showPagination && pageResponse ? (
                <SubcategoriesPaginationBar
                  page={pageResponse.page}
                  size={pageResponse.size}
                  totalElements={pageResponse.totalElements}
                  totalPages={pageResponse.totalPages}
                  first={pageResponse.first}
                  last={pageResponse.last}
                  onPageChange={setPage}
                  onPageSizeChange={onPageSizeChange}
                  rangeLabel={rangeLabel}
                  previousLabel={t("pages.categories.subcategories.previous")}
                  nextLabel={t("pages.categories.subcategories.next")}
                  rowsPerPageLabel={(s) => t("common.pagination.rowsPerPage").replace("{size}", String(s))}
                />
              ) : null}
            </>
          )}
        </div>
      </div>

      <SubcategoryFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        parentCategory={category}
        subcategory={editing}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir subcategoria"
        description={
          deleting ? `Excluir "${deleting.name}"? Esta ação não pode ser desfeita.` : ""
        }
        cancelText="Cancelar"
        confirmText="Excluir"
        confirmVariant="destructive"
        isConfirming={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteMutation.mutateAsync(deleting.id);
            success("Subcategoria excluída com sucesso");
            setDeleteOpen(false);
          } catch (err) {
            const apiErr = extractApiError(err);
            const detail = apiErr?.detail;
            if (isDeleteBlockedByUsageMessage(detail)) {
              setDeleteOpen(false);
              setUsageBlockMessage(detail ?? "");
              setUsageBlockOpen(true);
            } else {
              error(detail ?? "Não foi possível excluir a subcategoria");
            }
          } finally {
            setDeleting(null);
          }
        }}
      />

      <InfoDialog
        open={usageBlockOpen}
        onOpenChange={setUsageBlockOpen}
        title="Não é possível excluir"
        description={usageBlockMessage}
      />
    </HierarchicalChildPanel>
  );
}
