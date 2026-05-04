"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { InfoDialog } from "@/components/dialogs/info-dialog";
import { isDeleteBlockedByUsageMessage } from "@/features/categories/lib/delete-usage-blocked";
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
import { TRANSACTION_MOVEMENT_TYPE_LABELS } from "@meufluxo/types";
import { Badge } from "@/components/ui/badge";
import { AccountStatusBadge } from "@/features/accounts/components/account-status-badge";
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
  const [usageBlockOpen, setUsageBlockOpen] = React.useState(false);
  const [usageBlockMessage, setUsageBlockMessage] = React.useState("");

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

  const drawerCategory: Category | null =
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
          <span className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
            <span className="min-w-0 break-words">
              {drawerCategory?.name ??
                selectedCategoryPreview?.name ??
                t("pages.categories.title")}
            </span>
            {drawerCategory ? (
              <span className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={drawerCategory.movementType === "INCOME" ? "success" : "secondary"}
                  className="w-fit shrink-0 rounded-md font-normal"
                >
                  {TRANSACTION_MOVEMENT_TYPE_LABELS[drawerCategory.movementType] ??
                    drawerCategory.movementType}
                </Badge>
                <AccountStatusBadge active={!!drawerCategory.meta.active} />
              </span>
            ) : null}
          </span>
        }
        description={t("pages.categories.drawer.hint")}
        widthClassName="w-full max-w-full sm:w-[50vw] sm:max-w-none md:w-[40vw] md:min-w-[620px] md:max-w-[900px]"
        contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4"
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={closeDetails}
            >
              {t("common.close")}
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={!selectedCategoryForEdit}
              onClick={() => {
                if (!selectedCategoryForEdit) return;
                openEditModal(selectedCategoryForEdit);
              }}
            >
              {t("pages.categories.edit")}
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
            const detail = apiErr?.detail;
            if (isDeleteBlockedByUsageMessage(detail)) {
              setDeleteOpen(false);
              setUsageBlockMessage(detail ?? "");
              setUsageBlockOpen(true);
            } else {
              error(detail ?? "Não foi possível excluir a categoria");
            }
          } finally {
            setDeletingCategory(null);
          }
        }}
      />

      <InfoDialog
        open={usageBlockOpen}
        onOpenChange={setUsageBlockOpen}
        title="Não é possível excluir"
        description={usageBlockMessage}
      />
    </>
  );
}
