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

import type {
  DashboardCategoryKpi,
  DashboardSubCategoryKpi,
} from "@meufluxo/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

type SubChartItem = {
  name: string;
  value: number;
  percent: number;
  subCategoryId: number;
};

function buildSubChartData(
  subCategories: DashboardSubCategoryKpi[],
): SubChartItem[] {
  return subCategories.map((s) => ({
    name: s.subCategoryName,
    value: s.total,
    percent: s.percent,
    subCategoryId: s.subCategoryId,
  }));
}

type CategoryDrillDownModalProps = {
  category: DashboardCategoryKpi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel?: string;
};

export function CategoryDrillDownModal({
  category,
  open,
  onOpenChange,
  periodLabel,
}: CategoryDrillDownModalProps) {
  const [selectedSubId, setSelectedSubId] = React.useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!open) setSelectedSubId(null);
  }, [open]);

  const hasSubcategories =
    category?.subCategories && category.subCategories.length > 0;
  const subChartData = hasSubcategories
    ? buildSubChartData(category!.subCategories)
    : [];

  const handleSliceClick = React.useCallback(
    (payload: unknown) => {
      const item = payload as SubChartItem | undefined;
      if (item?.subCategoryId == null) return;
      setSelectedSubId((prev) =>
        prev === item.subCategoryId ? null : item.subCategoryId,
      );
    },
    [],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhamento da categoria</DialogTitle>
          {periodLabel && (
            <DialogDescription>{periodLabel}</DialogDescription>
          )}
        </DialogHeader>
        {category && (
          <div className="space-y-4">
            <p className="font-medium text-foreground">{category.categoryName}</p>
            {!hasSubcategories ? (
              <p className="py-8 text-center text-muted-foreground text-sm">
                Nenhuma subcategoria com movimentação neste período.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-[1fr,auto]">
                <div className="min-h-[220px]">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={subChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                        paddingAngle={2}
                        stroke="var(--card)"
                        strokeWidth={2}
                        label={(props) => {
                          const name = props.name ?? "";
                          const p =
                            "percent" in props
                              ? (props.percent as number)
                              : undefined;
                          return p != null ? `${name} ${p}%` : name;
                        }}
                        labelLine={false}
                        cursor="pointer"
                        onClick={handleSliceClick}
                        onMouseEnter={(_, index) => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {subChartData.map((entry, index) => {
                          const isSelected = selectedSubId === entry.subCategoryId;
                          return (
                            <Cell
                              key={`cell-${entry.subCategoryId}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                              stroke={isSelected ? "hsl(var(--primary))" : "var(--card)"}
                              strokeWidth={isSelected ? 3 : 2}
                              style={{
                                opacity:
                                  hoveredIndex === null || hoveredIndex === index
                                    ? 1
                                    : 0.7,
                                cursor: "pointer",
                                filter:
                                  isSelected
                                    ? "brightness(1.12)"
                                    : hoveredIndex === index
                                      ? "brightness(1.05)"
                                      : undefined,
                              }}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(Number(value ?? 0))
                        }
                        contentStyle={{
                          borderRadius: "var(--radius)",
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                      <Legend
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        formatter={(value, entry) => {
                          const payload = entry?.payload as SubChartItem | undefined;
                          const id = payload?.subCategoryId;
                          const selected = id != null && selectedSubId === id;
                          return (
                            <button
                              type="button"
                              className={cn(
                                "inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-sm transition-colors",
                                selected
                                  ? "font-medium text-primary"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                              )}
                              onClick={() =>
                                setSelectedSubId((prev) =>
                                  prev === id ? null : id ?? null,
                                )
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
                </div>
                <ScrollArea className="h-[220px] w-[220px] rounded-lg border">
                  <ul className="p-2 space-y-0.5">
                    {category.subCategories.map((sub) => {
                      const isSelected = selectedSubId === sub.subCategoryId;
                      return (
                        <li key={sub.subCategoryId}>
                          <button
                            type="button"
                            className={cn(
                              "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                              "hover:bg-accent/60",
                              isSelected &&
                                "bg-primary/10 text-primary font-medium",
                            )}
                            onClick={() =>
                              setSelectedSubId((prev) =>
                                prev === sub.subCategoryId
                                  ? null
                                  : sub.subCategoryId,
                              )
                            }
                          >
                            <span className="truncate">{sub.subCategoryName}</span>
                            <span className="shrink-0 tabular-nums">
                              {formatCurrency(sub.total)}
                            </span>
                          </button>
                          <div className="flex justify-end pr-2 text-xs text-muted-foreground tabular-nums">
                            {sub.percent}%
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </div>
            )}
            {hasSubcategories && (
              <div className="flex justify-between border-t pt-3 font-medium">
                <span className="text-muted-foreground">Total da categoria</span>
                <span className="tabular-nums">
                  {formatCurrency(category.total)}
                </span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
