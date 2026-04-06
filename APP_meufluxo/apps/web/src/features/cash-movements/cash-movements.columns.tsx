"use client";

import type { DataTableColumn } from "@/components/data-table/types";
import type { CashMovementListItem } from "./cash-movements-list.service";

function formatDate(value: string) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mapOriginLabel(sourceType?: string | null): string {
  if (!sourceType) return "—";
  if (sourceType === "PAYABLE") return "Conta a pagar";
  if (sourceType === "RECEIVABLE") return "Conta a receber";
  if (sourceType === "MANUAL") return "Manual";
  if (sourceType === "CARD") return "Cartão";
  if (sourceType === "TRANSFER") return "Transferência";
  return sourceType;
}

export function getCashMovementsColumns(): Array<DataTableColumn<CashMovementListItem>> {
  return [
    {
      key: "occurredAt",
      title: "Data",
      sortable: true,
      sortKey: "occurredAt",
      render: (row) => formatDate(row.occurredAt),
      width: 120,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "description",
      title: "Descrição",
      sortable: true,
      sortKey: "description",
      render: (row) => row.description || "—",
      cellClassName: "font-medium",
    },
    {
      key: "accountName",
      title: "Conta",
      render: (row) => row.accountName,
    },
    {
      key: "categoryName",
      title: "Categoria",
      render: (row) => row.categoryName,
    },
    {
      key: "subCategoryName",
      title: "Subcategoria",
      render: (row) => row.subCategoryName,
    },
    {
      key: "movementType",
      title: "Tipo",
      sortable: true,
      sortKey: "movementType",
      render: (row) => (row.movementType === "INCOME" ? "Entrada" : "Saída"),
      width: 100,
    },
    {
      key: "amount",
      title: "Valor",
      sortable: true,
      sortKey: "amount",
      align: "right",
      width: 140,
      cellClassName: "tabular-nums whitespace-nowrap",
      render: (row) => formatMoney(row.amount),
    },
    {
      key: "sourceType",
      title: "Origem",
      render: (row) => mapOriginLabel(row.sourceType),
      width: 150,
    },
  ];
}
