"use client";

import type { DataTableColumn } from "@/components/data-table/types";
import type { CashMovementListItem } from "@/features/cash-movements/cash-movements-list.service";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function formatSignedMoney(row: CashMovementListItem) {
  const v = row.movementType === "INCOME" ? row.amount : -Math.abs(row.amount);
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const PAYMENT_LABEL_PT: Record<string, string> = {
  PIX: "PIX",
  DEBIT: "Cartão de débito",
  DEBIT_CARD: "Cartão de débito",
  CREDIT_CARD: "Cartão de crédito",
  CASH: "Dinheiro",
  TRANSFER: "Transferência",
  BOLETO: "Boleto",
  VA: "Vale alimentação",
  INVOICE_CREDIT_CARD: "Fatura cartão",
  OTHER: "Outro",
};

function paymentLabel(method?: string | null): string {
  if (!method) return "—";
  return PAYMENT_LABEL_PT[method] ?? method;
}

/** Status exibido no dashboard (API não envia campo dedicado; deriva-se de `sourceType`). */
function movementStatusBadge(row: CashMovementListItem) {
  const st = row.sourceType;
  if (st === "PAYABLE" || st === "RECEIVABLE") {
    return (
      <Badge variant="warning" className="font-normal">
        Aberta
      </Badge>
    );
  }
  return (
    <Badge variant="success" className="font-normal">
      Paga
    </Badge>
  );
}

export function getDashboardMovementsColumns(): Array<DataTableColumn<CashMovementListItem>> {
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
      key: "amount",
      title: "Valor",
      sortable: true,
      sortKey: "amount",
      align: "right",
      width: 140,
      cellClassName: "tabular-nums whitespace-nowrap",
      render: (row) => (
        <span
          className={
            row.movementType === "INCOME"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          }
        >
          {formatSignedMoney(row)}
        </span>
      ),
    },
    {
      key: "accountName",
      title: "Conta",
      render: (row) => row.accountName,
    },
    {
      key: "paymentMethod",
      title: "Forma de pagamento",
      render: (row) => paymentLabel(row.paymentMethod),
      width: 160,
    },
    {
      key: "status",
      title: "Status",
      render: (row) => movementStatusBadge(row),
      width: 120,
      cellClassName: "whitespace-nowrap",
    },
  ];
}
