"use client";

import type { ReactNode } from "react";

import type { Category, MovementType } from "@meufluxo/types";
import { TRANSACTION_MOVEMENT_TYPE_LABELS } from "@meufluxo/types";

import type { DataTableColumn } from "@/components/data-table/types";
import { cn } from "@/lib/utils";

import { AccountStatusBadge } from "@/features/accounts/components/account-status-badge";

function movementLabel(type: MovementType) {
  return TRANSACTION_MOVEMENT_TYPE_LABELS[type] ?? type;
}

/** Bolinha + texto (receita verde, despesa vermelha), alinhado ao padrão de status com indicador. */
function CategoryMovementTypeCell({ type }: { type: MovementType }) {
  const label = movementLabel(type);
  const dotClass =
    type === "INCOME"
      ? "bg-emerald-500 dark:bg-emerald-400"
      : type === "EXPENSE"
        ? "bg-rose-600 dark:bg-rose-500"
        : "bg-muted-foreground/60";
  return (
    <span className="inline-flex items-center gap-2.5 text-foreground">
      <span
        className={cn("h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/5 dark:ring-white/10", dotClass)}
        aria-hidden
      />
      <span className="text-sm leading-none">{label}</span>
    </span>
  );
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
      render: (c) => <CategoryMovementTypeCell type={c.movementType} />,
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
