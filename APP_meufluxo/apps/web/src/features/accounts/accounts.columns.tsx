"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReactNode } from "react";

import type { Account } from "@meufluxo/types";
import { getAccountTypeLabel } from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";

import type { DataTableColumn } from "@/components/data-table/types";

import { AccountStatusBadge } from "./components/account-status-badge";

export function getAccountsTableColumns({
  currency,
  renderActions,
}: {
  currency: "BRL" | "USD" | "EUR";
  renderActions: (account: Account) => ReactNode;
}): Array<DataTableColumn<Account>> {
  return [
    {
      key: "name",
      title: "Nome",
      dataIndex: "name",
      sortable: true,
      sortKey: "name",
      align: "left",
      cellClassName: "font-medium",
    },
    {
      key: "accountType",
      title: "Tipo",
      sortable: true,
      sortKey: "accountType",
      render: (acc) => getAccountTypeLabel(acc.accountType),
      cellClassName: "text-muted-foreground",
    },
    {
      key: "currentBalance",
      title: "Saldo atual",
      sortable: true,
      sortKey: "currentBalance",
      align: "right",
      render: (acc) => (
        <span className="tabular-nums">{formatCurrency(acc.currentBalance, currency)}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      align: "left",
      render: (acc) => <AccountStatusBadge active={!!acc.meta.active} />,
    },
    {
      key: "updatedAt",
      title: "Saldo atualizado em",
      sortable: true,
      sortKey: "balanceUpdatedAt",
      align: "left",
      render: (acc) => {
        try {
          return format(parseISO(acc.balanceUpdatedAt), "dd/MM/yyyy HH:mm", {
            locale: ptBR,
          });
        } catch {
          return acc.balanceUpdatedAt;
        }
      },
    },
    {
      key: "actions",
      title: "Ações",
      align: "right",
      width: 96,
      cellClassName: "text-right",
      render: (acc) => renderActions(acc),
    },
  ];
}

