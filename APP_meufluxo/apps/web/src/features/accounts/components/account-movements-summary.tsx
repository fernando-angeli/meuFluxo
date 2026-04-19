"use client";

import { formatCurrency } from "@meufluxo/utils";

import { KpiCard } from "@/features/dashboard";
import { SectionErrorState, SectionLoadingState } from "@/components/patterns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountMovementsSummary({
  currency,
  totalIncome,
  totalExpense,
  loading,
  errorMessage,
}: {
  currency: "BRL" | "USD" | "EUR";
  totalIncome: number;
  totalExpense: number;
  loading: boolean;
  errorMessage: string | null;
}) {
  const net = totalIncome - totalExpense;

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Resumo financeiro do período</CardTitle>
        <p className="text-sm text-muted-foreground">
          Valores conforme categoria, subcategoria e intervalo selecionados nos filtros.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SectionLoadingState message="Calculando totais do período..." />
        ) : errorMessage ? (
          <SectionErrorState message={errorMessage} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard title="Entradas no período" value={formatCurrency(totalIncome, currency)} tone="success" />
            <KpiCard title="Saídas no período" value={formatCurrency(totalExpense, currency)} tone="danger" />
            <KpiCard
              title="Saldo líquido do período"
              value={formatCurrency(net, currency)}
              tone={net >= 0 ? "success" : "danger"}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
