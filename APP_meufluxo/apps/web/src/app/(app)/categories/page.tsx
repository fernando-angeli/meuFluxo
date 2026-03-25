"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { DetailsDrawer } from "@/components/details";
import { CategoryDetails, CategoriesTable } from "@/components/categories";
import { useAuthOptional } from "@/hooks/useAuth";
import {
  categoriesQueryKey,
  useCategoryDetails,
  useDeleteCategory,
} from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { extractApiError } from "@/lib/api-error";
import { getQueryErrorMessage } from "@/lib/query-error";
import type { Category } from "@meufluxo/types";
import { CategoryFormModal } from "@/features/categories/components/category-form-modal";
import { CategoryRowActions } from "@/features/categories/components/category-row-actions";
import { getCategoriesTableColumns } from "@/features/categories/categories.columns";
import { fetchCategoriesPage } from "@/features/categories/categories.service";
import { useServerDataTable } from "@/hooks/useServerDataTable";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const auth = useAuthOptional();
  const { success, error } = useToast();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [selectedCategoryPreview, setSelectedCategoryPreview] =
    React.useState<Category | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(null);

  const deleteMutation = useDeleteCategory();
  const categoryDetailsQuery = useCategoryDetails(selectedCategoryId, detailsOpen);

  const [search, setSearch] = React.useState("");
  const normalizedSearch = search.trim().toLowerCase();

  const categoriesTable = useServerDataTable<Category>({
    queryKey: categoriesQueryKey,
    fetchPage: fetchCategoriesPage,
    initialPageSize: 10,
    initialSortKey: "name",
    initialDirection: "asc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });

  const pageResponse = categoriesTable.pageResponseQuery.data ?? null;
  const categories = pageResponse?.content ?? [];

  React.useEffect(() => {
    categoriesTable.onReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedSearch]);

  const filteredCategories = React.useMemo(() => {
    if (!normalizedSearch) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(normalizedSearch));
  }, [categories, normalizedSearch]);

  const errorMessage = categoriesTable.pageResponseQuery.isError
    ? getQueryErrorMessage(
        categoriesTable.pageResponseQuery.error,
        "Não foi possível carregar as categorias.",
      )
    : null;

  const openCreateModal = React.useCallback(() => {
    setEditingCategory(null);
    setModalOpen(true);
  }, []);

  const openDetails = React.useCallback((category: Category) => {
    setSelectedCategoryId(category.id);
    setSelectedCategoryPreview(category);
    setDetailsOpen(true);
  }, []);

  const closeDetails = React.useCallback(() => {
    setDetailsOpen(false);
  }, []);

  const openEditModal = React.useCallback((category: Category) => {
    setDetailsOpen(false);
    setEditingCategory(category);
    setModalOpen(true);
  }, []);

  const detailsErrorMessage = categoryDetailsQuery.isError
    ? getQueryErrorMessage(
        categoryDetailsQuery.error,
        "Não foi possível carregar os detalhes da categoria.",
      )
    : null;

  const selectedCategoryForEdit: Category | null =
    categoryDetailsQuery.data ?? selectedCategoryPreview;

  const renderActions = React.useCallback(
    (category: Category) => (
      <CategoryRowActions
        category={category}
        onEdit={(c) => openEditModal(c)}
        onDelete={(c) => {
          setDeletingCategory(c);
          setDeleteOpen(true);
        }}
        isDeleting={deleteMutation.isPending && deletingCategory?.id === category.id}
      />
    ),
    [deleteMutation.isPending, deletingCategory?.id, openEditModal],
  );

  const columns = React.useMemo(
    () => getCategoriesTableColumns({ renderActions }),
    [renderActions],
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={t("pages.categories.title")}
          description="Gerencie categorias para classificar entradas e saídas."
          right={
            <Button className="gap-2" variant="default" onClick={openCreateModal}>
              <Plus className="h-4 w-4" />
              Nova categoria
            </Button>
          }
        />

        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Lista</CardTitle>
              <div className="w-full max-w-sm">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome..."
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <CategoriesTable
              columns={columns}
              data={filteredCategories}
              loading={categoriesTable.pageResponseQuery.isLoading}
              error={errorMessage}
              pageResponse={pageResponse}
              sortState={{
                sortKey: categoriesTable.sortKey,
                direction: categoriesTable.direction,
              }}
              onSortChange={categoriesTable.onSortChange}
              onPageChange={categoriesTable.onPageChange}
              onPageSizeChange={categoriesTable.onPageSizeChange}
              onRowClick={openDetails}
            />
          </CardContent>
        </Card>
      </div>

      <DetailsDrawer
        isOpen={detailsOpen}
        onClose={closeDetails}
        title={
          categoryDetailsQuery.data?.name ??
          selectedCategoryPreview?.name ??
          "Detalhes da categoria"
        }
        description="Visualize os dados da categoria e as subcategorias vinculadas."
        widthClassName="w-full sm:max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeDetails}>
              Fechar
            </Button>
            <Button
              type="button"
              disabled={!selectedCategoryForEdit}
              onClick={() => {
                if (!selectedCategoryForEdit) return;
                openEditModal(selectedCategoryForEdit);
              }}
            >
              Editar categoria
            </Button>
          </div>
        }
      >
        <CategoryDetails
          category={categoryDetailsQuery.data ?? null}
          loading={categoryDetailsQuery.isLoading || categoryDetailsQuery.isFetching}
          error={detailsErrorMessage}
        />
      </DetailsDrawer>

      <CategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editingCategory}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir categoria"
        description={
          deletingCategory
            ? `Tem certeza que deseja excluir a categoria "${deletingCategory.name}"? Esta ação não pode ser desfeita.`
            : ""
        }
        cancelText="Cancelar"
        confirmText="Confirmar"
        confirmVariant="destructive"
        isConfirming={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deletingCategory) return;
          try {
            await deleteMutation.mutateAsync(deletingCategory.id);
            success("Categoria excluída com sucesso");
            setDeleteOpen(false);
            if (selectedCategoryId === deletingCategory.id) {
              setSelectedCategoryId(null);
              setSelectedCategoryPreview(null);
              setDetailsOpen(false);
            }
          } catch (err) {
            const apiErr = extractApiError(err);
            error(apiErr?.detail ?? "Não foi possível excluir a categoria");
          } finally {
            setDeletingCategory(null);
          }
        }}
      />
    </>
  );
}
