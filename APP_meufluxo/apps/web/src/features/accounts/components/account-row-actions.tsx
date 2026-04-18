"use client";

import { LayoutDashboard, Pencil, Trash2 } from "lucide-react";

import type { Account } from "@meufluxo/types";

import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function AccountRowActions({
  account,
  onEdit,
  onDelete,
  onOpenManager,
  isDeleting,
}: {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onOpenManager: (account: Account) => void;
  isDeleting?: boolean;
}) {
  const actions: RowActionButtonItem[] = [
    {
      key: "open-manager",
      label: "Abrir visão gerencial",
      icon: LayoutDashboard,
      ariaLabel: "Abrir visão gerencial da conta",
      onClick: () => onOpenManager(account),
    },
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      ariaLabel: "Editar conta",
      onClick: () => onEdit(account),
    },
    {
      key: "delete",
      label: "Excluir",
      icon: Trash2,
      ariaLabel: "Excluir conta",
      disabled: isDeleting,
      onClick: () => onDelete(account),
    },
  ];

  return <RowActionButtons actions={actions} className="gap-2" />;
}
