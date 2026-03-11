"use client";

import { formatCurrency } from "@meufluxo/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  total?: number;
  totalLabel?: string;
  children?: React.ReactNode;
  className?: string;
  /** Conteúdo quando não houver dados (opcional) */
  empty?: boolean;
  emptyMessage?: string;
};

export function ChartCard({
  title,
  total,
  totalLabel,
  children,
  className,
  empty,
  emptyMessage = "Nenhum dado no período",
}: ChartCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
            {total !== undefined && total !== null && (
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {totalLabel ? `${totalLabel}: ` : ""}
              {formatCurrency(total)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(empty && "flex min-h-[240px] items-center justify-center")}>
        {empty ? (
          <p className="text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
