"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import type { Category, SubCategory } from "@meufluxo/types";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { useToast } from "@/components/toast";
import { extractApiError } from "@/lib/api-error";
import { getQueryErrorMessage } from "@/lib/query-error";
import {
  HierarchicalChildPanel,
  PanelSectionHeader,
  SectionEmptyState,
  SectionErrorState,
  SectionLoadingState,
} from "@/components/patterns";
import { fetchSubcategoriesPageForCategory } from "@/features/categories/subcategories.service";
import { SubcategoryFormModal } from "@/features/categories/components/subcategory-form-modal";
import { SubcategoryList } from "@/features/categories/components/subcategory-list";
import { useDeleteSubcategory } from "@/hooks/api";

type CategorySubcategoriesPanelProps = {
  category: Category;
};

/**
 * Bloco expandido sob a linha da categoria: lista subcategorias com CRUD contextual.
 * Carrega dados apenas quando montado (linha expandida).
 */
export function CategorySubcategoriesPanel({ category }: CategorySubcategoriesPanelProps) {
  const { success, error } = useToast();
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SubCategory | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<SubCategory | null>(null);

  const deleteMutation = useDeleteSubcategory();

  const sort = "name,ASC";

  const listQuery = useQuery({
    queryKey: ["subcategories", "byCategory", category.id, page, size, sort],
    queryFn: () =>
      fetchSubcategoriesPageForCategory(category.id, {
        page,
        size,
        sort,
      }),
  });

  const pageResponse = listQuery.data ?? null;
  const rows = pageResponse?.content ?? [];

  React.useEffect(() => {
    setPage(0);
  }, [category.id]);

  const errorMessage = listQuery.isError
    ? getQueryErrorMessage(
        listQuery.error,
        "Não foi possível carregar as subcategorias.",
      )
    : null;

  return (
    <HierarchicalChildPanel ariaLabel={`Subcategorias de ${category.name}`}>
      <PanelSectionHeader
        title="Subcategorias"
        subtitle={
          <>
            Vinculadas a <span className="font-medium">{category.name}</span>
          </>
        }
        action={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="gap-1.5"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Nova subcategoria
          </Button>
        }
      />

      {listQuery.isLoading ? (
        <SectionLoadingState message="Carregando subcategorias…" />
      ) : errorMessage ? (
        <SectionErrorState message={errorMessage} />
      ) : rows.length === 0 ? (
        <SectionEmptyState
          message={
            <>
              Nenhuma subcategoria nesta categoria. Use &quot;Nova subcategoria&quot; para
              adicionar.
            </>
          }
        />
      ) : (
        <>
          <SubcategoryList
            rows={rows}
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

          {pageResponse && pageResponse.totalPages > 1 ? (
            <div className="mt-3">
              <DataTablePagination
                className="border-0 bg-transparent px-0 py-0"
                page={pageResponse.page}
                size={pageResponse.size}
                totalElements={pageResponse.totalElements}
                totalPages={pageResponse.totalPages}
                first={pageResponse.first}
                last={pageResponse.last}
                onPageChange={setPage}
                onPageSizeChange={(next) => {
                  setSize(next);
                  setPage(0);
                }}
                pageSizeOptions={[5, 10, 20]}
              />
            </div>
          ) : null}
        </>
      )}

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
          deleting
            ? `Excluir "${deleting.name}"? Esta ação não pode ser desfeita.`
            : ""
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
            error(apiErr?.detail ?? "Não foi possível excluir a subcategoria");
          } finally {
            setDeleting(null);
          }
        }}
      />
    </HierarchicalChildPanel>
  );
}
