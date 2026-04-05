"use client";

import type { ReactNode } from "react";

import type { ExpenseRecord, PlannedEntryStatus } from "@meufluxo/types";
import type { DataTableColumn } from "@/components/data-table/types";
import type { StatusTone } from "@/components/ui/status-indicator";
import { StatusIndicator } from "@/components/ui/status-indicator";

const statusLabel: Record<PlannedEntryStatus, string> = {
  OPEN: "Em aberto",
  OVERDUE: "Em atraso",
  COMPLETED: "Liquidado",
  CANCELED: "Cancelado",
};

const statusTone: Record<PlannedEntryStatus, StatusTone> = {
  OPEN: "info",
  OVERDUE: "critical",
  COMPLETED: "positive",
  CANCELED: "neutral",
};

function formatDate(value: string) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function getExpensesTableColumns({
  categoryNameById,
  subCategoryNameById,
  renderActions,
  labels,
}: {
  categoryNameById: Map<string, string>;
  subCategoryNameById: Map<string, string>;
  renderActions: (row: ExpenseRecord) => ReactNode;
  labels?: Partial<Record<PlannedEntryStatus, string>> & {
    amountTitle?: string;
    overdueTitle?: string;
  };
}): Array<DataTableColumn<ExpenseRecord>> {
  const resolvedStatusLabel = {
    ...statusLabel,
    ...labels,
  };

  return [
    {
      key: "description",
      title: "Descrição",
      dataIndex: "description",
      sortable: true,
      sortKey: "description",
      width: "20%",
      cellClassName: "min-w-[5rem] font-medium",
    },
    {
      key: "document",
      title: "Documento",
      dataIndex: "document",
      render: (row) => (row.document?.trim() ? row.document : "—"),
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "category",
      title: "Categoria",
      sortable: true,
      sortKey: "categoryId",
      render: (row) => categoryNameById.get(row.categoryId) ?? "—",
    },
    {
      key: "subCategory",
      title: "Subcategoria",
      render: (row) => (row.subCategoryId ? subCategoryNameById.get(row.subCategoryId) ?? "—" : "—"),
    },
    {
      key: "expectedAmount",
      title: labels?.amountTitle ?? "Valor",
      sortable: true,
      sortKey: "expectedAmount",
      align: "right",
      width: 132,
      cellClassName: "whitespace-nowrap tabular-nums",
      render: (row) => formatMoney(row.expectedAmount),
    },
    {
      key: "issueDate",
      title: "Emissão",
      sortable: true,
      sortKey: "issueDate",
      render: (row) => formatDate(row.issueDate),
    },
    {
      key: "dueDate",
      title: "Vencimento",
      sortable: true,
      sortKey: "dueDate",
      render: (row) => formatDate(row.dueDate),
    },
    {
      key: "amountBehavior",
      title: "Tipo",
      sortable: true,
      sortKey: "amountBehavior",
      render: (row) => (row.amountBehavior === "FIXED" ? "Fixo" : "Estimado"),
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      sortKey: "status",
      render: (row) => (
        <StatusIndicator
          label={
            row.status === "OVERDUE" && labels?.overdueTitle
              ? labels.overdueTitle
              : resolvedStatusLabel[row.status]
          }
          tone={statusTone[row.status]}
        />
      ),
    },
    {
      key: "actions",
      title: "Ações",
      align: "center",
      width: 144,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => renderActions(row),
    },
  ];
}

