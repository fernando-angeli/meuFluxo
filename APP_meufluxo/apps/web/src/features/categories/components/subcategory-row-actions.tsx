"use client";

import { Pencil, Trash2 } from "lucide-react";

import type { SubCategory } from "@meufluxo/types";

import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function SubcategoryRowActions({
  subcategory,
  onEdit,
  onDelete,
  isDeleting,
}: {
  subcategory: SubCategory;
  onEdit: (s: SubCategory) => void;
  onDelete: (s: SubCategory) => void;
  isDeleting?: boolean;
}) {
  const actions: RowActionButtonItem[] = [
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      ariaLabel: "Editar subcategoria",
      onClick: () => onEdit(subcategory),
    },
    {
      key: "delete",
      label: "Excluir",
      icon: Trash2,
      ariaLabel: "Excluir subcategoria",
      disabled: isDeleting,
      onClick: () => onDelete(subcategory),
    },
  ];

  return <RowActionButtons actions={actions} density="compact" />;
}
