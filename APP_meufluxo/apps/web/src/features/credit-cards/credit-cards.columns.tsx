"use client";

import type { ReactNode } from "react";

import type { CreditCard } from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";
import { getCardBrandLabel } from "@/constants/card-brands";

import type { DataTableColumn } from "@/components/data-table/types";
import { AccountStatusBadge } from "@/features/accounts/components/account-status-badge";

export function getCreditCardsTableColumns({
  currency,
  renderActions,
}: {
  currency: "BRL" | "USD" | "EUR";
  renderActions: (creditCard: CreditCard) => ReactNode;
}): Array<DataTableColumn<CreditCard>> {
  return [
    {
      key: "name",
      title: "Nome",
      dataIndex: "name",
      sortable: true,
      sortKey: "name",
      cellClassName: "font-medium",
    },
    {
      key: "brand",
      title: "Bandeira",
      sortable: true,
      sortKey: "brand",
      render: (card) => getCardBrandLabel(card.brand ?? card.brandCard) ?? "—",
    },
    {
      key: "closingDay",
      title: "Fechamento",
      sortable: true,
      sortKey: "closingDay",
      align: "center",
      render: (card) => `Dia ${card.closingDay}`,
      cellClassName: "tabular-nums",
    },
    {
      key: "dueDay",
      title: "Vencimento",
      sortable: true,
      sortKey: "dueDay",
      align: "center",
      render: (card) => `Dia ${card.dueDay}`,
      cellClassName: "tabular-nums",
    },
    {
      key: "creditLimit",
      title: "Limite",
      sortable: true,
      sortKey: "creditLimit",
      align: "right",
      render: (card) =>
        card.creditLimit != null ? formatCurrency(card.creditLimit, currency) : "—",
      cellClassName: "tabular-nums",
    },
    {
      key: "defaultPaymentAccountName",
      title: "Conta padrão de pagamento",
      sortable: true,
      sortKey: "defaultPaymentAccountName",
      render: (card) => card.defaultPaymentAccountName?.trim() || "—",
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      sortKey: "active",
      render: (card) => <AccountStatusBadge active={!!card.meta.active} />,
    },
    {
      key: "actions",
      title: "Ações",
      align: "right",
      width: 110,
      cellClassName: "text-right",
      render: (card) => renderActions(card),
    },
  ];
}
