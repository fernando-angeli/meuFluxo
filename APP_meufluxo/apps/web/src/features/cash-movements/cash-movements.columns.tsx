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

function intlLocaleForCurrency(currency: "BRL" | "USD" | "EUR") {
  return currency === "BRL" ? "pt-BR" : "en-US";
}

function formatSignedCurrency(signed: number, currency: "BRL" | "USD" | "EUR") {
  return new Intl.NumberFormat(intlLocaleForCurrency(currency), {
    style: "currency",
    currency,
    signDisplay: "always",
  }).format(signed);
}

function signedAmountClass(signed: number) {
  if (signed > 0) return "text-emerald-600 dark:text-emerald-400";
  if (signed < 0) return "text-destructive";
  return "text-muted-foreground";
}

export type GetCashMovementsColumnsOptions = {
  currency?: "BRL" | "USD" | "EUR";
  /** Extrato da conta: valor com sinal/cor e coluna de saldo após cada lançamento. */
  accountStatement?: {
    runningBalanceById: ReadonlyMap<string, number>;
    runningBalancesLoading?: boolean;
  };
};

export function getCashMovementsColumns(
  opts?: GetCashMovementsColumnsOptions,
): Array<DataTableColumn<CashMovementListItem>> {
  const currency = opts?.currency ?? "BRL";
  const stmt = opts?.accountStatement;

  const amountColumn: DataTableColumn<CashMovementListItem> = {
    key: "amount",
    title: "Valor",
    align: "right",
    width: 140,
    cellClassName: "tabular-nums whitespace-nowrap",
    render: (row) => {
      if (stmt) {
        const signed = row.movementType === "INCOME" ? row.amount : -Math.abs(row.amount);
        return (
          <span className={signedAmountClass(signed)}>{formatSignedCurrency(signed, currency)}</span>
        );
      }
      return formatMoney(row.amount);
    },
  };

  const base: Array<DataTableColumn<CashMovementListItem>> = [
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
      render: (row) => row.description || "—",
      width: 300,
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
  ];

  if (!stmt) {
    return [...base, amountColumn];
  }

  const balanceColumn: DataTableColumn<CashMovementListItem> = {
    key: "runningBalance",
    title: "Saldo",
    align: "right",
    width: 160,
    cellClassName: "tabular-nums whitespace-nowrap",
    render: (row) => {
      if (stmt.runningBalancesLoading) {
        return <span className="text-muted-foreground">…</span>;
      }
      const b = stmt.runningBalanceById.get(row.id);
      if (b === undefined) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <span className={signedAmountClass(b)}>{formatSignedCurrency(b, currency)}</span>
      );
    },
  };

  return [...base, amountColumn, balanceColumn];
}
