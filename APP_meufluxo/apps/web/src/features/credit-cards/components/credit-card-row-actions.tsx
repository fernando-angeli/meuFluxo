"use client";

import { LayoutDashboard, Pencil, Trash2 } from "lucide-react";

import type { CreditCard } from "@meufluxo/types";

import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function CreditCardRowActions({
  creditCard,
  onOpenManager,
  onEdit,
  onDelete,
  isDeleting,
}: {
  creditCard: CreditCard;
  onOpenManager: (creditCard: CreditCard) => void;
  onEdit: (creditCard: CreditCard) => void;
  onDelete: (creditCard: CreditCard) => void;
  isDeleting?: boolean;
}) {
  const actions: RowActionButtonItem[] = [
    {
      key: "open-manager",
      label: "Visão gerencial",
      icon: LayoutDashboard,
      ariaLabel: "Abrir visão gerencial do cartão",
      iconClassName: "text-sky-600 dark:text-sky-400",
      buttonClassName: "hover:bg-sky-500/10",
      onClick: () => onOpenManager(creditCard),
    },
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      ariaLabel: "Editar cartão",
      onClick: () => onEdit(creditCard),
    },
    {
      key: "delete",
      label: "Excluir cartão",
      icon: Trash2,
      ariaLabel: "Excluir cartão",
      iconClassName: "text-destructive",
      buttonClassName: "hover:bg-destructive/10",
      disabled: isDeleting,
      onClick: () => onDelete(creditCard),
    },
  ];

  return <RowActionButtons actions={actions} density="default" />;
}
