"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { formatCurrency } from "@meufluxo/utils";

import type {
  DashboardMovementRow,
  DashboardMovementStatus,
} from "@meufluxo/types";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<
  DashboardMovementStatus,
  "success" | "warning" | "muted"
> = {
  paga: "success",
  aberta: "warning",
  projeção: "muted",
};

const STATUS_LABEL: Record<DashboardMovementStatus, string> = {
  paga: "Paga",
  aberta: "Aberta",
  projeção: "Projeção",
};

function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

type DashboardMovementsTableProps = {
  movements: DashboardMovementRow[];
  isLoading?: boolean;
  error?: string | null;
};

export function DashboardMovementsTable({
  movements,
  isLoading,
  error,
}: DashboardMovementsTableProps) {
  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-destructive">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-muted"
                aria-hidden
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma movimentação no período.
          </p>
        </CardContent>
      </Card>
    );
  }

  const columns: Array<{
    key: keyof DashboardMovementRow | "formattedValue";
    header: string;
    className?: string;
    render?: (row: DashboardMovementRow) => React.ReactNode;
  }> = [
    { key: "id", header: "ID", className: "w-20 max-w-[100px] truncate" },
    {
      key: "description",
      header: "Descrição",
      className: "min-w-[120px] max-w-[200px]",
      render: (r) => (
        <TruncateTooltip text={r.description} maxLen={30} />
      ),
    },
    {
      key: "categoryName",
      header: "Categoria",
      className: "max-w-[120px]",
      render: (r) => <TruncateTooltip text={r.categoryName} maxLen={18} />,
    },
    {
      key: "subcategoryName",
      header: "Subcategoria",
      className: "max-w-[120px]",
      render: (r) => <TruncateTooltip text={r.subcategoryName} maxLen={18} />,
    },
    {
      key: "date",
      header: "Data",
      className: "whitespace-nowrap tabular-nums",
      render: (r) => formatDate(r.date),
    },
    {
      key: "formattedValue",
      header: "Valor",
      className: "text-right tabular-nums",
      render: (r) => (
        <span
          className={cn(
            r.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
          )}
        >
          {formatCurrency(r.value)}
        </span>
      ),
    },
    {
      key: "accountName",
      header: "Conta",
      className: "max-w-[120px]",
      render: (r) => <TruncateTooltip text={r.accountName} maxLen={18} />,
    },
    {
      key: "paymentMethod",
      header: "Forma de pagamento",
      className: "max-w-[140px]",
      render: (r) => <TruncateTooltip text={r.paymentMethod} maxLen={22} />,
    },
    {
      key: "status",
      header: "Status",
      className: "whitespace-nowrap",
      render: (r) => (
        <Badge variant={STATUS_VARIANT[r.status]} className="font-normal">
          {STATUS_LABEL[r.status]}
        </Badge>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Movimentações</CardTitle>
        <p className="text-xs text-muted-foreground">
          Listagem detalhada do período
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-muted/40 text-left">
                {columns.map((c) => (
                  <th
                    key={String(c.key)}
                    className={cn(
                      "border-b px-3 py-2.5 text-xs font-medium text-muted-foreground",
                      c.className,
                    )}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-accent/30"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        "border-b border-border/60 px-3 py-2.5",
                        col.className,
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : (row[col.key as keyof DashboardMovementRow] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TruncateTooltip({
  text,
  maxLen,
}: {
  text: string;
  maxLen: number;
}) {
  const truncated =
    text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
  if (text.length <= maxLen) {
    return <span>{text}</span>;
  }
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <span className="cursor-default truncate block">{truncated}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
