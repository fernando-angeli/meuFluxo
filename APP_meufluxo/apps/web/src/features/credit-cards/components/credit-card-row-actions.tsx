"use client";

import { Pencil, Power, PowerOff } from "lucide-react";

import type { CreditCard } from "@meufluxo/types";

import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function CreditCardRowActions({
  creditCard,
  onEdit,
  onToggleActive,
  isToggling,
}: {
  creditCard: CreditCard;
  onEdit: (creditCard: CreditCard) => void;
  onToggleActive: (creditCard: CreditCard) => void;
  isToggling?: boolean;
}) {
  const isActive = !!creditCard.meta.active;

  const actions: RowActionButtonItem[] = [
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      ariaLabel: "Editar cartão",
      onClick: () => onEdit(creditCard),
    },
    {
      key: "toggle-active",
      label: isActive ? "Inativar" : "Ativar",
      icon: isActive ? PowerOff : Power,
      ariaLabel: isActive ? "Inativar cartão" : "Ativar cartão",
      disabled: isToggling,
      onClick: () => onToggleActive(creditCard),
    },
  ];

  return <RowActionButtons actions={actions} density="default" />;
}
