"use client";

import { Pencil, Trash2 } from "lucide-react";

import type { SubCategory } from "@meufluxo/types";

import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function SubcategoryRowActions({
  subcategory,
  onEdit,
  onDelete,
  isDeleting,
  editDisabled,
  deleteDisabled,
}: {
  subcategory: SubCategory;
  onEdit: (s: SubCategory) => void;
  onDelete: (s: SubCategory) => void;
  isDeleting?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
}) {
  const actions: RowActionButtonItem[] = [
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      ariaLabel: "Editar subcategoria",
      disabled: editDisabled,
      onClick: () => onEdit(subcategory),
    },
    {
      key: "delete",
      label: "Excluir",
      icon: Trash2,
      ariaLabel: "Excluir subcategoria",
      disabled: deleteDisabled || isDeleting,
      onClick: () => onDelete(subcategory),
    },
  ];

  return <RowActionButtons actions={actions} density="compact" />;
}
