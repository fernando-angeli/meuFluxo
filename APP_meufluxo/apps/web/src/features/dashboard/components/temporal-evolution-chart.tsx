"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@meufluxo/utils";

import type { DashboardTemporalSeries } from "@meufluxo/types";

import { ChartCard } from "./chart-card";
import { useTranslation } from "@/lib/i18n";

type TemporalEvolutionChartProps = {
  data: DashboardTemporalSeries;
  /** Se true, força estado vazio (opcional) */
  empty?: boolean;
};

function buildChartData(data: DashboardTemporalSeries) {
  return data.labels.map((label, i) => ({
    period: label,
    entradas: data.income[i] ?? 0,
    saídas: Math.abs(data.expenses[i] ?? 0),
  }));
}

export function TemporalEvolutionChart({
  data,
  empty: forceEmpty,
}: TemporalEvolutionChartProps) {
  const { t } = useTranslation();
  const chartData = buildChartData(data);

  const hasData = chartData.some(
    (d) => (d.entradas ?? 0) > 0 || (d.saídas ?? 0) > 0,
  );

  if (forceEmpty || !data.labels?.length || !hasData) {
    return (
      <ChartCard
        title={t("dashboard.temporalEvolution")}
        empty
        emptyMessage={t("dashboard.noDataInPeriod")}
      />
    );
  }

  return (
    <ChartCard title={t("dashboard.temporalEvolutionFull")}>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              vertical={false}
            />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
              }
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                borderRadius: "var(--radius)",
                border: "1px solid hsl(var(--border))",
              }}
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              labelFormatter={(label) => `Período: ${label}`}
            />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              formatter={(value) => (
                <span className="text-muted-foreground text-sm">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="entradas"
              name="Entradas"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="saídas"
              name="Saídas"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
