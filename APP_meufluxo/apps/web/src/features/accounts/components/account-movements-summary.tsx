"use client";

import { formatCurrency } from "@meufluxo/utils";

import { KpiCard } from "@/features/dashboard";
import { SectionErrorState, SectionLoadingState } from "@/components/patterns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountMovementsSummary({
  currency,
  totalIncome,
  totalExpense,
  currentBalance,
  loading,
  errorMessage,
}: {
  currency: "BRL" | "USD" | "EUR";
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
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
          <div className="grid gap-4 sm:grid-cols-4">
            <KpiCard 
              title="Entradas no período" 
              value={formatCurrency(totalIncome, currency)} 
              tone="success" 
              hint="Total de entradas no período"
            />
            <KpiCard 
              title="Saídas no período" 
              value={formatCurrency(totalExpense, currency)} 
              tone="danger" 
              hint="Total de saídas no período"
            />
            <KpiCard
              title="Saldo do período"
              value={formatCurrency(net, currency)}
              tone={net >= 0 ? "success" : "danger"}
            />  
            <KpiCard
              title="Saldo atual"
              value={formatCurrency(currentBalance, currency)}
              tone={currentBalance >= 0 ? "success" : "danger"}
              hint="Saldo consolidado da conta; não muda com o período filtrado acima."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
