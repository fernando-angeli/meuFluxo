"use client";

import { useState } from "react";

import { formatCurrency } from "@meufluxo/utils";

import type { DashboardCategoryKpi } from "@meufluxo/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { ChevronDown, ChevronRight } from "lucide-react";

type ExpensesByCategoryListProps = {
  data: DashboardCategoryKpi[];
  title?: string;
};

export function ExpensesByCategoryList({
  data,
  title = "Despesas por categoria",
}: ExpensesByCategoryListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggle = (categoryId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Nenhuma despesa no período
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {data.map((cat) => {
            const isExpanded = expandedIds.has(cat.categoryId);
            const hasSubs = cat.subCategories.length > 0;

            return (
              <div key={cat.categoryId} className="rounded-lg border bg-muted/30">
                <button
                  type="button"
                  onClick={() => hasSubs && toggle(cat.categoryId)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                    hasSubs && "cursor-pointer",
                  )}
                >
                  <span className="flex shrink-0 w-5 items-center justify-center text-muted-foreground">
                    {hasSubs ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 font-medium">{cat.categoryName}</span>
                  <span className="shrink-0 tabular-nums font-medium">
                    {formatCurrency(cat.total)}
                  </span>
                  <span className="shrink-0 w-12 text-right text-muted-foreground text-sm tabular-nums">
                    {cat.percent}%
                  </span>
                </button>

                {hasSubs && isExpanded && (
                  <div className="border-t border-border/50 bg-background/50 pl-6 pr-3 pb-2 pt-1">
                    {cat.subCategories.map((sub) => (
                      <div
                        key={sub.subCategoryId}
                        className="flex items-center justify-between gap-2 py-1.5 text-sm"
                      >
                        <span className="text-muted-foreground">{sub.subCategoryName}</span>
                        <span className="tabular-nums">{formatCurrency(sub.total)}</span>
                        <span className="w-10 text-right text-muted-foreground tabular-nums">
                          {sub.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
