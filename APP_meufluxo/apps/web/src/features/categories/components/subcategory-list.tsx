"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import type { SubCategory, SortDirection } from "@meufluxo/types";

import { AccountStatusBadge } from "@/features/accounts/components/account-status-badge";
import { SubcategoryRowActions } from "@/features/categories/components/subcategory-row-actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SubcategoryListProps = {
  rows: SubCategory[];
  /** Ordenação por nome (mesmo padrão visual do `DataTable`). */
  nameColumnSort: {
    sortKey: string | null;
    sortField: string;
    direction: SortDirection;
    onSortChange: (sortKey: string) => void;
  };
  /** Quando a categoria pai está inativa, bloqueia edição e exclusão de subcategorias. */
  parentActive: boolean;
  onEdit: (s: SubCategory) => void;
  onDelete: (s: SubCategory) => void;
  deletingId: string | null;
  isDeletePending: boolean;
};

const DESC_PREVIEW = 72;

function truncateDescription(text: string): { short: string; needsTip: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= DESC_PREVIEW) return { short: trimmed || "—", needsTip: false };
  return { short: `${trimmed.slice(0, DESC_PREVIEW)}…`, needsTip: true };
}

/**
 * Tabela compacta de subcategorias (painel da categoria).
 */
export function SubcategoryList({
  rows,
  nameColumnSort,
  parentActive,
  onEdit,
  onDelete,
  deletingId,
  isDeletePending,
}: SubcategoryListProps) {
  const { sortKey, sortField, direction, onSortChange } = nameColumnSort;
  const active = !!sortKey && sortKey === sortField;
  const sortIcon = active ? (
    direction === "asc" ? (
      <ArrowUp className="h-4 w-4 text-foreground" />
    ) : (
      <ArrowDown className="h-4 w-4 text-foreground" />
    )
  ) : (
    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
  );

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full border-separate border-spacing-0 text-xs sm:text-sm">
        <thead>
          <tr className="text-left">
            <th className="border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
              <button
                type="button"
                className="inline-flex items-center gap-2"
                onClick={() => onSortChange(sortField)}
              >
                <span className="truncate">Nome</span>
                {sortIcon}
              </button>
            </th>
            <th className="border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span className="truncate">Descrição</span>
            </th>
            <th className="w-[100px] border-b bg-muted/40 px-2 py-2 text-xs font-medium text-muted-foreground">
              Status
            </th>
            <th className="w-[88px] border-b bg-muted/40 px-2 py-2 text-right text-xs font-medium text-muted-foreground">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((sub) => {
            const rawDesc = sub.description?.trim() ?? "";
            const { short, needsTip } = truncateDescription(rawDesc);
            return (
              <tr
                key={sub.id}
                className="border-b border-border/40 transition-colors last:border-0 hover:bg-accent/25"
              >
                <td className="max-w-[12rem] truncate px-3 py-1.5 font-medium sm:py-2">{sub.name}</td>
                <td className="min-w-0 px-3 py-1.5 sm:py-2">
                  {needsTip && rawDesc ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block max-w-[14rem] cursor-default truncate text-muted-foreground sm:max-w-[18rem]">
                          {short}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-sm whitespace-pre-wrap text-left">
                        {rawDesc}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="block max-w-[14rem] truncate text-muted-foreground sm:max-w-[18rem]">
                      {short}
                    </span>
                  )}
                </td>
                <td className="px-2 py-1.5 sm:py-2">
                  <AccountStatusBadge active={!!sub.meta.active} />
                </td>
                <td className={cn("px-2 py-1 sm:py-1.5")}>
                  <div className="flex justify-end">
                    <SubcategoryRowActions
                      subcategory={sub}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isDeleting={isDeletePending && deletingId === sub.id}
                      editDisabled={!parentActive}
                      deleteDisabled={!parentActive || !sub.meta.active}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
