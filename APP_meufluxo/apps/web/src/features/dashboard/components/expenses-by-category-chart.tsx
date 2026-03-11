"use client";

import * as React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { formatCurrency } from "@meufluxo/utils";

import type { DashboardCategoryKpi } from "@meufluxo/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryDetailModal } from "./category-detail-modal";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

type ChartDataItem = {
  name: string;
  value: number;
  percent: number;
  categoryId: number;
};

type ExpensesByCategoryChartProps = {
  data: DashboardCategoryKpi[];
  title?: string;
  /** Período para exibir no modal (ex.: "01/03/2026 - 31/03/2026") */
  periodLabel?: string;
};

function buildChartData(categories: DashboardCategoryKpi[]): ChartDataItem[] {
  return categories.map((c) => ({
    name: c.categoryName,
    value: c.total,
    percent: c.percent,
    categoryId: c.categoryId,
  }));
}

export function ExpensesByCategoryChart({
  data,
  title = "Despesas por categoria",
  periodLabel,
}: ExpensesByCategoryChartProps) {
  const [selectedCategory, setSelectedCategory] =
    React.useState<DashboardCategoryKpi | null>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const chartData = buildChartData(data);

  const handleCategorySelect = React.useCallback(
    (categoryId: number) => {
      const category = data.find((c) => c.categoryId === categoryId);
      if (category) {
        setSelectedCategory(category);
        setModalOpen(true);
      }
    },
    [data],
  );

  const handleCloseModal = React.useCallback(() => {
    setModalOpen(false);
    setSelectedCategory(null);
  }, []);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[280px] items-center justify-center text-muted-foreground">
          Nenhuma despesa no período
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
                label={(props) => {
                  const name = props.name ?? "";
                  const percent =
                    "percent" in props ? (props.percent as number) : undefined;
                  return percent != null ? `${name} ${percent}%` : name;
                }}
                labelLine={false}
                cursor="pointer"
                onClick={(payload: unknown) => {
                  const item = payload as ChartDataItem | undefined;
                  if (item?.categoryId != null) {
                    handleCategorySelect(item.categoryId);
                  }
                }}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.categoryId}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    style={{
                      opacity:
                        hoveredIndex === null || hoveredIndex === index
                          ? 1
                          : 0.7,
                      cursor: "pointer",
                      filter:
                        hoveredIndex === index
                          ? "brightness(1.05)"
                          : undefined,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
                contentStyle={{
                  borderRadius: "var(--radius)",
                  border: "1px solid hsl(var(--border))",
                }}
                labelFormatter={(name, payload) => {
                  const first = Array.isArray(payload) ? payload[0] : undefined;
                  const percent =
                    first &&
                    typeof first === "object" &&
                    "payload" in first &&
                    first.payload
                      ? (first.payload as { percent?: number })?.percent
                      : undefined;
                  return percent != null ? `${name} (${percent}%)` : String(name);
                }}
              />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                formatter={(value, entry) => {
                  const payload = entry?.payload as ChartDataItem | undefined;
                  const categoryId = payload?.categoryId;
                  return (
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                      onClick={() =>
                        categoryId != null && handleCategorySelect(categoryId)
                      }
                    >
                      {value}{" "}
                      {payload?.percent != null && `(${payload.percent}%)`}
                    </button>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <CategoryDetailModal
        category={selectedCategory}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedCategory(null);
        }}
        periodLabel={periodLabel}
      />
    </>
  );
}
