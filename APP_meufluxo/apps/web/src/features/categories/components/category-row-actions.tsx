"use client";

import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";

import type { Category } from "@meufluxo/types";

import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function CategoryRowActions({
  category,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  isDeleting,
}: {
  category: Category;
  expanded: boolean;
  onToggleExpand: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isDeleting?: boolean;
}) {
  const ExpandIcon = expanded ? ChevronDown : ChevronRight;

  const actions: RowActionButtonItem[] = [
    {
      key: "expand",
      label: "Subcategorias",
      icon: ExpandIcon,
      ariaLabel: expanded ? "Recolher subcategorias" : "Ver subcategorias",
      onClick: () => onToggleExpand(category),
    },
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
