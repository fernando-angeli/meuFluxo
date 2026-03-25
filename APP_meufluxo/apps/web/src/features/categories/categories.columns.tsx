"use client";

import type { ReactNode } from "react";

import type { Category, MovementType } from "@meufluxo/types";
import { TRANSACTION_MOVEMENT_TYPE_LABELS } from "@meufluxo/types";

import type { DataTableColumn } from "@/components/data-table/types";

import { AccountStatusBadge } from "@/features/accounts/components/account-status-badge";

function movementLabel(type: MovementType) {
  return TRANSACTION_MOVEMENT_TYPE_LABELS[type] ?? type;
}

export function getCategoriesTableColumns({
  renderActions,
}: {
  renderActions: (category: Category) => ReactNode;
}): Array<DataTableColumn<Category>> {
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
      key: "description",
      title: "Descrição",
      align: "left",
      render: (c) => (
        <span className="text-muted-foreground">
          {c.description?.trim() ? c.description : "—"}
        </span>
      ),
    },
    {
      key: "movementType",
      title: "Tipo",
      sortable: true,
      sortKey: "movementType",
      align: "left",
      render: (c) => (
        <span className="text-muted-foreground">{movementLabel(c.movementType)}</span>
      ),
    },
    {
      key: "subCategoryCount",
      title: "Subcategorias",
      align: "center",
      width: 120,
      render: (c) => (
        <span className="tabular-nums text-muted-foreground">
          {typeof c.subCategoryCount === "number" ? c.subCategoryCount : "—"}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      align: "left",
      render: (c) => <AccountStatusBadge active={!!c.meta.active} />,
    },
    {
      key: "actions",
      title: "Ações",
      align: "right",
      width: 96,
      cellClassName: "text-right",
      render: (c) => renderActions(c),
    },
  ];
}
