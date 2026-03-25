"use client";

import { Pencil, Trash2 } from "lucide-react";

import type { Category } from "@meufluxo/types";

import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function CategoryRowActions({
  category,
  onEdit,
  onDelete,
  isDeleting,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isDeleting?: boolean;
}) {
  const actions: RowActionButtonItem[] = [
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      ariaLabel: "Editar categoria",
      onClick: () => onEdit(category),
    },
    {
      key: "delete",
      label: "Excluir",
      icon: Trash2,
      ariaLabel: "Excluir categoria",
      disabled: isDeleting,
      onClick: () => onDelete(category),
    },
  ];

  return <RowActionButtons actions={actions} density="default" />;
}
