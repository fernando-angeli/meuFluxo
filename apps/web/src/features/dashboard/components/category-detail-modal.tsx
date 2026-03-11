"use client";

import { formatCurrency } from "@meufluxo/utils";

import type { DashboardCategoryKpi } from "@meufluxo/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type CategoryDetailModalProps = {
  category: DashboardCategoryKpi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Período aplicado (ex.: "01/03/2026 - 31/03/2026") para exibir como subtítulo */
  periodLabel?: string;
};

export function CategoryDetailModal({
  category,
  open,
  onOpenChange,
  periodLabel,
}: CategoryDetailModalProps) {
  const hasSubcategories =
    category?.subCategories && category.subCategories.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="max-w-md">
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
              <p className="py-6 text-center text-muted-foreground text-sm">
                Nenhuma subcategoria com movimentação neste período.
              </p>
            ) : (
              <>
                <div className="rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          Subcategoria
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                          Valor
                        </th>
                        <th className="w-14 px-3 py-2 text-right font-medium text-muted-foreground">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.subCategories.map((sub) => (
                        <tr
                          key={sub.subCategoryId}
                          className="border-b last:border-b-0"
                        >
                          <td className="px-3 py-2">{sub.subCategoryName}</td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {formatCurrency(sub.total)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                            {sub.percent}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between border-t pt-3 font-medium">
                  <span className="text-muted-foreground">Total da categoria</span>
                  <span className="tabular-nums">
                    {formatCurrency(category.total)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
